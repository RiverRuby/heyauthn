import {
    DiscordMessage,
    DiscordMessages,
  } from "@skyra/discord-components-react";
import {useEffect, useState } from 'react'
// import {WebhookClient} from "discord.js"

export default function Discord() {
  const [messages, setMessages] = useState([])
//   const webhookClient = new WebhookClient({ url: "https://discord.com/api/webhooks/1070582208588427284/57lQqRIbWWsC6-T7alxtvT-Zmp-zRG9nxbS8fS1vDwjFImZ9olclqKPkc6g2XIA8_qq_/" });
  useEffect(() => {
    const fetchMsgs = async () => {
        const messages = await fetch(
            "/api/messages",
            {
              method: "GET"
            }
          )
        const msgJson = await messages.json()
        setMessages(msgJson.body)
    }
    fetchMsgs()
  }, [])
  
  return (
    <>
      <DiscordMessages>
        {
          messages.map(
            (m) => {
              return (
                <DiscordMessage author="heyauthn!">
                  {" "}
                  {m.message} {" "}
                </DiscordMessage>
              )
            }
          )
        }
      </DiscordMessages>
    </>
  )
}
