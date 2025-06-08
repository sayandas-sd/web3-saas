import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user1 = await prisma.user.create({
        data:  {
            address: "HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkzc"
        }
    })

    const user2 = await prisma.user.create({
        data: {
            address: "HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkz"
        }
    })


    const worker1 = await prisma.worker.create({
        data: {
            address: "nknka",
            pendingAmount: 0,
            lockedAmount: 0
        }
    })

    const worker2 = await prisma.worker.create({
        data: {
            address: "sasnaks",
            pendingAmount: 0,
            lockedAmount: 0
        }
    })

    const task1 = await prisma.task.create({
        data: {
            title: "which is most voted one",
            signature: "sasasas",
            amount: "10",
            userId: user1.id,
            options: {
                create: [
                    {
                        image_url: "asas", optionId: 0
                    },
                    {
                        image_url: "s", optionId: 1
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
            title: 'whics is dog',
            signature: 'newew',
            amount: '20',
            userId: user2.id,
            options: {
                create: [
                    { 
                        image_url: 'https://new.com', 
                        optionId: 0 
                    },
                    { 
                        image_url: 'https://lol.com', 
                        optionId: 1 
                    },
                ],
            },
        },
        include: { 
            options: true 
        },
    });

    const SUBMISSION = 100;

    const amountTask1 = (Number(task1.amount) / SUBMISSION).toString();
    const amountTask2 = (Number(task2.amount) / SUBMISSION).toString();

    await prisma.submission.create({
    data: {
      workerId: worker1.id,
      optionId: task1.options[0].id,
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
        optionId: task2.options[1].id,
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
 