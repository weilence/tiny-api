import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  foreignKey,
  uniqueIndex,
  jsonb,
  primaryKey,
  pgEnum,
  uuid,
} from 'drizzle-orm/pg-core';

export const projectRole = pgEnum('ProjectRole', ['GUEST', 'DEVELOPER', 'ADMIN']);
export const userRole = pgEnum('UserRole', ['MEMBER', 'ADMIN']);
export const httpMethod = pgEnum('HttpMethod', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

export const groups = pgTable('Group', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const groupRelations = relations(groups, ({ many }) => ({
  project: many(projects),
  groupUser: many(groupUsers),
}));

export const projects = pgTable(
  'Project',
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    description: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .$onUpdate(() => new Date())
      .notNull(),
    groupId: uuid().notNull(),
    icon: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [groups.id],
      name: 'Project_groupId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ]
);

export const projectRelations = relations(projects, ({ one, many }) => ({
  group: one(groups, {
    fields: [projects.groupId],
    references: [groups.id],
  }),
  endpointGroup: many(endpointGroups),
  projectUser: many(projectUsers),
}));

export const endpointGroups = pgTable(
  'EndpointGroup',
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    description: text(),
    parentId: uuid(),
    projectId: uuid().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'EndpointGroup_parentId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: 'EndpointGroup_projectId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ]
);

export const endpointGroupRelations = relations(endpointGroups, ({ one, many }) => ({
  parent: one(endpointGroups, {
    fields: [endpointGroups.parentId],
    references: [endpointGroups.id],
  }),
  children: many(endpointGroups),
  project: one(projects, {
    fields: [endpointGroups.projectId],
    references: [projects.id],
  }),
  endpoint: many(endpoints),
}));

export const users = pgTable(
  'User',
  {
    id: uuid().defaultRandom().primaryKey(),
    email: text().notNull(),
    username: text().notNull(),
    password: text().notNull(),
    name: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .$onUpdate(() => new Date())
      .notNull(),
    role: userRole().default('MEMBER').notNull(),
    lastLoginAt: timestamp(),
  },
  (table) => [
    uniqueIndex('User_email_key').using('btree', table.email.asc().nullsLast().op('text_ops')),
    uniqueIndex('User_username_key').using('btree', table.username.asc().nullsLast().op('text_ops')),
  ]
);

export const userRelations = relations(users, ({ many }) => ({
  groupUser: many(groupUsers),
  projectUser: many(projectUsers),
}));

export const endpoints = pgTable(
  'Endpoint',
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    method: httpMethod().notNull(),
    path: text().notNull(),
    description: text().notNull(),
    tags: text().array().default([]),
    body: jsonb().$type<Parameter>(),
    response: jsonb().$type<EndpointResponse>(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .$onUpdate(() => new Date())
      .notNull(),
    groupId: uuid().notNull(),
    headers: jsonb().array().$type<Parameter[]>().default([]),
    queryParams: jsonb().array().$type<Parameter[]>().default([]),
  },
  (table) => [
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [endpointGroups.id],
      name: 'Endpoint_groupId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ]
);

export const endpointRelations = relations(endpoints, ({ one }) => ({
  group: one(endpointGroups, {
    fields: [endpoints.groupId],
    references: [endpointGroups.id],
  }),
}));

export const settings = pgTable(
  'Setting',
  {
    id: uuid().defaultRandom().primaryKey(),
    key: text().notNull(),
    value: jsonb().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex('Setting_key_key').using('btree', table.key.asc().nullsLast().op('text_ops'))]
);

export const groupUsers = pgTable(
  'GroupUser',
  {
    groupId: uuid().notNull(),
    userId: uuid().notNull(),
    role: projectRole().default('GUEST').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [groups.id],
      name: 'GroupUser_groupId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'GroupUser_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    primaryKey({ columns: [table.groupId, table.userId], name: 'GroupUser_pkey' }),
  ]
);

export const groupUserRelations = relations(groupUsers, ({ one }) => ({
  group: one(groups, {
    fields: [groupUsers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupUsers.userId],
    references: [users.id],
  }),
}));

export const projectUsers = pgTable(
  'ProjectUser',
  {
    projectId: uuid().notNull(),
    userId: uuid().notNull(),
    role: projectRole().default('GUEST').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: 'ProjectUser_projectId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'ProjectUser_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    primaryKey({ columns: [table.projectId, table.userId], name: 'ProjectUser_pkey' }),
  ]
);

export const projectUserRelations = relations(projectUsers, ({ one }) => ({
  project: one(projects, {
    fields: [projectUsers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectUsers.userId],
    references: [users.id],
  }),
}));
