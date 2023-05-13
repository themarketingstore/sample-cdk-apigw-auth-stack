import StackOutputs from "../general/stack_outputs";
import * as APIGW from 'aws-cdk-lib/aws-apigateway';
import {Construct} from "constructs";
import {aws_lambda, aws_cognito} from "aws-cdk-lib";
import {UserPool} from "aws-cdk-lib/aws-cognito";

/**
 * Handle API Gateway routes required by the stack
 *
 * @class ApiGw
 */
export default class ApiGw extends StackOutputs {

    constructor(scope: Construct) {
        super(scope);
    }

    /**
     * Create an API Gateway / SQS integration to receive the sweeps draw requests
     *
     * @param {aws_lambda.Function} lambdaFunc
     * @param {aws_cognito.UserPool|aws_cognito.IUserPool} cognitoPool
     *
     * @return {APIGW.LambdaRestApi} ApiGw
     *
     * @public
     */
    public createApiGateway(lambdaFunc: aws_lambda.Function, cognitoPool: aws_cognito.UserPool|aws_cognito.IUserPool) : APIGW.LambdaRestApi
    {
        let apiGw =  new APIGW.RestApi(this.scope, `CDK-API-GW-${this.scope.node.id}`, {
            restApiName: `CDK-API-GW-${this.scope.node.id}`,
            description: "API gateway for calling the Lambda function.",
            deployOptions: {
                stageName: this.scope.node.id,
            },
            defaultMethodOptions: this.defaultMethodOpts(cognitoPool),
        });

        // Add a route to call the sample Lambda function
        let lambdaResource = apiGw.root.addResource('response');
        lambdaResource.addMethod('POST', new APIGW.LambdaIntegration(lambdaFunc));

        this.outputValue(`API-GW-URL-${this.scope.node.id}`, `API-GW-URL-${this.scope.node.id}`, apiGw.url);

        return apiGw;
    }

    /**
     * Return the default methods for attachment to a created APIGW instance
     *
     * @param {aws_cognito.UserPool|aws_cognito.IUserPool} cognitoPool
     * @param {boolean} authRequired
     *
     * @return {object}
     *
     * @protected
     */
    protected defaultMethodOpts(cognitoPool: aws_cognito.UserPool|aws_cognito.IUserPool, authRequired = true): object {
        if (authRequired) {
            let apiAuth = this.cognitoAuthorizer(cognitoPool);

            return {
                authorizationType: APIGW.AuthorizationType.COGNITO,
                authorizer: apiAuth,
                authorizationScopes: ["https://resourceserver//call-lambda"]
            }
        }

        return {
            authorizationType: APIGW.AuthorizationType.NONE
        }
    }

    /**
     * Create Cognito Authorizer for use with API Gateway
     *
     * @param {aws_cognito.UserPool|aws_cognito.IUserPool} cognitoPool
     *
     * @return {APIGW.Authorizer}
     *
     * @protected
     */
    protected cognitoAuthorizer(cognitoPool: aws_cognito.UserPool|aws_cognito.IUserPool): APIGW.Authorizer
    {
        return new APIGW.CognitoUserPoolsAuthorizer(this.scope, `CDK-APIGW-Authorizer-${this.scope.node.id}`, {
            cognitoUserPools: [cognitoPool]
        });
    }
}
