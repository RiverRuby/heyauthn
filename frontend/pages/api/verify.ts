import { NextApiRequest, NextApiResponse } from "next"
import { verifyProof } from "@semaphore-protocol/proof"
import { WebhookClient } from "discord.js"
import { Message } from '@prisma/client'

import prisma from "@/lib/prisma"

const webhookClient = new WebhookClient({
  url: "https://discord.com/api/webhooks/1070582208588427284/57lQqRIbWWsC6-T7alxtvT-Zmp-zRG9nxbS8fS1vDwjFImZ9olclqKPkc6g2XIA8_qq_",
})

async function addMessage(message: string, id: string, timestamp: string) {
  const date_now = Date.now().toString()
  const user = await prisma.message.create({
    data: {
      id: id, 
      message: message,
      timestamp: timestamp
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
    .then((valid) => {
      if (valid) {
        incrementReputation(semaphoreKey)
          .then(async () => {
            const res = await webhookClient.send({
              content: message,
              username: "heyauthn! bot",
              avatarURL: "https://i.imgur.com/AfFp7pu.png",
            })
            console.log("🚀 ~ .then ~ res", res)

            addMessage(res.content, res.id, res.timestamp).then(() => {
              return response.status(200).end()
            }
            ).catch(
              () => {
                return response.status(500).end()
              }
            )

          })
          .catch(async (e) => {
            console.error(e)
            return response.status(500).end()
            process.exit(1)
          })
      }
    })
    .catch(() => {
      return response.status(500).end()
    })

  return response.status(200).end()
}
