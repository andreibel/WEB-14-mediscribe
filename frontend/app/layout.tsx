import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { AppNav } from "@/components/app/nav/AppNav";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mediscribe",
  description:
    "Real-time voice transcription and smart summaries for the trauma team at Ziv Medical Center.",
};

/**
 * Root layout — the app shell that wraps every route group (including
 * `(auth)`). Sets the font and applies the persisted theme before paint
 * so there's no light/dark flash on load.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-mono", manrope.variable, jetbrainsMono.variable)} suppressHydrationWarning>
      <head>
        <script
          // no-flash theme: runs before first paint
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('ms-theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
