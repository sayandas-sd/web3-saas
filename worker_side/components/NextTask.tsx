"use client";
import { BACKEND_URL } from "@/lib/api"
import axios from "axios"
import { useEffect, useState } from "react"

interface TaskType {
        id: number,
        amount: number,
        title: string,
        options: {
                id: number,
                image_url: string,
                taskId: number
        }[]
}

export default function NextTask() {

    const [currentTask, setCurrentTask] = useState<TaskType | null>(null)
    const [loading, setLoading] = useState(true)
    const [submission, setSubmission] = useState(false)


    useEffect(() => {
        setLoading(true)
        axios.get(`${BACKEND_URL}/worker/task`, {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        })
        .then(res => {
            setCurrentTask(res.data.allTask);
            setLoading(false)
        })
        .catch(e => {
            setLoading(false)
            setCurrentTask(null)
        })
    }, [])

    if(loading) {
        return <div className="h-screen flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                Loading...
            </div>
        </div>
    }

    if(!currentTask) {
        return <div className="h-screen flex justify-center flex-col">
            <div className="w-full flex justify-center text-2xl">
                There are no pending tasks 
            </div>
        </div>
    }

    return <div>
        <div className="text-2xl pt-20 flex justify-center">
           {currentTask.id}. {currentTask.title}
            <div className="pl-4">
                {submission && "Submitting..."}
            </div>
        </div>
        
        <div className="flex justify-center pt-8">
            {currentTask.options.map((option) => 
                <Option onSelect={async () => {

                    setSubmission(true);

                    try {
                        const response = await axios.post(`${BACKEND_URL}/worker/submission`, {
                                taskId: currentTask.id.toString(),
                                selectId: option.id.toString()
                            }, {     
                                headers: {
                                    "Authorization": localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MDMzNjI2N30.keOXqlftslLTmXKvTiiO_sqEKbV9h4vCiPIrn2E_JTg"
                                }
                            });

                        const Task = response.data.nextTask;
                        if (Task) {
                            setCurrentTask(Task)
                        } else {
                            setCurrentTask(null);
                        }

                    } catch(e) {
                        console.log(e)
                    }

                    setSubmission(false)

                }} imageUrl={option.image_url} key={option.id}/> )}
        </div>
    </div>
}

function Option({imageUrl, onSelect}: {
    imageUrl: string,
    onSelect: () => void;
}) {
    return <div>
        <img src={imageUrl} alt="option" onClick={onSelect} className="p-2 w-96 rounded-md"/>
    </div>

}