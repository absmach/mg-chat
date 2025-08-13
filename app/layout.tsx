import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./_components/providers/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Chat App",
  description: "This is a chat app that allows communication between two entities",
  icons: "/abstract-machines_logo_symbol-white.svg"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="dark:bg-background bg-background/10 text-popover-foreground font-sans antialiased"
      >
        <ThemeProvider
          attribute="class"
          enableColorScheme={true}
        >
          {children}
        </ThemeProvider>
        <Toaster
          richColors={true}
          expand={true}
          visibleToasts={1}
          closeButton={true}
        />
      </body>
    </html>
  );
}
