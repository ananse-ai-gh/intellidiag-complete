import { Inter } from 'next/font/google'
import StyledComponentsRegistry from '@/lib/registry'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'IntelliDiag - AI-Powered Medical Diagnostics',
  description: 'Revolutionizing Diagnosis with the help of Artificial Intelligence',
  keywords: 'medical, diagnostic, ai, healthcare, radiology',
  authors: [{ name: 'IntelliDiag Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
