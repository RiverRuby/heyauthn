import { NextApiRequest, NextApiResponse } from "next"
import { User } from "@prisma/client"
import { verifyRegistrationResponse } from "@simplewebauthn/server"

import prisma from "@/lib/prisma"

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { body } = request
  const { attResp, expectedChallenge, username, groupId } = body

  // verify the registration response
  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge,
      expectedOrigin: [
        "http://localhost:3000",
        "https://" + process.env.RELAYING_PARTY_ID,
      ],
      expectedRPID: process.env.RELAYING_PARTY_ID,
    })
  } catch (error) {
    console.error(error)
    return response.status(400).send({ error: error.message })
  }
  const { verified } = verification

  // add user to database
  if (verified) {
    const date_now = Date.now().toString()
    const { registrationInfo } = verification
    const { credentialPublicKey, credentialID, counter } = registrationInfo

    const create = await prisma.user.create({
      data: {
        username: username,
        reputation: 0,
        semaphorePublicKey: "",
        authCredential: Buffer.from(credentialID).toString("hex"),
        authPubkey: Buffer.from(credentialPublicKey).toString("hex"),
        timestamp: date_now,
        groupId: groupId,
      } as User,
    })
  }

  // respond with verification status
  response.status(200).json({
    body: {
      verified,
    },
  })
}
