import { createContext, useContext, useEffect, useState } from "react"
import useLocalStorage from "@/hooks/useLocalStorage"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import SimpleWebAuthnBrowser, {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser"
import { generateRegistrationOptions } from "@simplewebauthn/server"
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types"

async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message)

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // convert bytes to hex string
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

function SemaphoreProvider({ children }: { children?: React.ReactNode }) {
  // Pass in unique ZKIAP group ID into Group constructor
  // Generate group from database
  const groupSize = 20
  const groupId = 1
  const group = new Group(1, groupSize)
  const minAnonSet = 0

  const handleAddMember = (members: string[]) => {
    group.addMembers(members.map((e) => BigInt(e)))
  }

  // Signals currently authenticated user
  const handleSignal = async (question: string) => {
    // TODO: get user from regenerated sig
    // const identity = new Identity(userId)
    const identity = new Identity(
      "MEYCIQCwV1qbBKJmCljpLtPd_UiJPg3XYoc7Qv2XKNyylsnX_QIhAPoxn0CgyPM7LwgTH30Fl4nGczJ-sB33GHhtrRrEBNFS"
    )

    // const data = {
    //   groupId: groupId,
    // }

    // fetch all members from the database
    const getMembers = await fetch(
      "/api/members?group_id=" + groupId.toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    console.log("Get members", getMembers)

    const res = await getMembers.json()
    const members = res.body

    if (members.length < minAnonSet) {
      console.log("cannot signal!!!")
    } else {
      console.log(members)
      const bigIntMembers = members.map((e) => {
        return BigInt(e.semaphorePublicKey)
      })
      console.log(bigIntMembers)
      group.addMembers(bigIntMembers)
    }

    const externalNullifier = group.root
    const signal = 1

    // fs module not found
    const fullProof = await generateProof(
      identity,
      group,
      externalNullifier,
      signal,
      {
        zkeyFilePath: "./semaphore.zkey",
        wasmFilePath: "./semaphore.wasm",
      }
    )

    const questionData = {
      semaphorePublicKey: identity.commitment.toString(),
      proof: fullProof,
      groupSize: groupSize,
      message: question,
    }
    // verify proof with server and increase reputation + post to discord
    const isValid = await fetch("/api/rep", {
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

  const createSemaphoreId = async (sig: string) => {
    console.log("SIGNATURE", sig)
    const { nullifier, trapdoor, commitment } = new Identity(sig)
    const data = {
      id: Math.random().toString(), // TODO: WebAuthn pub key
      groupId: groupId,
      reputation: 0,
      semaphorePublicKey: commitment.toString(),
      username: Math.random().toString(),
    }
    // add user to database
    const addUser = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    console.log("Add user status", addUser)
  }

  const handleRegister = async (username: string) => {
    const options = generateRegistrationOptions({
      rpName: "heyauthn",
      rpID: "localhost", // "heyauthn.xyz"
      userID: await sha256(username),
      userName: username,
      attestationType: "none",
      // TODO: Prevent users from re-registering existing authenticators
      // excludeCredentials: userAuthenticators.map((authenticator) => ({
      //   id: authenticator.credentialID,
      //   type: "public-key",
      //   // Optional
      //   transports: authenticator.transports,
      // })),
    })
    const attResp: RegistrationResponseJSON = await startRegistration(options)
    console.log("🚀 ~ handleRegister ~ attResp", attResp)
  }

  const handleAuthenticate = async () => {
    // note: do not have username
    // 3. Get signature of user by authenticating
    // 4. Write user's Semaphore ID to database
    const options = await fetch("/api/generate-auth", {
      method: "GET",
    }).then((response) => response.json())
    console.log("🚀 ~ handleAuthenticate ~ options", options)
    const asseResp = await startAuthentication(options)
    console.log("🚀 ~ handleAuthenticate ~ asseResp", asseResp)
    createSemaphoreId(asseResp.response.signature)
  }

  return (
    <SemaphoreContext.Provider
      value={{
        group,
        handleAddMember,
        handleAuthenticate,
        handleRegister,
        handleSignal,
      }}
    >
      {children}
    </SemaphoreContext.Provider>
  )
}

interface SemaphoreContextValue {
  group: Group
  handleAddMember: (members: string[]) => void
  handleAuthenticate: () => void
  handleRegister: (username: string) => void
  handleSignal: (question: string) => Promise<boolean>
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
