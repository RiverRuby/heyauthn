import { SemaphoreProvider } from "@/contexts/SemaphoreProvider"
import { Provider } from "react-wrap-balancer"

import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { Karla as FontSans } from "@next/font/google"
import { ThemeProvider } from "next-themes"

import { Layout } from "@/components/layout"

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
      <ThemeProvider attribute="class" defaultTheme="light">
        <SemaphoreProvider>
          <Provider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Provider>
        </SemaphoreProvider>
      </ThemeProvider>
    </>
  )
}
