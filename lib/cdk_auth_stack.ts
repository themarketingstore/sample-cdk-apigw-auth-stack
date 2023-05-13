import {Stack, StackProps, Tags} from "aws-cdk-lib";
import { Construct } from 'constructs';

import ApiGw from "./networking/api_gateway";
import StackAuth from "./authentication/cognito";
import StackLambda from "./serverless/lambda";

import stackConfig from "../config/general";

/**
 * Base definition for the sample Cognito auth stack
 *
 * @class CdkAuthStack
 */
export class CdkAuthStack extends Stack {

  /**
   * @type {string|undefined}
   */
  account_id: string | undefined;

  /**
   * @type {string|undefined}
   */
  account_region: string = "us-east-1";

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.account_id = props?.env?.account;
    if (typeof props?.env?.region == "string") {
      this.account_region = props.env.region;
    }
  }

  /**
   * Set up the stack and any required resources
   *
   * @return {void}
   *
   * @public
   */
  public stackSetup(): void {
    let authManager = new StackAuth(this);

    // Create the resources related to Cognito and auth for the stack
    let cognitoPool = authManager.createUserPool();
    authManager.createAuthDomain(cognitoPool);
    authManager.createClient(cognitoPool);


    // Create the Lambda to service requests to the API
    let lambdaFunc = (new StackLambda(this)).lambdaFunc();

    // Create an API Gateway and tie it to the Lambda function and the Cognito Pool
    (new ApiGw(this)).createApiGateway(lambdaFunc, cognitoPool);

    this.addTags();
  }

  /**
   * Apply tags to the created stack resources in AWS
   *
   * @return {void}
   *
   * @protected
   */
  protected addTags(): void {
      Object.entries(stackConfig.tags).map(([k, v]) => {
        Tags.of(this).add(k, v, {
          applyToLaunchedInstances: true,
        });
      });
  }
}
