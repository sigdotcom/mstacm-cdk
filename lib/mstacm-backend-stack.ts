import { Stack, StackProps } from "aws-cdk-lib";
import {
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
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
        path: "users/list",
        permissions: [Permission.DYNAMODB],
      },
      {
        name: "updatePermission",
        entry: "dist/lib/backend-lambdas/updatePermission.js",
        method: HttpMethods.POST,
        path: "users/permissions",
        permissions: [Permission.DYNAMODB, Permission.COGNITO],
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
      const pathParts = endpoint.path.split("/");

      let currentResource = api.root;
      for (const part of pathParts) {
        // Check if resource already exists. If not, create a new one.
        const existingResource = currentResource.getResource(part);
        if (!existingResource) {
          currentResource = currentResource.addResource(part);
        } else {
          currentResource = existingResource;
        }
      }

      const lambdaEndpoint: LambdaEndpointConstruct =
        new LambdaEndpointConstruct(this, endpoint.name, endpoint);
      const myFunctionIntegration = new LambdaIntegration(
        lambdaEndpoint.function
      );

      currentResource.addMethod(endpoint.method, myFunctionIntegration, {
        authorizer: authorizer,
      });
    });

    const ssmParameters = [{ name: "apiUrl", value: api.url }];

    ssmParameters.forEach((param) => {
      backendParameterStore.createParameter(param.name, param.value);
    });
  }
}
