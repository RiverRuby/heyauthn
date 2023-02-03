import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Message } from "@prisma/client"
import {
  DiscordMessage,
  DiscordMessages,
} from "@skyra/discord-components-react"

import { Button } from "@/components/ui/button"

export default function Discord() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])

  async function upvote() {
    return 1
  }

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch("/api/messages")
      const data = await res.json()
      setMessages(data.body)
    }
    fetchMessages()
  }, [])

  if (!messages.length) return <div>loading...</div>

  return (
    <>
      <section className="h-screen w-full flex-col items-center gap-6 pt-20 pb-8 md:py-10">
        <h1 className="mb-4 text-center text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          questions!
        </h1>
        <DiscordMessages>
          {messages.map(({ id, message }) => {
            return (
              <div>
                <DiscordMessage author="heyauthn! bot" key={id}>
                  {message}
                </DiscordMessage>
                <Button onClick={upvote}>Upvote</Button>
              </div>
            )
          })}
        </DiscordMessages>
      </section>
      <div className="absolute bottom-6 flex w-full justify-center">
        <Button onClick={() => router.push("/question")}>
          ask a question!
        </Button>
      </div>
    </>
  )
}
