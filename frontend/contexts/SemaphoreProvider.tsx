import { createContext, useContext, useEffect, useState } from "react"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/typescript-types"

function SemaphoreProvider({ children }: { children?: React.ReactNode }) {
  const groupSize = 20 // 2**20 members
  const minAnonSet = 10
  const [groupId, setGroupId] = useState(1)

  // Signals currently authenticated user
  const handleSignal = async (question: string) => {
    // TODO: get user from regenerated sig
    // const identity = new Identity(userId)
    const identity = new Identity(
      "MEYCIQCwV1qbBKJmCljpLtPd_UiJPg3XYoc7Qv2XKNyylsnX_QIhAPoxn0CgyPM7LwgTH30Fl4nGczJ-sB33GHhtrRrEBNFS"
    )

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
    } else {
      const bigIntMembers = members.map((e) => {
        return BigInt(e.semaphorePublicKey)
      })
      group.addMembers(bigIntMembers)
    }

    const signal = 1
    const fullProof = await generateProof(identity, group, groupId, signal, {
      zkeyFilePath: "./semaphore.zkey",
      wasmFilePath: "./semaphore.wasm",
    })

    console.log("identity", identity)
    const questionData = {
      semaphorePublicKey: identity.commitment.toString(),
      proof: fullProof,
      groupSize: groupSize,
      message: question,
    }

    // verify proof with server and increase reputation + post to discord
    const isValid = await fetch("/api/reputation", {
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
    // gets registration options from server
    const genOptionsResp = await fetch("/api/genOptions?username=" + username, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json())
    const options = genOptionsResp.body

    // generates a key pair from the authenticator
    const attResp: RegistrationResponseJSON = await startRegistration(options)
    console.log("🚀 ~ handleRegister ~ attResp", attResp)

    // send to server to verify public key and add to database
    const verificationResp = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attResp: attResp,
        expectedChallenge: options.challenge,
        username: username,
        groupId: groupId,
      }),
    })
    const verificationJSON = await verificationResp.json()

    if (verificationJSON && verificationJSON.verified) {
      // do something on success
    }
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
        handleAuthenticate,
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
  handleAuthenticate: () => void
  handleRegister: (username: string) => void
  handleSignal: (question: string) => void
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
