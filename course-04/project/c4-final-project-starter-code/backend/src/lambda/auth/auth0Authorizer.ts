import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-olkeyhrs.us.auth0.com/.well-known/jwks.json'

const authCert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJVPIIfpDjO4qVMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1vbGtleWhycy51cy5hdXRoMC5jb20wHhcNMjIwODE3MTMzNDM1WhcN
MzYwNDI1MTMzNDM1WjAkMSIwIAYDVQQDExlkZXYtb2xrZXlocnMudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs0zuDVpptAp3c+cz
2v1v3btx/L+/KZvnXBnliiJR5gHpUkd0jtN3iUAGrkuwFA0e0em2VBls69ffjVVc
Thwza+YGxWVZOxqEJ0Fw1CPKzEXm09HKYPBjCBJya6C2Sm1RSN0zjYtqe5IY2xTw
TWwGOThCcoP4SXsy65xd9x10VFlvXtInW7d3exaA3SsF/m+Ab8QKJ8EJRnmlDTlG
lS9gNrUtTslhiCWSTetUC5RQLGpyRn/jdtCngBi1tDaL6EgoHKY+/K1Cnp2g6DIf
DqKX1p0zaHs5uJJnKAjfeiHAmXfemREWsBPipsEZ+y+WJgxGkRHZwt9oIONx/Ddw
Gbj2LQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSaOvimouGW
kb8O5xtIF6wWCLe3pjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AGLet2oRvlctZh+YhsQM30JrDgp5ApMwGgIxhcZkPvNqTlKVOj5k/nFbHQBBa1/e
5Eqb+D+0znAoCthL2DhTg7ggRFWgMxoL/hHlu+H7kZB5Eroi6jPaTdY6RC92bmED
J1UnEpWKFi9SzLG4Q5/XgqJF4A+F/sHMMYyCVZKFMDHkU8izck4K5jmtYEVeccVI
ZSqMPAYm4eKupGtZk1vGYL0d6aM0K4rRTAXJjgSQqaOhYrl1MgHZASIFHey5aM13
FT6bnNSEz0kfTAXOl7M2WcdUL/fAQA/5rCCnI91YSVUZy8vpaBtsUz4l2qKHGp9H
dTraXIvfeGdxgUQJjqSL+0I=
-----END CERTIFICATE-----`


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {
    const token = getToken(authHeader)
    // const res = await Axios.get(jwksUrl);
    

    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
    // const pemData = res['data']['keys'][0]['x5c'][0]
    // const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`
    // const jwt: Jwt = decode(token, { complete: true }) as Jwt

    // TODO: Implement token verification
    // You should implement it similarly to how it was implemented for the exercise for the lesson 5
    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
    return  verify(token, authCert, { algorithms: ['RS256'] }) as JwtPayload 
  } catch(err){
    logger.error('Failed to authenticate', err)
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
