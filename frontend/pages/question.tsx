import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSemaphore } from "@/contexts/SemaphoreProvider"
import { useState } from "react"

function Question() {
  const { handleSignal } = useSemaphore()
  const [question, setQuestion] = useState('')

  async function sendToDiscord() {
    handleSignal(question)
  }
  return (
    <div>
    <h4 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight">
      ask your question here :o
    </h4>
    <Textarea value={question} onChange={(e) => {setQuestion(e.target.value)}}/>
    <Button onClick={sendToDiscord}> submit </Button>
    </div>
  )
}

export default Question
