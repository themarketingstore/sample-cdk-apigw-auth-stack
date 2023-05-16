# Sample Cognito Authentication with Cognito Stack 

Sample CDK stack that will deploy the following resources to an AWS account:

- Cognito User Pool
- Cognito User Client
- REST API Gateway ( with Cognito authorizer )
- A Lambda function to service incoming requests

# Getting Started

Install all the JS dependencies using npm:

_npm install_

Deploy the stack to an AWS account:

_npx cdk deploy --profile={nameofawsprofileinenvironment}_

This will display something similar to the following:

![Deploying the CDK stack](/screenshots/deploying_stack.png?raw=true "Deploying the stack")

Main outputs from the stack to make note of are:

-CognitoClientIDCdkAuthStack - The client ID of the Cognito Client.

-CognitoClientSecretCdkAuthStack - The Client Secret ( this and the client ID will be used to request an access token ).

-CognitoAuthDomainCdkAuthStack - The domain name for the cognito auth endpoint. 

-APIGWURLCdkAuthStack - This is the URL for the API Gateway instance that was created.

# API Routes

The stack will create a REST API Gateway instance with a single route:

/response - This endpoint requires a POST request with an Authorization header containing an access token provided by the AWS Cognito service.

![Creating a request](/screenshots/insomnia_request.png?raw=true "POST Request")

# Key Files & Directories

### General files

- /bin/sample_cdk_stack.ts - Entry point for the stack, instantiates the CDK stack with AWS environment information. 

### Code

- /code/lambda/hello_world/invoke.py - Python code for the Lambda function to service authenticated API requests.

### Config Files

- /config/general.ts - General stack options; timezone, resource tags etc.


- /config/cognito.ts - Settings related to the AWS Cognito service.

### Library Files

- /lib/authentication/cognito.ts - Creates AWS related resources; user client, pool and domain.


- /lib/general/stack_outputs.ts - Class controlling the creating of Cloud Formation outputs for created resources.


- /lib/networking/api_gateway.ts - Create an API Gateway endpoint and attach a Cognito authorizer.


- /lib/serverless/lambda.ts - Defines a Lambda function to respond to requests received by the API gateway.

### Tests

- /test/python/test_auth.py - Python script that will demonstrate requesting an access token from the AWS Cognito services. Then using the token to authenticate with the API Gateway when making a request. 

# Lambda Function

On successful invocation from the API Gateway the Lambda function will simply respond with:

_{'msg': 'Hello from the Lambda function', 'error': ''}_

# Getting an access token from Cognito 

There is a test python script in the test/python directory of the repo that can automate the process of requesting an access token from Cognito 
and signing a request to the API Gateway endpoint. 

But if you would like to request one manually for debugging or similar a token can be requested manually with CURL:

_curl --location --request POST 'https://cdkauthstack.auth.us-east-1.amazoncognito.com/oauth2/token' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'grant_type=client_credentials' --data-urlencode 'client_id=CLIENTID' --data-urlencode 'client_secret=CLIENTSECRET'_

The auth url, client id and secret will need to be replaced with the relevant values for your stack as noted in the stack outputs.

### Testing Authentication via Python Script

If you would like to test the endpoint auth using the python script, open the file test/python/test_auth.py. 

Replace the values of the variables below, with values relevant to your stack provided by the outputs after deployment:

- CLIENT_ID
- CLIENT_SECRET
- API_GW_ENDPOINT

With values relevant to your stack, edit the AUTH_DOMAIN and replace with the value for your stacks auth domain. 

Also replace the AWS region in this URL if the stack has been deployed to an AWS region other than us-east-1.

Save the changes and then run from the CLI for an output similar to below:

![Testing Stack Auth](/screenshots/test_script.png?raw=true "Testing the stack")

# Troubleshooting

If you receive the following message:

_Authorization header requires 'Credential' parameter. Authorization header requires 'Signature' parameter. Authorization header requires 'SignedHeaders' parameter_

The URL is likely wrong check that there is no trailing slashes or similar where they shouldn't be.

## General CDK 

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
