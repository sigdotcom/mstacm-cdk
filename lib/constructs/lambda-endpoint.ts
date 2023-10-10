import { StackProps } from "aws-cdk-lib";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";
import { HttpMethods, Permission } from "../types";

export interface LambdaEndpointConstructProps extends StackProps {
  name: string;
  entry: string;
  method: HttpMethods;
  permissions: Permission[];
}

export default class LambdaEndpointConstruct extends Construct {
  private readonly lambdaFunction: NodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    props: LambdaEndpointConstructProps
  ) {
    super(scope, id);

    const lambdaRole = new Role(this, `LambdaDynamoRole`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      description: `Endpoint role for ${props.name}`,
    });

    props.permissions.forEach((permission) => {
      if ((permission = Permission.DYNAMODB)) {
        const dynamoDBPolicyStatement = new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:Scan",
            "dynamodb:Query",
          ],
          resources: ["*"],
        });
        lambdaRole.addToPolicy(dynamoDBPolicyStatement);
      }
    });

    this.lambdaFunction = new NodejsFunction(this, `${props.name}`, {
      entry: props.entry,
      handler: `${props.name}Handler`,
      role: lambdaRole,
    });
  }
  public get function(): NodejsFunction {
    return this.lambdaFunction;
  }
}
