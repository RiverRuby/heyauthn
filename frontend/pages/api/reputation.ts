import { NextApiRequest, NextApiResponse } from "next"
import { verifyProof } from "@semaphore-protocol/proof"
import { WebhookClient } from "discord.js"

import prisma from "@/lib/prisma"

const webhookClient = new WebhookClient({
  url: "https://discord.com/api/webhooks/1070582208588427284/57lQqRIbWWsC6-T7alxtvT-Zmp-zRG9nxbS8fS1vDwjFImZ9olclqKPkc6g2XIA8_qq_",
})

async function query(semaphoreKey: string) {
  const user = await prisma.user.findFirst({
    where: {
      semaphorePublicKey: semaphoreKey,
    },
  })

  if (user) {
    const increaseRep = await prisma.user.update({
      where: { id: user.id },
      data: { reputation: user.reputation + 1 },
    })
    console.log(increaseRep)
  } else {
    throw new Error("User not found")
  }
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { body } = request
  // const b = JSON.parse(body)
  const semaphoreKey: string = body.semaphorePublicKey
  const proof = body.proof
  const groupSize = body.groupSize
  const message = body.message

  // verify user passed in proof
  verifyProof(proof, groupSize)
    .then((valid) => {
      if (valid) {
        // increase reputation in database
        query(semaphoreKey)
          .then(async () => {
            // send question to discord
            // fetch(
            //   "",
            //   {
            //     method: "POST",
            //     body: JSON.stringify({
            //       content: message,
            //     }),
            //     headers: {
            //       "Content-Type": "application/json",
            //     },
            //   }
            // )
            //   .then((e) => {
            //     console.log(e.body.getReader())
            //     return response.status(200).end()
            //   })
            //   .catch(() => {
            //     return response.status(500).end()
            //   })
            const res = await webhookClient.send({
              content: "Webhook test",
              username: "some-username",
              avatarURL: "https://i.imgur.com/AfFp7pu.png",
            })
            console.log("🚀 ~ .then ~ res", res)
          })
          .catch(async (e) => {
            console.error(e)
            response.status(500)
            process.exit(1)
          })
      }
    })
    .catch(() => {
      return response.status(400).end()
    })

  return response.status(200).end()
}
