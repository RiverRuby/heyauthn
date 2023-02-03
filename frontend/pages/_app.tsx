import { SemaphoreProvider } from "@/contexts/SemaphoreProvider"
import { Provider } from "react-wrap-balancer"

import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { Inter as FontSans } from "@next/font/google"
import { ThemeProvider } from "next-themes"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
				:root {
					--font-sans: ${fontSans.style.fontFamily};
				}
			}`}</style>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SemaphoreProvider>
          <Provider>
            <Component {...pageProps} />
          </Provider>
        </SemaphoreProvider>
      </ThemeProvider>
    </>
  )
}
