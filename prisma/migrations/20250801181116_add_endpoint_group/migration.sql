/*
  Warnings:

  - You are about to drop the column `projectId` on the `Endpoint` table. All the data in the column will be lost.
  - The `headers` column on the `Endpoint` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `queryParams` column on the `Endpoint` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `groupId` to the `Endpoint` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Endpoint" DROP CONSTRAINT "Endpoint_projectId_fkey";

-- AlterTable
ALTER TABLE "Endpoint" DROP COLUMN "projectId",
ADD COLUMN     "groupId" TEXT NOT NULL,
DROP COLUMN "headers",
ADD COLUMN     "headers" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "queryParams",
ADD COLUMN     "queryParams" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- CreateTable
CREATE TABLE "EndpointGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EndpointGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EndpointGroup" ADD CONSTRAINT "EndpointGroup_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EndpointGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndpointGroup" ADD CONSTRAINT "EndpointGroup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EndpointGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
