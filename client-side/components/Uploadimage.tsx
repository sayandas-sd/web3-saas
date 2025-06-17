"use client";



import { BACKEND_URL, CDN } from "@/lib/api";
import axios from "axios";
import { useState } from "react";

interface ImageType {
    onImageAdd: (image: string) => void;
    image: string;
}

export function Uploadimage({onImageAdd, image}: ImageType) {

    const [upload, setUpload] = useState(false);

    async function fileSelect(e:any) {
        setUpload(true);
        const file = e.target.files[0];
        const response = await axios.get(`${BACKEND_URL}/user/presignedurl`);

        const preSignedUrl = response.data.preSignedUrl;
        const key = response.data.key;

        await axios.put(preSignedUrl, file, {
            headers: {
                "Content-Type": file.type
            }
        });
        const r2BaseUrl = `${CDN}/web3-saas/`;
        const imageUrl = `${r2BaseUrl}${key}`; 
        onImageAdd(imageUrl);
        setUpload(false);
        
    }

    if (image) {
        return <img className={"p-2 w-96 rounded"} src={image} />;
    }

    return <div className="w-40 h-40 rounded border text-2xl cursor-pointer">
        <div className="h-full flex justify-center flex-col relative w-full">
            <div className="h-full flex justify-center w-full pt-16 text-4xl">
                {upload ? <div className="text-sm">Loading...</div> : <>
                    + 
                    <input  type="file" 
                            onChange={fileSelect} 
                            className="w-full h-full bg-red-400 w-40 h-40"
                            style={{position: "absolute", opacity: 0, top: 0, left: 0, bottom: 0, right: 0, width: "100%", height: "100%"}}
                    />
                </>}
            </div>
        </div>
    </div>
}