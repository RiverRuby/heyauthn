import { NextApiRequest, NextApiResponse } from "next"
import { generateAuthenticationOptions } from "@simplewebauthn/server"

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { body } = request
  //   const b = JSON.parse(body)

  // TODO: Fetch challenge from database
  const challenge = "challenge"
  const options = generateAuthenticationOptions({
    // Require users to use a previously-registered authenticator
    // allowCredentials: userAuthenticators.map(authenticator => ({
    //   id: authenticator.credentialID,
    //   type: 'public-key',
    //   // Optional
    //   transports: authenticator.transports,
    // })),
    userVerification: "preferred",
    challenge,
  })

  response.status(200).json(options)
}
