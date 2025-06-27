import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user1 = await prisma.user.create({
        data:  {
            address: "URkRK2BH29cz6i54zsW9D8FPoumx2bKFPfpuS6umez8"
        }
    })

    const user2 = await prisma.user.create({
        data: {
            address: "URkRK2BH29cz6i54zsW9D8FPoumx2bKFPfpuS6umez8"
        }
    })


    const worker1 = await prisma.worker.create({
        data: {
            address: "HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkzcZ",
            pendingAmount: 0,
            lockedAmount: 0
        }
    })

    const worker2 = await prisma.worker.create({
        data: {
            address: "HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkzcZnm",
            pendingAmount: 0,
            lockedAmount: 0
        }
    })

    const task1 = await prisma.task.create({
        data: {
            title: "which is dog",
            signature: "sasasas",
            amount: 10,
            userId: user1.id,
            options: {
                create: [
                    {
                        image_url: "https://i.guim.co.uk/img/media/327aa3f0c3b8e40ab03b4ae80319064e401c6fbc/377_133_3542_2834/master/3542.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=34d32522f47e4a67286f9894fc81c863",
                    },
                    {
                        image_url: "https://www.dogstrust.org.uk/images/800x600/assets/2025-03/toffee%202.jpg",
                    }
                ]
            },
        },
        include: {
            options: true
        },
    })

    const task2 = await prisma.task.create({
        data: {
            title: 'which is cat',
            signature: 'newew',
            amount: 20,
            userId: user2.id,
            options: {
                create: [
                    { 
                        image_url: 'https://i.guim.co.uk/img/media/327aa3f0c3b8e40ab03b4ae80319064e401c6fbc/377_133_3542_2834/master/3542.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=34d32522f47e4a67286f9894fc81c863', 
                    },
                    { 
                        image_url: "https://www.dogstrust.org.uk/images/800x600/assets/2025-03/toffee%202.jpg", 
                    },
                ],
            },
        },
        include: { 
            options: true 
        },
    });

    const SUBMISSION = 100;

    const amountTask1 = (Number(task1.amount) / SUBMISSION);
    const amountTask2 = (Number(task2.amount) / SUBMISSION);

    await prisma.submission.create({
        data: {
            workerId: worker1.id,
            optionId: task1.id,
            taskId: task1.id,
            amount: amountTask1,
        },
  });

    await prisma.worker.update({
        where: { 
            id: worker1.id 
        },
        data: {
            pendingAmount: {
                increment: Number(amountTask1),
            },
        },
    });

    await prisma.submission.create({
        data: {
            workerId: worker2.id,
            optionId: task2.id,
            taskId: task2.id,
            amount: amountTask2,
        },
    });

    await prisma.worker.update({
        where: { 
            id: worker2.id 
        },
        data: {
            pendingAmount: {
                increment: Number(amountTask2),
            },
        },
    });




}


main();
 