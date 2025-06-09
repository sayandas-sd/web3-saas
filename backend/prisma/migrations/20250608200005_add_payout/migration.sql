/*
  Warnings:

  - Changed the type of `amount` on the `Submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Successful', 'Pending', 'Processing');

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Pay" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,

    CONSTRAINT "Pay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pay" ADD CONSTRAINT "Pay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
