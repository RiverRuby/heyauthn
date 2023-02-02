import { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function query(id: string) {
  const user = await prisma.user.findUnique({
    where: { id: id },
  })

  const increaseRep = await prisma.user.update({
    where: { id: id },
    data: { reputation: user.reputation },
  })
  console.log(increaseRep)
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { body } = request
  const b = JSON.parse(body).id

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
