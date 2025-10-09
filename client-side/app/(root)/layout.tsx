"use client";
import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { ThemeProvider } from 'next-themes';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const endpoint = "https://api.devnet.solana.com";

    const wallets = useMemo(
        () => [],
        []
    );

   return (
    <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
  );
}
