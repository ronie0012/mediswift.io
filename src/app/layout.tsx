import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito-sans',
});

export const metadata: Metadata = {
  title: 'MediSwift - Your Complete Healthcare Solution',
  description: 'MediSwift offers a complete healthcare solution - from doctor consultations to medicine delivery, all in one place.',
  keywords: 'healthcare, medicine, doctor, appointment, prescription, delivery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 