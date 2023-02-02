import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function query(grp: Number) {

  const users = await prisma.user.findMany({
    where: { grp: grp }
  })
  return users;

}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
    const {body} = request
    const b = JSON.parse(body)
    const groupId = b.groupId

    query(groupId).then(async (users) => {
        await prisma.$disconnect()
        response.status(200).json({
          body: users
        });
      })
      .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
      })

}