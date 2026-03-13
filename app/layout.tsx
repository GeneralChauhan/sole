import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sol — Your daily intelligence",
  description: "Your open loops captured & organized. Time to start closing them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <html lang="en">
      <body
        className={`${lora.variable} ${inter.variable} font-sans antialiased`}
        style={{
          ["--base-path" as string]: basePath ? `"${basePath}"` : '""',
          ["--pattern-url" as string]: basePath ? `"${basePath}/Pattern.png"` : '"/Pattern.png"',
        }}
      >
        {children}
      </body>
    </html>
  );
}
