import { NextApiRequest, NextApiResponse } from "next"

import prisma from "@/lib/prisma"

async function getMessages() {
  const messages = await prisma.message.findMany()
  return messages
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  getMessages()
    .then(async (msgs) => {
      response.status(200).json({
        body: msgs,
      })
    })
    .catch(async (error) => {
      console.error(error)
      response.status(400).send({ error: error.message })
      process.exit(1)
    })
}
