import {Construct} from "constructs";
import {Duration} from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import StackOutputs from "../general/stack_outputs";

import StackConfig from "../../config/general";

export default class StackLambda extends StackOutputs {

    constructor(protected scope:Construct) {
        super(scope);
    }

    /**
     * Set up the Lambda function to answer requests made to the API Gateway
     *
     * @return {lambda.Function} lambdaFunc
     *
     * @public
     */
    public lambdaFunc() : lambda.Function
    {
        let funcEnv = {
            TZ: StackConfig.stack_timezone,
        }

        let lambdaFunc = new lambda.Function(
            this.scope,
            `cdk-sample-lambda-${this.scope.node.id}`,
            {
                functionName: "SampleLambdaFunc" + this.scope.node.id,
                code: lambda.Code.fromAsset("code/lambda/hello_world"),
                runtime: lambda.Runtime.PYTHON_3_9,
                handler: "invoke.lambda_handler",
                memorySize: 256,
                timeout: Duration.seconds(30),
                environment: funcEnv,
            }
        );

        this.resourceOutput(`LambdaFunction${this.scope.node.id}`, lambdaFunc.functionName, lambdaFunc.functionArn);
        return lambdaFunc;
    }
}