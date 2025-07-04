"use client";

import { BACKEND_URL } from "@/lib/api";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Appbar } from "@/components/Appbar";
import Image from "next/image";

async function getAllTask(taskId: string) {
  
  const response = await axios.get(`${BACKEND_URL}/user/task?taskId=${taskId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-Type": "application/json"
      },
    }
  );

  return response.data;  
}

export default function TaskPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = params?.taskId;

  const [result, setResult] = useState<
    Record<string, { count: number; option: { imageUrl: string } }>
  >({});
  const [taskDetails, setTaskDetails] = useState<{ title?: string } | null>(null);

  useEffect(() => {
    if (!taskId) return;
    getAllTask(taskId).then((data) => {
     
      setResult(data.result);
      setTaskDetails(data.taskDetails);
    });
  }, [taskId]);

  return (
    <div>
      <Appbar />
      <div className="text-2xl pt-20 flex justify-center">
        {taskDetails?.title || "Loading..."}
      </div>
      <div className="flex justify-center pt-8">
        {Object.keys(result || {}).map((key) => (
          <Task key={key} imageUrl={result[key].option.imageUrl} votes={result[key].count} />
        ))}
      </div>
    </div>
  );
}

function Task({ imageUrl, votes }: { imageUrl: string; votes: number }) {
   
  return (
    <div className="p-2">
      <Image className="p-2 w-96 rounded-md" src={imageUrl} alt="Task option" width={384} height={384}/>
      <div className="flex justify-center">{votes}</div>
    </div>
  );
}

