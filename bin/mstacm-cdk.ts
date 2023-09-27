#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MstacmCdkStack } from "../lib/mstacm-cdk-stack";
// import { MstacmStorageStack } from "../lib/mstacm-storage-stack";

const app = new cdk.App();

// new MstacmStorageStack(app, "MstacmStorageStack", {});

new MstacmCdkStack(app, "MstacmCdkStack", {});
