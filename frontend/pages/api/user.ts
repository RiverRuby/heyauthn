import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type User = {
    id: String, 
    grp: Number,
    reputation: Number
}

async function query(user: User) {
  const create = await prisma.user.create({
    data: user,
  })

  console.log(create)
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
    const {body} = request
    const b = JSON.parse(body)

    query(b).then(async () => {
        await prisma.$disconnect()
      })
      .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
      })

  response.status(200);
}