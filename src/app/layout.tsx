import "./globals.css";
import Providers from "./providers";

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.className} ${GeistMono.className}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
