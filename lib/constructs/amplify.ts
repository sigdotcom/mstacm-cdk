import { App, GitHubSourceCodeProvider } from "@aws-cdk/aws-amplify-alpha";
import { SecretValue, StackProps } from "aws-cdk-lib";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface AmplifyConstructProps extends StackProps {
  environment: string;
  parameterArns: string[];
}

export default class AmplifyConstruct extends Construct {
  private readonly mstacmAmplifyFrontend: App;

  constructor(scope: Construct, id: string, props: AmplifyConstructProps) {
    super(scope, id);

    const oauthTokenSecretName: string = `GITHUB_TOKEN_${props.environment.toUpperCase()}`;
    const oauthToken: SecretValue = SecretValue.secretsManager(
      oauthTokenSecretName,
      {
        jsonField: "GITHUB_TOKEN_KEY",
      }
    );

    const domainName =
      props.environment === "prod" ? "web.mstacm.org" : "dev.web.mstacm.org";

    const amplifyServiceRole = new Role(this, "AmplifyServiceRole", {
      assumedBy: new ServicePrincipal("amplify.amazonaws.com"),
    });

    // Grant permissions to read from the created SSM parameters
    amplifyServiceRole.addToPolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: props.parameterArns,
      })
    );

    this.mstacmAmplifyFrontend = new App(this, "MstacmAmplifyFrontend", {
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: "sigdotcom",
        repository: "mstacm-frontend",
        oauthToken: oauthToken,
      }),
      role: amplifyServiceRole,
    });

    this.mstacmAmplifyFrontend.addDomain(domainName);

    if (props.environment === "prod") {
      const masterBranch = this.mstacmAmplifyFrontend.addBranch("main");
    } else {
      const devBranch = this.mstacmAmplifyFrontend.addBranch("dev");
    }
  }
}
