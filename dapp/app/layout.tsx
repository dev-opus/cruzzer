import './globals.css';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getConfig, Providers } from '@/app/config';
import { cookieToInitialState } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get('cookie')
  );
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialState={initialState}>
          <div className="container">
            <header>
              <div className="logo">
                <span>Cruzzer NFTs</span>
              </div>
              <div className="wallet">
                <ConnectButton />
              </div>
            </header>

            <div className="sidebar-wrapper">
              <div className="sidebar">
                <div className="side-nav">
                  <ul>
                    <Link href={'/'} className="links">
                      <li>Home</li>
                    </Link>

                    <Link href="/minter" className="links">
                      <li>Minter</li>
                    </Link>
                    <Link href={'/bazaar'} className="links">
                      <li>Bazaar</li>
                    </Link>
                  </ul>
                </div>
              </div>
            </div>

            <div className="main-content">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
