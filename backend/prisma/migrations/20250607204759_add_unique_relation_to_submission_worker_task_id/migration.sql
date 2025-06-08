/*
  Warnings:

  - A unique constraint covering the columns `[workerId,taskId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Submission_workerId_taskId_key" ON "Submission"("workerId", "taskId");
