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
  const [credentialId, setCredentialId] = useState("")
  const isAuthenticated = !!credentialId

  // Pass in unique ZKIAP group ID into Group constructor
  // Generate group from database
  const groupSize = 20
  const groupId = 1
  const group = new Group(1, groupSize)
  const [userId, setStoredUser] = useLocalStorage<string>("id", null)

  const minAnonSet = 2

  useEffect(() => {
    if (userId || !isAuthenticated) return
    setStoredUser(new Identity(credentialId).toString())
    console.log("SET USER")
  }, [credentialId, isAuthenticated, setStoredUser, userId])

  const handleAddMember = (members: string[]) => {
    group.addMembers(members)
  }

  // Signals currently authenticated user
  const handleSignal = async (question: string, id: string) => {
    const identity = new Identity(userId)

    const data = {
      groupId: groupId,
    }

    // fetch all members from the database
    const getMembers = await fetch("http://localhost:3000/api/members", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    console.log("Get members", getMembers)

    const res = await getMembers.json()
    const members = res.body

    if (members.length < minAnonSet) {
      console.log("cannot signal!!!")
    } else {
      group.addMembers(members)
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
      id: id,
      proof: fullProof,
      groupSize: groupSize,
      message: question,
    }
    // verify proof with server and increase reputation + post to discord
    const isValid = await fetch("http://localhost:3000/api/rep", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    })

    return isValid
  }

  const createSemaphoreId = async (sig: string) => {
    const { nullifier, trapdoor, commitment } = new Identity(sig)
    const data = {
      id: Math.random().toString(),
      groupId: groupId,
      reputation: 0,
      semaphorePublicKey: commitment.toString(),
      username: Math.random().toString()
    }
    // add user to database
    const addUser = await fetch("http://localhost:3000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    console.log("Add user status", addUser)
  }

  const handleRegister = async () => {
    const username = "ALICE"
    const options = generateRegistrationOptions({
      rpName: "heyauthn",
      rpID: "localhost", // "heyauthn.xyz"
      userID: await sha256(username),
      userName: "ALICE",
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: "none",
      // Prevent users from re-registering existing authenticators
      // TODO: Implement this
      // excludeCredentials: userAuthenticators.map((authenticator) => ({
      //   id: authenticator.credentialID,
      //   type: "public-key",
      //   // Optional
      //   transports: authenticator.transports,
      // })),
    })
    const attResp = await startRegistration(options)
    console.log("🚀 ~ handleRegister ~ attResp", attResp)
    // note: have username
    // 1. Register user's passkey
    // 2. Write username and passkey public key to database
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
        userId,
        handleAddMember,
        handleAuthenticate,
        handleRegister,
      }}
    >
      {children}
    </SemaphoreContext.Provider>
  )
}

interface SemaphoreContextValue {
  group: Group
  userId: string
  handleAddMember: (members: string[]) => void
  handleAuthenticate: () => void
  handleRegister: () => void
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
