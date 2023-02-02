import { createContext, useContext, useEffect, useState } from "react"
import useLocalStorage from "@/hooks/useLocalStorage"
import { client } from "@/webauthn.min.js"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"

function SemaphoreProvider({ children }: { children?: React.ReactNode }) {
  const [credentialId, setCredentialId] = useState("")
  const isAuthenticated = !!credentialId

  // Pass in unique ZKIAP group ID into Group constructor
  // Generate group from database
  const groupSize = 20
  const group = new Group(1, groupSize)
  const [userId, setStoredUser] = useLocalStorage<string>("id", null)

  useEffect(() => {
    if (userId || !isAuthenticated) return
    setStoredUser(new Identity(credentialId).toString())
    console.log("SET USER")
  }, [credentialId, isAuthenticated, setStoredUser, userId])

  const handleAddMember = (members: string[]) => {
    group.addMembers(members)
  }

  // Signals currently authenticated user
  const handleSignal = async () => {
    const identity = new Identity(userId)
    const externalNullifier = group.root
    const signal = 1
    // fs module not found
    // const fullProof = await generateProof(
    //   identity,
    //   group,
    //   externalNullifier,
    //   signal,
    //   {
    //     zkeyFilePath: "./semaphore.zkey",
    //     wasmFilePath: "./semaphore.wasm",
    //   }
    // )
    // const isValid = await verifyProof(fullProof, groupSize)
    // return isValid
  }

  const handleRegister = async () => {
    // probably shouldn't be able to call if credentialId is already set
    if (credentialId) return
    if (typeof window === "undefined") return

    // should receive challenge from server
    const challenge = new Uint8Array(32)
    window.crypto.getRandomValues(challenge)

    const registration = await client.register(
      "zkiap-attendee",
      "randomly-generated-challenge-to-avoid-replay-attacks"
    )
    // need type checking here
    setCredentialId(registration.credential.id)
  }

  const handleAuthenticate = async () => {
    // probably shouldn't be able to call if credentialId is already set
    if (credentialId) return
    const authentication = await client.authenticate(
      [],
      "random-challenge-to-avoid-replay-attacks"
    )
    setCredentialId(authentication.credentialId)
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
