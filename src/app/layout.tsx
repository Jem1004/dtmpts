import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'DPMPTSP Penajam Paser Utara',
  description: 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kabupaten Penajam Paser Utara',
  keywords: 'DPMPTSP, Penajam Paser Utara, Perizinan, Investasi, Pelayanan Publik',
  authors: [{ name: 'DPMPTSP PPU' }],
  openGraph: {
    title: 'DPMPTSP Penajam Paser Utara',
    description: 'Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kabupaten Penajam Paser Utara',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className={`${poppins.className} antialiased bg-background text-gray-900`}>
        {children}
      </body>
    </html>
  );
}