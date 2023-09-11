import { Stack, StackProps } from "aws-cdk-lib";
import { AmplifyConstruct, CognitoConstruct } from "./constructs";
import { Construct } from "constructs";

export class MstacmCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const environment: string = this.node.tryGetContext("environment") || "dev";
    console.log(environment);
    const rootDomain = "mstacm.org";

    const Auth = new CognitoConstruct(this, "MstacmAuth", {
      environment: environment,
    });

    const MstacmWebFrontend = new AmplifyConstruct(this, "MstacmWebFrontend", {
      environment: environment,
      gitOwner: "sigdotcom",
      gitRepo: "mstacm-frontend",
    });

    MstacmWebFrontend.addPolicy(["ssm:GetParameter"], Auth.authParameterArns);
  }
}
