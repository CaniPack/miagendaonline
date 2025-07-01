import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
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
  title: "Mi Agenda Online - Sistema de Citas Profesional",
  description: "Sistema completo de gestión de citas con autenticación, clientes y planes de suscripción",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConditionalClerkProvider>
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ConditionalClerkProvider>
  );
}
