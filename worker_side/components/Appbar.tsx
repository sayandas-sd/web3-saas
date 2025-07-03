"use client";

import { BACKEND_URL } from "@/lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Appbar() {

    const { publicKey, signMessage } = useWallet();
    const [hydration, setHydration] = useState(false);
    const [balance, setBalance] = useState(0);

      useEffect(() => {    
        setHydration(true);
    }, []);


    async function SignMessageSend() {
        
        if(!publicKey) {
            return;
        }

        if(!signMessage) {
            return;
        }

        const message = new TextEncoder().encode("wants you to sign in with your Solana account as a worker");

        const signature = await signMessage(message);


        console.log("publickey",publicKey)
        console.log("signature",signature);


        const response = await axios.post(`${BACKEND_URL}/worker/signin`, {
            signature,
            publicKey: publicKey?.toString()
        })


         setBalance(response.data.amount)

        localStorage.setItem("token", response.data.token)
        
    }

    useEffect(()=>{
        SignMessageSend()
    }, [publicKey])

    if(!hydration) return null;

     return <div className="flex justify-between border-b border-gray-200 pb-2 pt-2">
        <Link href="/">
            <div className="text-2xl pl-4 flex justify-center pt-3">
                LebeliFy
            </div>
        </Link>
        <div className="text-xl pr-4 pb-2">
            <button onClick={() => {
                axios.post(`${BACKEND_URL}/worker/withdraw`, {
                    
                }, {
                    headers: {
                        "Authorization": localStorage.getItem("token"),
                         "Content-Type": "application/json"
                    }
                })
            }} className="m-2 mr-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                Pay ({balance})
            </button>
            {publicKey ?  <WalletDisconnectButton /> :  <WalletMultiButton />}
        </div>
    </div>
}