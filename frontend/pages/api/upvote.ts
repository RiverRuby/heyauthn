import { NextApiRequest, NextApiResponse } from "next"
import { WebhookClient } from "discord.js"

import prisma from "@/lib/prisma"

const webhookClient = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL,
})

async function upvote(messageId: string, message: string) {
  await prisma.message.update({
    where: { id: messageId },
    data: {
      upvotes: { increment: 1 },
      message:
        message.substring(0, message.length - 1) +
        (1 + parseInt(message.substring(message.length - 1, message.length))),
    },
  })
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { query } = request
  const messageId = query.messageId.toString()
  console.log("🚀 ~ messageId", messageId)
  const message = await webhookClient.fetchMessage(messageId)

  upvote(messageId, message.content)
    .then(async () => {
      const edit = await webhookClient.editMessage(messageId, {
        content:
          message.content.substring(0, message.content.length - 1) +
          (1 +
            parseInt(
              message.content.substring(
                message.content.length - 1,
                message.content.length
              )
            )),
      })

      console.log(edit)
      response.status(200).end()
    })
    .catch(async (error) => {
      console.error(error)
      response.status(400).send({ error: error.message })
      process.exit(1)
    })
}
