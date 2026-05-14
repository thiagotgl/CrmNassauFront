import type { Metadata } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { ToastProvider } from "@/components/toast-provider";

export const metadata: Metadata = {
  title: "Global CRM",
  description: "Sistema de gestão Global CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
