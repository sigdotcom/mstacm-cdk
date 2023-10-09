import { Stack, StackProps } from "aws-cdk-lib";
import {
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  Method,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

import LambdaEndpointConstruct, {
  LambdaEndpointConstructProps,
} from "./constructs/lambda-endpoint";
import { HttpMethods, Permission } from "./types";
import SsmContruct from "./constructs/ssm";
interface MstacmBackendStackProps extends StackProps {
  userPool: UserPool;
}

export class MstacmBackendStack extends Stack {
  constructor(scope: Construct, id: string, props: MstacmBackendStackProps) {
    super(scope, id, props);

    const userPool = props.userPool;
    const backendParameterStore = new SsmContruct(
      this,
      "BackendParameterStore",
      {}
    );
    const environment: string = this.node.tryGetContext("environment") || "dev";
    console.log(environment);

    const endpoints: LambdaEndpointConstructProps[] = [
      {
        name: "listUsers",
        entry: "dist/lib/backend-lambdas/listUsers.js",
        method: HttpMethods.GET,
        permissions: [Permission.DYNAMODB],
      },
    ];

    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      `MstacmApi-${environment}-Authorizer`,
      {
        cognitoUserPools: [userPool],
      }
    );

    const api = new RestApi(this, `Mstacm-${environment}-Api`, {
      restApiName: "MstacmApi",
      description: "main mstacm API",
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: [
          "GET",
          "POST",
          "PUT",
          "DELETE",
          "OPTIONS",
          "HEAD",
          "PATCH",
        ],
        allowHeaders: [
          "Authorization",
          "Content-Type",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
        ],
        allowCredentials: true,
      },
    });

    endpoints.forEach((endpoint) => {
      const lambdaEndpoint: LambdaEndpointConstruct =
        new LambdaEndpointConstruct(this, endpoint.name, endpoint);

      const resource = api.root.addResource(endpoint.name);
      const myFunctionIntegration = new LambdaIntegration(
        lambdaEndpoint.function
      );
      resource.addMethod(endpoint.method, myFunctionIntegration, {
        authorizer: authorizer,
      });
    });

    const ssmParameters = [{ name: "apiUrl", value: api.url }];

    ssmParameters.forEach((param) => {
      backendParameterStore.createParameter(param.name, param.value);
    });
  }
}
