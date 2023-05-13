import base64
import datetime
import logging
import hashlib
import hmac
import json
import requests
import sys
import time
import urllib.parse

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)

# @TODO: Replace these with the credentials you take from the Cognito Client Settings in the AWS console
CLIENT_ID = "3al555u4k46bdb6nkfuiv2mf57"
CLIENT_SECRET = "1vjtp2oh9lktf1u5fsgl8snu1p566r0j4psuobhp2s0e5tevaa5g"

# @TODO: Replace this with your the gateway endpoint provided in the Cloudformation outputs
API_GW_ENDPOINT = "https://mg2reg1z7l.execute-api.us-east-1.amazonaws.com/CdkAuthStack/"

AUTH_DOMAIN = "cdkauthstack.auth.us-east-1.amazoncognito.com"
COGNITO_TOKEN_ENDPOINT = f"https://{ AUTH_DOMAIN }/oauth2/token"
LIST_OF_SCOPES = "https://resourceserver//call-lambda"
URL_PATH = "response/"
POSTDATA = '{}'

def configure_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(funcName)s -  %(message)s')
    handler.setFormatter(formatter)
    logging.getLogger().addHandler(handler)


def get_access_token():

    body = {
        "grant_type": "client_credentials",
        "scope": LIST_OF_SCOPES
    }

    LOGGER.debug(f"Body: {body}")
    LOGGER.debug(f"Client ID: {CLIENT_ID}")
    LOGGER.debug(f"Client SECRET: {CLIENT_SECRET}")

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(
        url=COGNITO_TOKEN_ENDPOINT,
        data=body,
        auth=(CLIENT_ID, CLIENT_SECRET),
        headers=headers
    )

    LOGGER.debug("Response: %s", response.json())
    return response.json()["access_token"]


def main():
    configure_logging()
    access_token = get_access_token()
    t = datetime.datetime.utcnow()
    amz_date = t.strftime('%Y%m%dT%H%M%SZ')
    date_stamp = t.strftime('%Y%m%d')

    headers = {
        "Authorization": access_token,
        "Date": time.strftime('%a, %d %b %Y %H:%M:%S GMT'),
        "Content-Type": "application/x-www-form-urlencoded"
    }


    headers['Content-Type'] = 'application/json'
    query_params = "?message=" + urllib.parse.quote(POSTDATA)
    req_url = API_GW_ENDPOINT + URL_PATH + query_params
    LOGGER.debug(f"POSTting URL: {req_url}")
    LOGGER.debug(f"Headers: {headers}")

    response = requests.post(req_url, headers=headers,data='')
    LOGGER.debug("Response: %s", response.json())


if __name__ == "__main__":
    main()
