import { Layout } from "@/components/layout"
import { Button, buttonVariants } from "@/components/ui/button"

function Question() {
  async function sendToDiscord() {
    fetch(
      "https://discord.com/api/webhooks/1070582208588427284/57lQqRIbWWsC6-T7alxtvT-Zmp-zRG9nxbS8fS1vDwjFImZ9olclqKPkc6g2XIA8_qq_",
      {
        method: "POST",
        body: JSON.stringify({
          content: "test",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
  return <Button onClick={sendToDiscord}> Submit Question </Button>
}

export default Question
