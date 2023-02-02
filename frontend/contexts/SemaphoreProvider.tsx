import { createContext, useContext, useEffect } from "react"
import useLocalStorage from "@/hooks/useLocalStorage"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof, verifyProof } from "@semaphore-protocol/proof"

function SemaphoreProvider({ children }: { children?: React.ReactNode }) {
  // Pass in unique ZKIAP group ID into Group constructor
  // Generate group from database
  const groupSize = 20
  const group = new Group(1, groupSize)
  const [userId, setStoredUser] = useLocalStorage<string>("id", null)

  if (!userId) {
    // Pass in result of WebAuthn auth into Identity constructor
    setStoredUser(new Identity("webauthn").toString())
  }

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

  return (
    <SemaphoreContext.Provider
      value={{
        group,
        userId,
        handleAddMember,
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
