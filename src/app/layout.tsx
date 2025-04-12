import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Thumbnail Generator',
  description: 'Generate professional-looking thumbnails from your videos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
} 