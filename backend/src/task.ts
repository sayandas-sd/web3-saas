import { prisma } from "./db/db"


export const getTask = async (userId: number) => {

    const task = await prisma.task.findFirst({
            where: {
                successful: false,
                submission: {
                    none: {
                        workerId: userId,
                    }
                }
            },
            select: {
                id: true,
                amount: true,
                title: true,
                options: true
            }
        }) 

        return task;

}