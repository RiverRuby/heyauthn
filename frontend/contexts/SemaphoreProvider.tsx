import { createContext, useContext, useEffect, useState } from "react"
import useLocalStorage from "@/hooks/useLocalStorage"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof, verifyProof } from "@semaphore-protocol/proof"
import SimpleWebAuthnBrowser from "@simplewebauthn/browser"

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
  const handleSignal = async (question: string) => {
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

    // verify proof with server and increase reputation
    const isValid = await verifyProof(fullProof, groupSize)

    // post to discord
    return isValid
  }

  const createSemaphoreId = async (sig: string) => {
    const { nullifier, trapdoor, commitment } = new Identity(sig)
    const data = {
      id: commitment,
      grp: groupId,
      reputation: 0,
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
    const options = generateRegistrationOptions({
      rpName: "heyauthn",
      rpID: "localhost", // "heyauthn.xyz"
      userID: user.id,
      userName: username,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: "none",
      // Prevent users from re-registering existing authenticators
      excludeCredentials: userAuthenticators.map((authenticator) => ({
        id: authenticator.credentialID,
        type: "public-key",
        // Optional
        transports: authenticator.transports,
      })),
    })
  }

  const handleAuthenticate = async () => {}

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
