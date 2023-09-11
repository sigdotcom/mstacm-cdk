import { Stack, StackProps } from "aws-cdk-lib";
import { AmplifyConstruct, CognitoConstruct } from "./constructs";
import { Construct } from "constructs";

export class MstacmCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const environment: string = this.node.tryGetContext("environment") || "dev";
    const rootDomain = "mstacm.org";

    const Auth = new CognitoConstruct(this, "MstacmAuth", {
      environment: environment,
    });

    const AmplifyFrontend = new AmplifyConstruct(this, "MstacmFrontend", {
      environment: environment,
      parameterArns: Auth.authParameterArns,
    });
  }
}
