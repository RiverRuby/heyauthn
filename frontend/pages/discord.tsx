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
      <DiscordMessages>
        {messages.map(({ id, message }) => {
          return (
            <div>
            <DiscordMessage author="heyauthn!" key={id}>
              {message}
            </DiscordMessage>
            <Button onClick={upvote}>Upvote</Button>
            </div>
          )
        })}
      </DiscordMessages>
    </>
  )
}
