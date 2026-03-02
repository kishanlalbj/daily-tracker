import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/helpers";
import { UserProvider } from "@/contexts/UserContext";
import { User } from "@/types";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Tracker",
  description: "Track your expense and health"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user: User | null = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cascadia+Mono:ital,wght@0,200..700;1,200..700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <UserProvider user={user}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <SidebarProvider>
              {user && <AppSidebar />}

              <main className="w-full">
                {user && (
                  <div className="flex items-center h-14 px-4 border-b md:hidden">
                    <SidebarTrigger />
                  </div>
                )}
                {children}
              </main>
            </SidebarProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
