-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'MEMBER';
