import { NextApiRequest, NextApiResponse } from "next"
import { generateRegistrationOptions } from "@simplewebauthn/server"

import prisma from "@/lib/prisma"

async function sha256(message) {
  var crypto = require("crypto")

  return crypto.createHash("sha256").update(message).digest("hex")
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { query } = request
  const username = query.username as string
  console.log("/api/genOptions username", username)

  let options = await generateRegistrationOptions({
    rpName: "heyauthn",
    rpID: process.env.RELAYING_PARTY_ID,
    userID: await sha256(username),
    userName: username,
    attestationType: "none",
    // excludeCredentials: userAuthenticators.map((authenticator) => ({
    //   id: authenticator.credentialID,
    //   type: "public-key",
    //   // Optional
    //   transports: authenticator.transports,
    // })),
  })

  response.status(200).json({
    body: options,
  })
}
