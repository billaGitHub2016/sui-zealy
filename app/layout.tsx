import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";
import "../styles/loading.css";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/providers/sui-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata = {
  title: "SUI-Zealy",
  description: "Generate awesome headshots in minutes using AI",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <Providers>
        <body className="min-h-screen flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <section>
              <Suspense
                fallback={
                  <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between h-[69px]" />
                }
              >
                <Navbar />
              </Suspense>
            </section>
            <main className="flex flex-1 flex-col items-center py-9">
              {children}
            </main>
            <Footer />
            <Toaster />
          </ThemeProvider>
          <Analytics />
        </body>
      </Providers>
    </html>
  );
}
