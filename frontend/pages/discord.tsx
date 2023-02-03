import { GetStaticProps, InferGetStaticPropsType } from "next"
import { Message } from "@prisma/client"
import {
  DiscordMessage,
  DiscordMessages,
  DiscordReaction,
  DiscordReactions,
} from "@skyra/discord-components-react"

export default function Discord({
  messages,
}: InferGetStaticPropsType<typeof getStaticProps>) {
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

export const getStaticProps: GetStaticProps<{
  messages: Message[]
}> = async (context) => {
  const res = await fetch("http://localhost:3000/api/messages", {
    method: "GET",
  })
  const messages = await res.json()
  return { props: { messages } }
}
