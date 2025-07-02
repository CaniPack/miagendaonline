import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import ToastProvider from '@/components/ToastProvider';
import "./globals.css";

// Wrapper condicional para desarrollo
function ConditionalClerkProvider({ children }: { children: React.ReactNode }) {
  const isDevelopment = process.env.DEVELOPMENT_MODE === 'true';
  
  if (isDevelopment) {
    return <>{children}</>;
  }
  
  return <ClerkProvider>{children}</ClerkProvider>;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi Agenda Online - Sistema Profesional de Citas",
  description: "Plataforma profesional para gestión de citas, clientes e ingresos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConditionalClerkProvider>
      <html lang="es" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <ToastProvider>
        {children}
          </ToastProvider>
      </body>
    </html>
    </ConditionalClerkProvider>
  );
}
