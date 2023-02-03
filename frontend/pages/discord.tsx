import { useEffect, useState } from "react"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import { Message } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  DiscordMessage,
  DiscordMessages,
  DiscordReaction,
  DiscordReactions,
} from "@skyra/discord-components-react"

export default function Discord() {
  const [messages, setMessages] = useState<Message[]>([])

  async function upvote(id: string) {
    console.log(id)
    const res = await fetch("/api/upvote?messageId=" + id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
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
    <section className="h-screen w-full flex-col items-center gap-6 pt-6 pb-8 md:py-10">
      <h1 className="mb-4 text-center text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
        questions!
      </h1>
      <DiscordMessages>
        {messages.map(({ id, message }) => {
          return (
            <>
            <DiscordMessage author="heyauthn! bot" key={id}>
              {message}
            </DiscordMessage>
            <Button onClick={() => upvote(id)}>Upvote</Button>
            </>
          )
        })}
      </DiscordMessages>
    </section>
  )
}
