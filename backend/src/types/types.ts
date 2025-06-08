import { z } from "zod";


export const submissionInput = z.object({
    taskId: z.string(),
    selectId: z.string()
});

export const taskInput = z.object({
    options: z.array(z.object({
        image_url: z.string()
    })),
    title: z.string().min(10).optional(),
    signature: z.string()
})