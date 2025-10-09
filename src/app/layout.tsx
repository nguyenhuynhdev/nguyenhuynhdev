import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata, ResolvingMetadata } from 'next';
import Providers from "./providers";
import type { LocaleParams } from '@/types/next-intl';
import { getPageMetadata } from '@/lib/getPageMetadata';

export async function generateMetadata(
  { params: { locale } }: LocaleParams,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return getPageMetadata(locale, 'home', parent);
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         {children}
//       </body>
//     </html>
//   );
// }