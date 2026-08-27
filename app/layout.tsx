import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub PR Mentor AI",
  description:
    "A learning-first app that explains GitHub pull request comments, failed checks, commits, and conflicts."
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
