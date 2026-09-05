import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'Aurelis Research Centre',
  description: 'Get paid to test skincare, haircare, and grooming products. Open trials in Visakhapatnam, Hyderabad, and Bangalore.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --bg: #FAF8F5; --surface: #FFFFFF; --sand: #F2EEE8;
            --ink: #1F1D1B; --ink2: #57524C; --ink3: #8B857D;
            --line: #E4DED4; --accent: #5E7460; --accent-soft: #EAEEE7;
            --accent-ink: #3F5242; --warn: #8A6A3A; --warn-soft: #F5EDE0;
            --err: #8C4A42; --err-soft: #F6E9E7;
            --serif: "Newsreader", Georgia, serif;
            --sans: "Manrope", system-ui, sans-serif;
          }
          * { box-sizing: border-box; }
          html { scroll-behavior: smooth; }
          body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
          a { color: var(--accent-ink); text-decoration: none; }
          a:hover { color: var(--ink); }
          button { font-family: var(--sans); cursor: pointer; }
          input, select, textarea { font-family: var(--sans); font-size: 15px; color: var(--ink); }
          :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
          ::selection { background: var(--accent-soft); }
          p { margin: 0 0 8px; }
          h1, h2, h3 { margin: 0; }
        `}</style>
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
