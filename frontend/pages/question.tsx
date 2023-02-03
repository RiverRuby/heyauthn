import { useState } from "react"
import { useSemaphore } from "@/contexts/SemaphoreProvider"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast';

function Question() {
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
    <div>
      <h4 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight">
        ask your question here :o
      </h4>
      <Textarea
        value={question}
        onChange={(e) => {
          setQuestion(e.target.value)
        }}
      />
      <Button onClick={sendToDiscord}> submit </Button>
      <Toaster />
    </div>
  )
}

export default Question
