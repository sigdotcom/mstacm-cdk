import { StackProps } from "aws-cdk-lib";
import { AccountPrincipal, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

export interface Route53ConstructProps extends StackProps {
  environment: string;
}

export default class Route53Construct extends Construct {
  constructor(scope: Construct, id: string, props: Route53ConstructProps) {
    super(scope, id);
  }
}
