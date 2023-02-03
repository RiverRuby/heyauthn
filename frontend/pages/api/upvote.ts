import { NextApiRequest, NextApiResponse } from "next"
import { WebhookClient } from "discord.js"

import prisma from "@/lib/prisma"

const webhookClient = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL,
})

async function upvote(messageId: string) {
  await prisma.message.update({
    where: { id: messageId },
    data: { upvotes: { increment: 1 } },
  })
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { query } = request
  const messageId = query.messageId.toString()
  console.log("🚀 ~ messageId", messageId)

  upvote(messageId)
    .then(async () => {

      const message = await webhookClient.fetchMessage(messageId);
      const edit = await webhookClient.editMessage(messageId, {
        content: message.content.substring(0, message.content.length - 1) + (1 + parseInt(message.content.substring(message.content.length - 1, message.content.length))),
      });

      console.log(edit)
      response.status(200).end()
    })
    .catch(async (error) => {
      console.error(error)
      response.status(400).send({ error: error.message })
      process.exit(1)
    })
}
