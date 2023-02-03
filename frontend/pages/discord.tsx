import { useEffect, useState } from "react"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import { Message } from "@prisma/client"
import {
  DiscordMessage,
  DiscordMessages,
  DiscordReaction,
  DiscordReactions,
} from "@skyra/discord-components-react"

export default function Discord() {
  const [messages, setMessages] = useState<Message[]>([])

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
            <DiscordMessage author="heyauthn!" key={id}>
              {message}
            </DiscordMessage>
          )
        })}
      </DiscordMessages>
    </>
  )
}
