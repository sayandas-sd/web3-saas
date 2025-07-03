"use client";

import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Uploadimage } from "./Uploadimage";


export const Upload = () => {

    const [images, setImages] = useState<string[]>([])
    const [title, setTitle] = useState("")
    const { publicKey, sendTransaction } = useWallet();
    const [txSignature, setTxSignature] = useState("");
    const { connection } = useConnection();
    const router = useRouter()


    async function submit() {
        const response = await axios.post(`${BACKEND_URL}/user/task`,{
                options: images.map(image => ({
                    image_url: image
                })),
                title,
                signature: txSignature
            },{
                headers: {
                     "Authorization": localStorage.getItem("token"),
                     "Content-Type": "application/json"
                }
        })

        router.push(`/task/${response.data.id}`)
    }


    async function payment() {

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey!,
                toPubkey: new PublicKey("HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkzcZ"),
                lamports: 0.1 * LAMPORTS_PER_SOL
            })
        );


        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });

        await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature
        }, "confirmed");


        setTxSignature(signature);

    }

    return <div className="flex justify-center">
        <div className="max-w-screen-lg w-full">
            <div className="text-2xl text-left pt-20 w-full pl-4">
                Create a task
            </div>

            <label className="pl-4 block mt-2 text-md font-medium text-gray-900 text-black">Task details</label>

            <input onChange={(e) => {
                setTitle(e.target.value);
            }} type="text" id="first_name" className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="What is your task?" required />


            <label className="pl-4 block mt-8 text-md font-medium text-gray-900 text-black">Add Images</label>

            <div className="flex justify-center pt-4 max-w-screen-lg">
                {images.map((image, index) => 
                    <Uploadimage
                        key={index}
                        image={image} 
                        onImageAdd={(imageurl) => {
                        setImages(i => [...i, imageurl])
                    }}/>)
                }
            </div>

            <div className="ml-4 pt-2 flex justify-center">
                <Uploadimage onImageAdd={(imageurl) => {
                    setImages(i => [...i, imageurl]);
                } } image={""} />
            </div>


            <div className="flex justify-center">
                <button onClick={txSignature? submit : payment} type="button" className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                    {txSignature? "Submit" : "0.1 SOL"}
                </button>
            </div>
           
        </div>
    </div>
}
