#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MstacmCdkStack } from "../lib/mstacm-cdk-stack";
import { MstacmBackendStack } from "../lib/mstacm-backend-stack";

const app = new cdk.App();

const infraStack: MstacmCdkStack = new MstacmCdkStack(
  app,
  "MstacmCdkStack",
  {}
);
const userPool = infraStack.authPool;
const backendStack: MstacmBackendStack = new MstacmBackendStack(
  app,
  "MstacmBackendStack",
  {
    userPool: userPool,
  }
);
