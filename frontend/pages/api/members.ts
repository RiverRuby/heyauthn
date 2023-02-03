import { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function getMembers(grp: number) {
  const users = await prisma.user.findMany({
    where: { groupId: grp },
  })
  return users
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { query } = request
  // const b = JSON.parse(body)
  const groupId = parseInt(query.group_id as string)
  console.log(groupId)

  getMembers(groupId)
    .then(async (users) => {
      await prisma.$disconnect()
      response.status(200).json({
        body: users,
      })
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
