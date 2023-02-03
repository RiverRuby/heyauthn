import { useEffect, useState } from "react"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { useSemaphore } from "@/contexts/SemaphoreProvider"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function IndexPage() {
  const [username, setUsername] = useState("")
  const { handleRegister } = useSemaphore()
  const router = useRouter()

  const registrationFlow = async (username: string) => {
    if (!router.query.iykRef) {
      toast.error("Please use a valid link from an IYK disk.")
      return
    }

    const attemptStatus = await handleRegister(
      username,
      router.query.iykRef as string
    )
    if (attemptStatus === 404) {
      toast.error("Please use a valid IYK link.")
    } else if (attemptStatus === 200) {
      toast.success("Registration successful!")
      router.push("/discord")
    } else {
      toast.error("Registration failed.")
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
        <div className="wrap flex flex-col gap-6">
          <Input
            className="text-center"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            placeholder="Name"
          />
          <Button onClick={() => registrationFlow(username)}>
            Authenticate
          </Button>
        </div>
      </section>
    </>
  )
}
