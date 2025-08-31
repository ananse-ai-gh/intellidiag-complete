import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import StyledComponentsRegistry from "@/lib/registry"
import { AuthProvider } from "@/contexts/AuthContext"
import { ModalProvider } from "@/contexts/ModalContext"
import PageTransition from "@/components/PageTransition"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
})

export const metadata: Metadata = {
  title: "IntelliDiag - AI-Powered Medical Diagnostics",
  description: "Revolutionizing Diagnosis with the help of Artificial Intelligence",
  keywords: "medical, diagnostic, ai, healthcare, radiology",
  authors: [{ name: "IntelliDiag Team" }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.className}`} suppressHydrationWarning={true}>
        <StyledComponentsRegistry>
          <AuthProvider>
            <ModalProvider>
              <PageTransition>
                {children}
              </PageTransition>
            </ModalProvider>
          </AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
