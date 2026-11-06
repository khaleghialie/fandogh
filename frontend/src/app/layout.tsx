import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fandogh | Project boards",
  description: "A focused, visual workspace for managing project tasks.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
