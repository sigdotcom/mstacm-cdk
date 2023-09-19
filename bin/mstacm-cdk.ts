#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MstacmCdkStack } from "../lib/mstacm-cdk-stack";

const app = new cdk.App();

new MstacmCdkStack(app, "MstacmCdkStack", {});
