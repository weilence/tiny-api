-- CreateEnum
CREATE TYPE "public"."ProjectRole" AS ENUM ('GUEST', 'DEVELOPER', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."GroupUser" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."ProjectRole" NOT NULL DEFAULT 'GUEST',

    CONSTRAINT "GroupUser_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateTable
CREATE TABLE "public"."ProjectUser" (
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."ProjectRole" NOT NULL DEFAULT 'GUEST',

    CONSTRAINT "ProjectUser_pkey" PRIMARY KEY ("projectId","userId")
);
