import '@/styles/globals.css'
import '@/styles/reset.css'

import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

const interFont = Inter({
   subsets: ['latin'],
   weight: ['400', '500', '600', '700'],
   variable: '--font-inter',
   preload: true
})

export const metadata: Metadata = {
   metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
   title: {
      default: 'OrganiFlow | Interactive Organization Chart Tool',
      template: '%s | OrganiFlow'
   },
   description:
      'Professional tool for visualizing and managing organizational structures with interactive drag-and-drop functionality. Create, edit, and analyze your company hierarchy with ease.',
   keywords: [
      'organization chart',
      'org chart',
      'organizational structure',
      'employee hierarchy',
      'company structure',
      'team management',
      'interactive org chart',
      'drag and drop org chart',
      'employee management',
      'reporting structure'
   ],
   authors: [
      {
         name: 'Rafael Ricco',
         url: 'https://github.com/rafaeelricco'
      }
   ],
   creator: 'Rafael Ricco',
   openGraph: {
      type: 'website',
      locale: 'en_US',
      title: 'OrganiFlow | Interactive Organization Chart Tool',
      description:
         'Visualize and manage your organizational structure with an interactive, drag-and-drop organization chart tool. Perfect for companies of all sizes.',
      siteName: 'OrganiFlow'
   },
   twitter: {
      card: 'summary_large_image',
      title: 'OrganiFlow | Interactive Organization Chart Tool',
      description:
         'Visualize and manage your organizational structure with an interactive, drag-and-drop organization chart tool. Perfect for companies of all sizes.',
      creator: '@seuhandle'
   },
   robots: {
      index: true,
      follow: true,
      googleBot: {
         index: true,
         follow: true,
         'max-video-preview': -1,
         'max-image-preview': 'large',
         'max-snippet': -1
      }
   }
} as Metadata

export default async function Root({
   children
}: Readonly<{
   children: React.ReactNode
}>) {
   return (
      <html lang="pt-BR" suppressHydrationWarning>
         <head>
            <link
               rel="preconnect"
               href="https://fonts.googleapis.com"
               crossOrigin="anonymous"
            />
            <link
               rel="preconnect"
               href="https://fonts.gstatic.com"
               crossOrigin="anonymous"
            />
            <link
               rel="preload"
               href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
               as="style"
            />
            <link
               rel="stylesheet"
               href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
            />
            <link
               rel="stylesheet"
               href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=block"
            />
            <link
               rel="stylesheet"
               href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
            />
            <link
               rel="stylesheet"
               href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&display=swap"
            />
         </head>
         <body
            id="root"
            className={cn(interFont.variable)}
            suppressHydrationWarning
         >
            <ThemeProvider
               enableSystem
               disableTransitionOnChange
               attribute="class"
               defaultTheme="light"
            >
               {children}
            </ThemeProvider>
            <Toaster />
         </body>
      </html>
   )
}
