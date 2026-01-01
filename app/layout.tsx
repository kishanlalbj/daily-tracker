import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/helpers";
import { UserProvider } from "@/contexts/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Daily Tracker",
  description: "Track your expense and health"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider user={user}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              {user && <AppSidebar />}

              <main className="w-full">
                {user && (
                  <div className="flex items-center h-14 px-4 border-b md:hidden">
                    <SidebarTrigger />
                  </div>
                )}
                <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
                  {children}
                </div>
              </main>
            </SidebarProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
