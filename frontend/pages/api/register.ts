import { NextApiRequest, NextApiResponse } from "next"
import { User } from "@prisma/client"
import { verifyRegistrationResponse } from "@simplewebauthn/server"

import prisma from "@/lib/prisma"

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { body } = request
  const { username, groupId, commitment } = body

  // check if user is in database
  const user = await prisma.user.findFirst({
    where: {
      username: username,
    },
  })
  if (user) {
    response.status(400).send({ error: "Username already taken" })
    return
  }

  // add user to database
  const date_now = Date.now().toString()
  try {
    await prisma.user.create({
      data: {
        username: username,
        reputation: 0,
        semaphorePublicKey: commitment,
        timestamp: date_now,
        groupId: groupId,
      },
    })
  } catch (error) {
    console.error(error)
    response.status(400).send({ error: error.message })
  }

  response.status(200)
}
