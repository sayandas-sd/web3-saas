/*
  Warnings:

  - You are about to drop the column `userId` on the `Pay` table. All the data in the column will be lost.
  - Added the required column `workerId` to the `Pay` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Pay" DROP CONSTRAINT "Pay_userId_fkey";

-- AlterTable
ALTER TABLE "Pay" DROP COLUMN "userId",
ADD COLUMN     "workerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Pay" ADD CONSTRAINT "Pay_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
