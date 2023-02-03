import { useState } from "react"
import { useSemaphore } from "@/contexts/SemaphoreProvider"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast';
import Head from "next/head"
import Balancer from "react-wrap-balancer"


function QuestionPage() {
  const { handleSignal } = useSemaphore()
  const [question, setQuestion] = useState("")
  const router = useRouter()

  async function sendToDiscord() {
    const signalResult = await handleSignal(question)
    if (signalResult) {
        router.push("/discord")
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
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          <Balancer>ask/upvote questions!</Balancer>
        </h1>
        <div className="wrap flex flex-col gap-4">
          <div className="wrap flex flex-col gap-2 text-center">
            <Textarea
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
              }}
            />
            <p className="text-sm text-slate-500">
              <Balancer>
                Your message will be anonymously posted to Discord.
              </Balancer>
            </p>
          </div>
          <Button onClick={sendToDiscord}> submit </Button>
        </div>
      </section>
    </>
  )
}

export default QuestionPage
