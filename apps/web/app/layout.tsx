import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cover-generator",
  description: "Generate Apple Music-style date covers from one photo."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

