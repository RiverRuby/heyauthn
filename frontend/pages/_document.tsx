import { Head, Html, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      {/* <body className="min-h-screen bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-stone-600 via-sky-700 to-slate-400 font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50"> */}
      <body className="min-h-screen bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-sky-900 via-sky-700 to-slate-400 font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
