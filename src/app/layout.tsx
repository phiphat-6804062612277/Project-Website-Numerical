import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Linear System - Matrix Solver',
  description: 'ระบบคำนวณและแสดงวิธีทำสมการเชิงเส้นทีละสเต็ป (Step-by-Step Visualizer) พัฒนาด้วยสถาปัตยกรรม OOP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
