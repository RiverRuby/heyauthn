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

  console.log("🚀 ~ messages", messages)
  if (!messages.length) return <div>loading...</div>

  return (
    <>
      <DiscordMessages>
        <DiscordMessage author="heyauthn!">
          asdf
          <DiscordReactions slot="reactions">
            <DiscordReaction
              name="👍"
              emoji="/thumbsup.svg"
              count={1}
            ></DiscordReaction>
          </DiscordReactions>
        </DiscordMessage>
        {messages &&
          messages.map((m) => {
            return (
              <DiscordMessage author="heyauthn!"> {m.message} </DiscordMessage>
            )
          })}
      </DiscordMessages>
    </>
  )
}
