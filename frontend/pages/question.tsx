import { useState } from "react"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { useSemaphore } from "@/contexts/SemaphoreProvider"
import toast, { Toaster } from "react-hot-toast"
import Balancer from "react-wrap-balancer"

import { Layout } from "@/components/layout"
import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

function QuestionPage() {
  const { handleSignal } = useSemaphore()
  const [question, setQuestion] = useState("")
  const router = useRouter()

  async function postQuestion() {
    const signalResult = await handleSignal(question)
    if (signalResult) {
      // router.push("/discord")
    } else {
      toast.error("failed to send question")
    }
  }
  return (
    <>
      <Head>
        <title>heyauthn!</title>
        <meta name="description" content="heyauthn!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container flex h-screen flex-col items-center justify-center gap-6 pt-6 pb-8 md:py-10">
        <div className="flex justify-center">
          <Image src="/heyauthn.png" alt="heyauthn!" width="225" height="162" />
        </div>
        <div className="wrap flex flex-col gap-4">
          <div className="wrap flex flex-col gap-2 text-center">
            <Textarea
              className="text-center"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
              }}
              placeholder="Anonymously ask a question!"
            />
          </div>
          <Button onClick={postQuestion}>Submit</Button>
          <Button onClick={() => router.push("/discord")}> Back </Button>
        </div>
      </section>
    </>
  )
}

export default QuestionPage
