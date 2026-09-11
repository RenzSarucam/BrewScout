import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { AuthProvider } from "@/hooks/use-auth";
import { SavedPlacesProvider } from "@/hooks/use-saved-places";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brew Scout — Find your next great cup, wherever you are.",
  description:
    "Discover great coffee shops around you, explore ratings and reviews, and find the best route to your next cup.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SavedPlacesProvider>
            <AppShell>{children}</AppShell>
          </SavedPlacesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
