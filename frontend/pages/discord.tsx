import {
    DiscordMention,
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
            "https://discord.com/api/webhooks/1070582208588427284/57lQqRIbWWsC6-T7alxtvT-Zmp-zRG9nxbS8fS1vDwjFImZ9olclqKPkc6g2XIA8_qq_/",
            {
              method: "GET"
            }
          )
        console.log(messages.body.toString())
    }
    fetchMsgs()
  }, [])
  
  return (
    <div>
        {/* {
            for 
        } */}
       <DiscordMessages>
        <DiscordMessage author="heyauthn!">
          {" "}
          Hey guys, I'm new here! Glad to be able to join you all!{" "}
        </DiscordMessage>
        <DiscordMessage author="Fenton Smart" avatar="/avafive.png">
          {" "}
          Hi, I'm new here too!{" "}
        </DiscordMessage>
        <DiscordMessage profile="maximillian">
          Hey, <DiscordMention>Alyx Vargas</DiscordMention> and{" "}
          <DiscordMention>Dawn</DiscordMention>. Welcome to our server!
          <br />
          Be sure to read through the{" "}
          <DiscordMention type="channel">rules</DiscordMention>. You can ping
          <DiscordMention type="role" color="#70f0b4">
            Support
          </DiscordMention>
          if you need help.
        </DiscordMessage>
        <DiscordMessage profile="willard">
          Hello everyone! How's it going?
        </DiscordMessage>
        <DiscordMessage author="Alyx Vargas">
          Thank you
          <DiscordMention highlight>Maximillian Osborn</DiscordMention>!
        </DiscordMessage>
        <DiscordMessage author="Kayla Feeney" avatar="/avafour.png">
          I'm doing well, <DiscordMention>Willard Walton</DiscordMention>. What
          about yourself?
        </DiscordMessage>
        <DiscordMessage profile="willard">
          {" "}
          s!8ball How am I doing today?{" "}
        </DiscordMessage>
        <DiscordMessage profile="skyra"> Yes. </DiscordMessage>
      </DiscordMessages>
    </div>
  )
}
