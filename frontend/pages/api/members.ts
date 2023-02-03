import { NextApiRequest, NextApiResponse } from "next"

import prisma from "@/lib/prisma"

async function getMembers(groupId: number) {
  const users = await prisma.user.findMany({
    where: { groupId },
  })
  return users
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { query } = request
  const groupId = parseInt(query.groupId as string)
  console.log("/api/members groupId", groupId)

  getMembers(groupId)
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
