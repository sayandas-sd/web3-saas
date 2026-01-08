"use client";

import { BACKEND_URL } from "@/lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ToggleButton } from "./ToggleButton";
import { Button } from "./ui/button";

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
        
        <div className="text-xl pr-4 pb-2 flex">
            <div className='mr-5 flex flex-col justify-center items-center'>
                <ToggleButton/>
            </div>
            <div>
                <Button onClick={() => {
                axios.post(`${BACKEND_URL}/worker/withdraw`, {
                    
                }, {
                    headers: {
                        "Authorization": localStorage.getItem("token"),
                         "Content-Type": "application/json"
                    }
                })
            }} className="cursor-pointer mr-5">
                Withdraw ({balance})
            </Button>
            {publicKey ?  <WalletDisconnectButton /> :  <WalletMultiButton />}
            </div>
            
        </div>
    </div>
}