import { StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface Route53ConstructProps extends StackProps {
  bucketName: string;
}

export default class Route53Construct extends Construct {
  //   public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: Route53ConstructProps) {
    super(scope, id);
  }
}
