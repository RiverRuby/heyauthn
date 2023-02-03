import Head from "next/head"
import { useSemaphore } from "@/contexts/SemaphoreProvider"
import Balancer from "react-wrap-balancer"

import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"

export default function GroupPage() {
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
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          <Balancer>authenticate with a group!</Balancer>
        </h1>
        <div className="wrap flex flex-col gap-4">
          <Button>zkiap</Button>
          <Button>zkiap-staff</Button>
        </div>
      </section>
    </>
  )
}
