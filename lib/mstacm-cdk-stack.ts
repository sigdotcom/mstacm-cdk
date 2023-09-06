import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { App, GitHubSourceCodeProvider } from "@aws-cdk/aws-amplify-alpha";
import { Construct } from "constructs";

export class MstacmCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const environment: string =
      this.node.tryGetContext("environment") || "prod";
    const oauthTokenSecretName: string = `GITHUB_TOKEN_${environment.toUpperCase()}`;
    const oauthToken: SecretValue = SecretValue.secretsManager(
      oauthTokenSecretName,
      {
        jsonField: "GITHUB_TOKEN_KEY",
      }
    );

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
