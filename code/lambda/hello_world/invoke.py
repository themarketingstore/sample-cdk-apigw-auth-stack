"""
Lambda to return a response from an API gateway invocation
"""
import json
import os

def lambda_handler(event, context):

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"msg": f"Hello from the Lambda function", "error": ""}, indent=4)
    }
