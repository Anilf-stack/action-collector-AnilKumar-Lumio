// app/layout.tsx
export const metadata = { title: "AI Meeting Summarizer" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ padding: 16 }}>{children}</body>
    </html>
  );
}
