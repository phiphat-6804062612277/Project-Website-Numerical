import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'NumeriCraft - Matrix & Linear System Solver',
  description: 'ระบบคำนวณและแสดงวิธีทำสมการเชิงเส้นทีละสเต็ป (Step-by-Step Visualizer) พัฒนาด้วยสถาปัตยกรรม OOP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
