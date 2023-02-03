import { createContext, useContext, useState } from "react"
import { useRouter } from "next/router"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
} from "@simplewebauthn/server"

import { hash } from "@/lib/utils"

function SemaphoreProvider({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const groupSize = 20 // 2**20 members
  const minAnonSet = 5
  const [groupId, setGroupId] = useState(1)

  // Generate WebAuthn credential ID for Semaphore
  const genPassword = async () => {
    const options = generateAuthenticationOptions({})
    const asseResp = await startAuthentication(options)
    console.log("authentication resp", asseResp)
    return asseResp.id
  }

  // Signals currently authenticated user
  const handleSignal = async (question: string) => {
    const identity = new Identity(await genPassword())

    // fetch all members from the database
    const getMembers = await fetch(
      "/api/members?groupId=" + groupId.toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    const res = await getMembers.json()
    const members = res.body
    console.log("List of members", members)

    // create group
    const group = new Group(groupId, groupSize)
    if (members.length < minAnonSet) {
      console.log("Cannot signal yet")
      return false
    } else {
      const bigIntMembers = members.map((e) => {
        return BigInt(e.semaphorePublicKey)
      })
      group.addMembers(bigIntMembers)
    }

    const signal = await hash(question)

    const fullProof = await generateProof(
      identity,
      group,
      groupId,
      "0x" + signal,
      {
        zkeyFilePath: "./semaphore.zkey",
        wasmFilePath: "./semaphore.wasm",
      }
    )

    console.log("identity", identity)
    const questionData = {
      semaphorePublicKey: identity.commitment.toString(),
      proof: fullProof,
      groupSize: groupSize,
      message: question,
    }

    // verify proof with server and increase reputation + post to discord
    const isValid = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    })

    if (isValid.status == 200) {
      return true
    } else {
      return false
    }
  }

  const handleRegister = async (username: string) => {
    // gets registration options from server
    const optionsResp = await generateRegistrationOptions({
      rpName: "heyauthn",
      rpID: window.location.hostname,
      userID: await hash(username),
      userName: username,
      attestationType: "none",
    })

    // generates a key pair + credential ID from the authenticator
    const attResp = await startRegistration(optionsResp)
    console.log("registration resp", attResp)
    const { commitment } = new Identity(attResp.id)

    // post new user and semaphore public key to server
    const isValid = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        groupId: groupId,
        commitment: commitment.toString(),
      }),
    })

    if (isValid.status !== 200) {
      isValid.text().then((text) => {
        throw new Error(text)
      })
    }
    router.push("/discord")
  }

  return (
    <SemaphoreContext.Provider
      value={{
        handleRegister,
        handleSignal,
        setGroupId,
      }}
    >
      {children}
    </SemaphoreContext.Provider>
  )
}

interface SemaphoreContextValue {
  handleRegister: (username: string) => void
  handleSignal: (question: string) => Promise<Boolean>
  setGroupId: (id: number) => void
}

const SemaphoreContext = createContext<SemaphoreContextValue | undefined>(
  undefined
)

function useSemaphore() {
  const context = useContext(SemaphoreContext)
  if (context === undefined) {
    throw new Error("useSemaphore must be used within a SemaphoreProvider")
  }
  return context
}

export { SemaphoreProvider, useSemaphore }
