import { NextApiRequest, NextApiResponse } from "next"
import { Message } from "@prisma/client"
import { verifyProof } from "@semaphore-protocol/proof"
import { WebhookClient } from "discord.js"

import prisma from "@/lib/prisma"

const { createHash } = require("crypto")

function hash(string) {
  return createHash("sha256").update(string).digest("hex")
}

const webhookClient = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL,
})

async function addMessage(message: string, id: string, timestamp: string) {
  await prisma.message.create({
    data: {
      id,
      message: message + " (Anon upvotes: 0)",
      timestamp,
    } as Message,
  })
}

async function incrementReputation(semaphoreKey: string) {
  const user = await prisma.user.findFirst({
    where: {
      semaphorePublicKey: semaphoreKey,
    },
  })
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { reputation: user.reputation + 1 },
    })
  } else {
    throw new Error("User not found")
  }
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { body } = request
  const semaphoreKey = body.semaphorePublicKey
  const proof = body.proof
  const groupSize = body.groupSize
  const message = body.message

  verifyProof(proof, groupSize)
    .then((isValid) => {
      if (isValid && proof.signal === hash(message)) {
        incrementReputation(semaphoreKey)
          .then(async () => {
            const res = await webhookClient.send({
              content: message,
              username: "heyauthn! bot",
              avatarURL: "https://i.imgur.com/AfFp7pu.png",
            })
            console.log("🚀 ~ .then ~ res", res)

            addMessage(res.content, res.id, res.timestamp)
              .then(() => {
                return response.status(200).end()
              })
              .catch(() => {
                return response.status(500).end()
              })
          })
          .catch(async (e) => {
            console.error(e)
            return response.status(500).end()
          })
      }
    })
    .catch(() => {
      return response.status(500).end()
    })

  return response.status(200).end()
}
