import { StackProps } from "aws-cdk-lib";
import {
  OAuthScope,
  StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolDomain,
  UserPoolOperation,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import SsmContruct from "./ssm";
import { Function as LambdaFunction } from "aws-cdk-lib/aws-lambda";

export interface CognitoConstructProps extends StackProps {
  environment: string;
}

export default class CognitoConstruct extends Construct {
  private readonly userPool: UserPool;
  private readonly userPoolClient: UserPoolClient;
  private readonly userPoolDomain: UserPoolDomain;
  private readonly callbackUrls: string[];
  private readonly logoutUrls: string[];
  private readonly parameterArns: string[];
  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    const authParameterStore = new SsmContruct(this, "AuthParameterStore", {});

    const devUrls = ["http://localhost:3000", "https://web-dev.mstacm.org"];

    const prodUrls = ["https://web.mstacm.org"];

    this.callbackUrls =
      props.environment === "prod"
        ? this.constructCallbackUrls(prodUrls)
        : this.constructCallbackUrls(devUrls);

    this.logoutUrls = props.environment === "prod" ? prodUrls : devUrls;

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
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
        // You can configure other standard attributes similarly
      },
      customAttributes: {
        role: new StringAttribute({ mutable: true }),
      },
    });

    // this.userPoolDomain = this.userPool.addDomain("MstacmCognitoDomain", {
    //   cognitoDomain: {
    //     domainPrefix: `mstacm-${props.environment}-auth`,
    //   },
    // });

    this.userPoolClient = this.userPool.addClient("MstacmUserPoolClient");

    const ssmParameters = [
      // { name: "authDomain", value: this.userPoolDomain.domainName },
      { name: "userPoolId", value: this.userPool.userPoolId },
      {
        name: "userPoolWebClientId",
        value: this.userPoolClient.userPoolClientId,
      },
      // { name: "redirectSignIn", value: this.callbackUrls[0] },
      // { name: "redirectSignOut", value: this.logoutUrls[0] },
    ];

    ssmParameters.forEach((param) => {
      authParameterStore.createParameter(param.name, param.value);
    });

    this.parameterArns = authParameterStore.parameterArns;
  }

  public get authParameterArns(): string[] {
    return this.parameterArns;
  }

  public get getArn(): string {
    return this.userPool.userPoolArn;
  }
  public addPostTrigger(lambdaFunction: LambdaFunction) {
    this.userPool.addTrigger(
      UserPoolOperation.POST_CONFIRMATION,
      lambdaFunction
    );
  }
  private constructCallbackUrls(urls: string[]): string[] {
    const callbackUrls: string[] = [];
    urls.forEach((url) => {
      callbackUrls.push(url + "/auth/callback");
    });
    return callbackUrls;
  }
}
