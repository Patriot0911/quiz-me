import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { geistMono, geistSans } from '@/fonts/geist';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/cn';

import '@/styles/global.scss';

export const metadata: Metadata = {
  title: "Quiz Me",
};

const RootLayout = ({ children, }: Readonly<PropsWithChildren>) => {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          geistSans.className,
          'antialiased'
        )}
      >
        <Providers>
          {children}
          <Toaster
            toastOptions={{
              position: 'bottom-right',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
