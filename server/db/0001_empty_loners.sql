ALTER TABLE "EndpointGroup" DROP CONSTRAINT "EndpointGroup_parentId_fkey";
--> statement-breakpoint
ALTER TABLE "EndpointGroup" DROP CONSTRAINT "EndpointGroup_projectId_fkey";
--> statement-breakpoint
ALTER TABLE "Endpoint" DROP CONSTRAINT "Endpoint_groupId_fkey";
--> statement-breakpoint
ALTER TABLE "GroupUser" DROP CONSTRAINT "GroupUser_groupId_fkey";
--> statement-breakpoint
ALTER TABLE "GroupUser" DROP CONSTRAINT "GroupUser_userId_fkey";
--> statement-breakpoint
ALTER TABLE "ProjectUser" DROP CONSTRAINT "ProjectUser_projectId_fkey";
--> statement-breakpoint
ALTER TABLE "ProjectUser" DROP CONSTRAINT "ProjectUser_userId_fkey";
--> statement-breakpoint
ALTER TABLE "Project" DROP CONSTRAINT "Project_groupId_fkey";
--> statement-breakpoint
DROP INDEX "Setting_key_key";--> statement-breakpoint
DROP INDEX "User_email_key";--> statement-breakpoint
DROP INDEX "User_username_key";--> statement-breakpoint
ALTER TABLE "GroupUser" DROP CONSTRAINT "GroupUser_pkey";--> statement-breakpoint
ALTER TABLE "ProjectUser" DROP CONSTRAINT "ProjectUser_pkey";--> statement-breakpoint
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_groupId_userId_pk" PRIMARY KEY("groupId","userId");--> statement-breakpoint
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_projectId_userId_pk" PRIMARY KEY("projectId","userId");--> statement-breakpoint
ALTER TABLE "EndpointGroup" ADD CONSTRAINT "EndpointGroup_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EndpointGroup" ADD CONSTRAINT "EndpointGroup_parentId_EndpointGroup_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."EndpointGroup"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_groupId_EndpointGroup_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."EndpointGroup"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_groupId_Group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_groupId_Group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_key_unique" UNIQUE("key");--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_username_unique" UNIQUE("username");