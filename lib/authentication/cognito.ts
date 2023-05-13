import {Construct} from "constructs";
import {aws_cognito} from "aws-cdk-lib";

import StackOutputs from "../general/stack_outputs";
import cognitoConf from "../../config/cognito";

/**
 * Stack definitions for Cognito & API Gateway related functionality.
 *
 * @class IwinAuth
 */
export default class StackAuth extends StackOutputs {

    /**
     * Scope name to use for resource permissions
     */
    scopeName = 'call-lambda';

    constructor(protected scope:Construct)
    {
        super(scope);
    }

    /**
     * Create a user pool for the CDK environment
     *
     * @return {aws_cognito.UserPool} userPool
     *
     * @public
     */
    public createUserPool(): aws_cognito.UserPool
    {
        let poolConf = cognitoConf.user_pool;

        poolConf['pool_name'] = cognitoConf.user_pool.pool_name + this.scope.node.id;

        let userPool = new aws_cognito.UserPool(
            this.scope,
            poolConf['pool_name'],
            cognitoConf.user_pool
        );

        this.outputValue(`CognitoUserPoolID${this.scope.node.id}`, `CognitoUserPoolID${this.scope.node.id}`, userPool.userPoolId);
        this.outputValue(`CognitoUserPoolURL${this.scope.node.id}`, `CognitoUserPoolURL${this.scope.node.id}`, userPool.userPoolProviderUrl);
        this.outputValue(`CognitoUserPoolARN${this.scope.node.id}`, `CognitoUserPoolARN${this.scope.node.id}`, userPool.userPoolArn);

        return userPool;
    }

    /**
     * Create a AWS Cognito instance
     *
     * @param {aws_cognito.UserPool|aws_cognito.IUserPool} userPool
     *
     * @return {aws_cognito.UserPoolClient} cognitoClient
     *
     * @public
     */
    public createClient(userPool: aws_cognito.UserPool|aws_cognito.IUserPool): aws_cognito.UserPoolClient {
        new aws_cognito.CfnUserPoolResourceServer(this.scope, `userpool-resource-server${this.scope.node.id}`, {
            identifier: "https://resourceserver/",
            name: "cdk-apigw-resource-server",
            userPoolId: userPool.userPoolId,
            scopes: [
                {
                    scopeDescription: "Access Lambda functionality through APIGW",
                    scopeName: "call-lambda",
                },
            ],
        });

        let clientProps = {
            userPool,
            accessTokenValidity: cognitoConf.user_client.token_ttl,
            generateSecret: true,
            oAuth: {
                flows: {
                    clientCredentials: true
                },
                scopes: [aws_cognito.OAuthScope.custom("https://resourceserver//call-lambda")],
            }
        }

        let cognitoClient = new aws_cognito.UserPoolClient(this.scope, cognitoConf.user_client.client_name, clientProps);

        this.outputValue(`CognitoClientID${this.scope.node.id}`, `CognitoClientID${this.scope.node.id}`, cognitoClient.userPoolClientId);
        this.outputValue(`CognitoClientSecret${this.scope.node.id}`, `CognitoClientSecret${this.scope.node.id}`, cognitoClient.userPoolClientSecret.unsafeUnwrap().toString());

        cognitoClient.node.addDependency(userPool);

        return cognitoClient;
    }

    /**
     * Create an auth domain for use with the AWS cognito service
     *
     * @param {aws_cognito.UserPool|aws_cognito.IUserPool} userPool
     *
     * @public
     */
    public createAuthDomain(userPool: aws_cognito.UserPool|aws_cognito.IUserPool): aws_cognito.UserPoolDomain
    {
        let adminDomain = cognitoConf.user_pool.admin_domain;
        let domainPrefix = adminDomain.substring(0, adminDomain.lastIndexOf('.'));
        // Note: Case transform as Cognito auth domains must be provided in lower case for some reason
        let authPrefix = domainPrefix + this.scope.node.id.toLowerCase() ?? cognitoConf.user_pool.admin_domain + this.scope.node.id.toLowerCase();
        let authDomain = userPool.addDomain(`CDK-Cognito-AuthDomain-${this.scope.node.id}`, {
            cognitoDomain: {
                domainPrefix: authPrefix,
            },
        });
        this.outputValue(`CognitoAuthDomain${this.scope.node.id}`, `CognitoAuthDomain${this.scope.node.id}`, `${authDomain.domainName}`);

        return authDomain;
    }
}
