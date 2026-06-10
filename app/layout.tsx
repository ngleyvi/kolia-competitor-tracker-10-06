import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kolia Competitor Intelligence Tracker",
  description: "Dashboard demo theo dõi, phân tích và chuẩn hóa nghiên cứu đối thủ cho Kolia Phan."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
