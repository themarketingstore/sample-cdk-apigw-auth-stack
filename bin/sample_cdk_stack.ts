#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkAuthStack } from '../lib/cdk_auth_stack';

let deployEnv = (process.env.DEPLOY_ENV || "dev").toUpperCase();

const app = new cdk.App();

let authStack = new CdkAuthStack(app, 'CdkAuthStack', {
    env: {
        account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
    },
    tags: {
        Environment: deployEnv
    }
});

authStack.stackSetup();