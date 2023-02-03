import { NextApiRequest, NextApiResponse } from "next"

import prisma from "@/lib/prisma"

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
    .then(async (users) => {
      response.status(200).json({
        body: users,
      })
    })
    .catch(async (error) => {
      console.error(error)
      response.status(400).send({ error: error.message })
      process.exit(1)
    })
}
