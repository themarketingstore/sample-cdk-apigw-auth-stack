import {Construct} from "constructs";
import {CfnOutput} from "aws-cdk-lib";

/**
 * Handle the formatting of CloudFormation outputs with information about resources in the stack.
 *
 * @class StackOutputs
 */
export default class StackOutputs {

    constructor(protected scope:Construct){}

    /**
     * Simple CF output for outputting ad hoc values
     *
     * @param {string} elmId
     * @param {string} attrName
     * @param {string} attrValue
     *
     * @return {void}
     *
     * @public
     */
    public outputValue(elmId: string, attrName: string, attrValue: string) :  void
    {
        new CfnOutput(this.scope, `${elmId}`, {
            value: attrValue,
            exportName: attrName
        });
    }

    /**
     * Generic Cloud Formation Export ( Name / ARN )
     *
     * @param {string} elmId
     * @param {string} resourceName
     * @param {string} awsArn
     *
     * @return {void}
     *
     * @public
     */
    public resourceOutput(elmId: string, resourceName: string, awsArn: string) : void
    {
        new CfnOutput(this.scope, `${elmId}ARN`, {
            value: awsArn,
            exportName: `${elmId}ARN`
        });

        new CfnOutput(this.scope, elmId, {
            value: resourceName ,
            exportName: elmId
        });
    }
}
