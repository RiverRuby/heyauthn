import { useState } from "react"
import Head from "next/head"
import { useSemaphore } from "@/contexts/SemaphoreProvider"
import Balancer from "react-wrap-balancer"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function IndexPage() {
  const [username, setUsername] = useState("")
  const { handleAuthenticate, handleRegister } = useSemaphore()
  return (
    <>
      <Head>
        <title>heyauthn!</title>
        <meta name="description" content="heyauthn!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container flex h-screen flex-col items-center justify-center gap-6 pt-6 pb-8 md:py-10">
        <Balancer>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
            heyauthn!
          </h1>
        </Balancer>
        <div className="wrap flex flex-col gap-4">
          <div>
            <Label htmlFor="text">Username</Label>
            <Input
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          <Button onClick={() => handleRegister(username)}>Register</Button>
          <Button onClick={handleAuthenticate}>Authenticate</Button>
        </div>
      </section>
    </>
  )
}
