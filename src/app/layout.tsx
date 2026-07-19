import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LO BY LUWA",
  description: "Unisex Nigerian fashion — joggers, shirts, face caps.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
