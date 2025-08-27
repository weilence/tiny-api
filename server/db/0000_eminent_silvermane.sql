CREATE TYPE "public"."HttpMethod" AS ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS');--> statement-breakpoint
CREATE TYPE "public"."ProjectRole" AS ENUM('GUEST', 'DEVELOPER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('MEMBER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "EndpointGroup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parentId" uuid,
	"projectId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Endpoint" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"method" "HttpMethod" NOT NULL,
	"path" text NOT NULL,
	"description" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"body" jsonb,
	"response" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"groupId" uuid NOT NULL,
	"headers" jsonb[] DEFAULT '{}',
	"queryParams" jsonb[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "GroupUser" (
	"groupId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" "ProjectRole" DEFAULT 'GUEST' NOT NULL,
	CONSTRAINT "GroupUser_pkey" PRIMARY KEY("groupId","userId")
);
--> statement-breakpoint
CREATE TABLE "Group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProjectUser" (
	"projectId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" "ProjectRole" DEFAULT 'GUEST' NOT NULL,
	CONSTRAINT "ProjectUser_pkey" PRIMARY KEY("projectId","userId")
);
--> statement-breakpoint
CREATE TABLE "Project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"groupId" uuid NOT NULL,
	"icon" text
);
--> statement-breakpoint
CREATE TABLE "Setting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"role" "UserRole" DEFAULT 'MEMBER' NOT NULL,
	"lastLoginAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "EndpointGroup" ADD CONSTRAINT "EndpointGroup_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."EndpointGroup"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EndpointGroup" ADD CONSTRAINT "EndpointGroup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."EndpointGroup"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting" USING btree ("key" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_username_key" ON "User" USING btree ("username" text_ops);