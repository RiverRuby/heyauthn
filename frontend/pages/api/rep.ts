import { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"
import { verifyProof } from "@semaphore-protocol/proof"

const prisma = new PrismaClient()

async function query(semaphoreKey: string) {
  const user = await prisma.user.findUnique({
    where: { 
      semaphorePublicKey: semaphoreKey 
    },
  })

  const increaseRep = await prisma.user.update({
    where: { semaphorePublicKey: semaphoreKey },
    data: { reputation: user.reputation },
  })
  console.log(increaseRep)
}

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { body } = request
  const b = JSON.parse(body)
  const id: string = b.id
  const proof = b.proof
  const groupSize = b.groupSize
  const message = b.message
  
  // verify user passed in proof
  verifyProof(proof, groupSize)
    .then((valid) => {
      if (valid) {
        // increase reputation in database
        query(id)
          .then(async () => {
            await prisma.$disconnect()
            // send question to discord
            fetch(
              "https://discord.com/api/webhooks/1070582208588427284/57lQqRIbWWsC6-T7alxtvT-Zmp-zRG9nxbS8fS1vDwjFImZ9olclqKPkc6g2XIA8_qq_",
              {
                method: "POST",
                body: JSON.stringify({
                  content: message,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
              .then(() => {
                response.status(200)
              })
              .catch(() => {
                response.status(500)
              })
          })
          .catch(async (e) => {
            console.error(e)
            await prisma.$disconnect()
            response.status(500)
            process.exit(1)
          })
      }
    })
    .catch(() => {
      response.status(400)
    })

  response.status(200)
}
