"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import Link from "next/link";
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/api';

export function Appbar() {

    const { publicKey, signMessage } = useWallet();
    const [hydration, setHydration] = useState(false);

    useEffect(() => {    
        setHydration(true);
    }, []);

    async function SignMessageAndSend() {

            if (!publicKey) {
                return;
            }

            if(!signMessage) {
                return;
            }
            
            
            const message = new TextEncoder().encode("wants you to sign in with your Solana account")
    
            const signature = await signMessage(message);

            const response = await axios.post(`${BACKEND_URL}/user/signin`, {
                signature,
                publicKey: publicKey?.toString()
            })

            localStorage.setItem("token", response.data.token)

    }

    useEffect(() => {
        SignMessageAndSend()
    }, [publicKey])

    if (!hydration) return null;

    return <div className="flex justify-between border-b border-gray-200 pb-2 pt-2">
        <Link href="/">
            <div className="text-2xl pl-4 flex justify-center pt-3">
                LebeliFy
            </div>
        </Link>
        <div className="text-xl pr-4 pb-2">
             {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton /> }
        </div>
    </div>
}

