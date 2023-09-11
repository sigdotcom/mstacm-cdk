import { StackProps } from "aws-cdk-lib";
import {
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolDomain,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import SsmContruct from "./ssm";

export interface CognitoConstructProps extends StackProps {
  environment: string;
}

export default class CognitoConstruct extends Construct {
  private readonly userPool: UserPool;
  private readonly userPoolClient: UserPoolClient;
  private readonly userPoolDomain: UserPoolDomain;
  private readonly parameterArns: string[];
  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    const authParameterStore = new SsmContruct(this, "AuthParameterStore", {});

    const callbackUrl: string =
      props.environment === "prod"
        ? "https://web.mstacm.org/auth/callback"
        : "http://localhost:3000/auth/callback";

    const logoutUrl: string =
      props.environment === "prod"
        ? "https://web.mstacm.org/"
        : "http://localhost:3000/";

    this.userPool = new UserPool(this, "MstacmUserPool", {
      userPoolName: `Mstacm-${props.environment}-UserPool`,
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInAliases: { email: true },
      signInCaseSensitive: false,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    this.userPoolDomain = this.userPool.addDomain("MstacmCognitoDomain", {
      cognitoDomain: {
        domainPrefix: `mstacm-${props.environment}-auth`,
      },
    });

    this.userPoolClient = this.userPool.addClient("MstacmUserPoolClient", {
      oAuth: {
        callbackUrls: [callbackUrl],
        logoutUrls: [logoutUrl],
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: [OAuthScope.OPENID],
      },
    });

    const ssmParameters = [
      { name: "authDomain", value: this.userPoolDomain.domainName },
      { name: "userPoolId", value: this.userPool.userPoolId },
      {
        name: "userPoolWebClientId",
        value: this.userPoolClient.userPoolClientId,
      },
      { name: "redirectSignIn", value: callbackUrl },
      { name: "redirectSignOut", value: logoutUrl },
    ];

    ssmParameters.forEach((param) => {
      authParameterStore.createParameter(param.name, param.value);
    });

    this.parameterArns = authParameterStore.parameterArns;
  }

  public get authParameterArns(): string[] {
    return this.parameterArns;
  }
}
