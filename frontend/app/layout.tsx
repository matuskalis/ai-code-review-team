import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "CodeReview AI – Automated Multi-Agent Code Review",
  description: "Automated AI code review with CWE detection, Big-O analysis, and maintainability scoring in under 30 seconds. Used in 10,000+ reviews with 4.8/5 quality score.",
  keywords: ["ai code review", "code analysis", "security audit", "performance optimization", "code quality", "static analysis", "vulnerability detection", "automated code review"],
  authors: [{ name: "AI Code Review Team" }],
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
    { media: "(prefers-color-scheme: light)", color: "#020617" },
  ],
  openGraph: {
    title: "AI Code Review Team – Automated Multi-Agent Code Analysis",
    description: "Get comprehensive code reviews in 30 seconds with specialized AI agents for security, performance, and style.",
    type: "website",
    locale: "en_US",
    siteName: "AI Code Review Team",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Code Review Team – Multi-Agent Code Analysis",
    description: "Automated code reviews with AI-powered security, performance, and style analysis in 30 seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AskNim AI Review",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
