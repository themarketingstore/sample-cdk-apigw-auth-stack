import {Duration, RemovalPolicy} from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito"

export default {
    user_pool: {
        pool_name: "cdk-cognito-user-pool",
        accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
        // Change to keep the user pool on stack destruction
        removalPolicy: RemovalPolicy.DESTROY,
        admin_domain: "cdk-sample-cognito-domain",
        // URL to redirect users after authenticating via the hosted UI login form
        // hosted_ui_return_url: "https://example.com",
        advancedSecurityMode: cognito.AdvancedSecurityMode.AUDIT,
        passwordPolicy: {
            minLength: parseInt("8" ),
            requireLowercase: true,
            requireUppercase: true,
            requireDigits: true,
            requireSymbols: true,
            tempPasswordValidity: Duration.days(parseInt("3" )),
        },
    },
    user_client: {
        client_name: process.env.SWEEPS_AUTH_CLIENT_NAME ?? "CDK-Cognito_Client",
        auth_flows: {
            adminUserPassword: true,
            custom: true,
            userSrp: true,
        },
        token_ttl: Duration.minutes(parseInt(process.env.SWEEPS_AUTH_CLIENT_TOKEN_TTL ?? "120" )),
        callback_path: "auth/v1/complete",
        logout_path: "auth/v1/logout"
    }
}