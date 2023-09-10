import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { App, GitHubSourceCodeProvider } from "@aws-cdk/aws-amplify-alpha";
import { Construct } from "constructs";
import { OAuthScope, UserPool } from "aws-cdk-lib/aws-cognito";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class MstacmCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const environment: string = this.node.tryGetContext("environment") || "dev";
    const oauthTokenSecretName: string = `GITHUB_TOKEN_${environment.toUpperCase()}`;
    const oauthToken: SecretValue = SecretValue.secretsManager(
      oauthTokenSecretName,
      {
        jsonField: "GITHUB_TOKEN_KEY",
      }
    );

    const callbackUrl: string =
      environment === "prod"
        ? "https://web.mstacm.org/auth/callback"
        : "http://localhost:3000/auth/callback";

    const logoutUrl: string =
      environment === "prod"
        ? "https://web.mstacm.org/"
        : "http://localhost:3000/";

    const userPool = new UserPool(this, "MstacmUserPool", {
      userPoolName: `Mstacm-${environment}-UserPool`,
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

    const userPoolDomain = userPool.addDomain("MstacmCognitoDomain", {
      cognitoDomain: {
        domainPrefix: "mstacm-auth", // This should be unique
      },
    });

    const userPoolClient = userPool.addClient("MstacmUserPoolClient", {
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

    new StringParameter(this, "AuthDomainParameter", {
      parameterName: "authDomain",
      stringValue: userPoolDomain.domainName,
      description: "",
    });

    new StringParameter(this, "UserPoolIdParameter", {
      parameterName: "userPoolId",
      stringValue: userPool.userPoolId,
      description: "",
    });

    new StringParameter(this, "UserPoolWebClientIdParameter", {
      parameterName: "userPoolWebClientId",
      stringValue: userPoolClient.userPoolClientId,
      description: "",
    });

    new StringParameter(this, "RedirectSignInParameter", {
      parameterName: "redirectSignIn",
      stringValue: callbackUrl,
      description: "",
    });

    new StringParameter(this, "RedirectSignOutParameter", {
      parameterName: "redirectSignOut",
      stringValue: logoutUrl,
      description: "",
    });

    const mstacmAmplifyFrontend = new App(this, "MstacmFrontend", {
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: "sigdotcom",
        repository: "mstacm-frontend",
        oauthToken: oauthToken,
      }),
    });

    const masterBranch = mstacmAmplifyFrontend.addBranch("main");
  }
}
