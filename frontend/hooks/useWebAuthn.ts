import { client } from "@passwordless-id/webauthn"

function useWebAuthn() {
  const handleAuthenticate = async () => {
    if (typeof window === "undefined") return
    const challenge = new Uint8Array(32)
    console.log("🚀 ~ handleAuthenticate ~ challenge", challenge)
    window.crypto.getRandomValues(challenge)
    const registration = await client.register(
      "my-username",
      "randomly-generated-challenge-to-avoid-replay-attacks"
    )
    console.log("🚀 ~ handleAuthenticate ~ registration", registration)
  }
  return { onAuthenticate: handleAuthenticate }
}

export default useWebAuthn
