import './globals.css'

export const metadata = {
  title: 'GameVault PH — PC Games Store',
  description: 'Premium PC games available for download. Pay via GCash.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
