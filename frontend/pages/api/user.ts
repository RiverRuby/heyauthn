import { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient, User } from "@prisma/client"

const prisma = new PrismaClient()

async function query(user) {
  const date_now = new Date()

  const create = await prisma.user.create({
    data: {
      ...user,
      timestamp: date_now.getTime(),
    } as User,
  })

  console.log(create)
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { body } = request
  const b = JSON.parse(body)
  console.log("🚀 ~ b", b)

  query(b)
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })

  response.status(200)
}
