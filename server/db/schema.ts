import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, foreignKey, jsonb, primaryKey, pgEnum, uuid } from 'drizzle-orm/pg-core';
import type { EndpointResponse, Parameter } from '~~/shared/types/project';

export const projectRole = pgEnum('ProjectRole', ['GUEST', 'DEVELOPER', 'ADMIN']);
export const userRole = pgEnum('UserRole', ['MEMBER', 'ADMIN']);
export const httpMethod = pgEnum('HttpMethod', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

export const groups = pgTable('Group', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' })
    .$onUpdate(() => new Date().toUTCString())
    .notNull(),
});

export const groupRelations = relations(groups, ({ many }) => ({
  project: many(projects),
  groupUser: many(groupUsers),
}));

export const projects = pgTable('Project', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' })
    .$onUpdate(() => new Date().toUTCString())
    .notNull(),
  groupId: uuid()
    .notNull()
    .references(() => groups.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  icon: text(),
});

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
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: 'string' })
      .$onUpdate(() => new Date().toUTCString())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    })
      .onUpdate('cascade')
      .onDelete('set null'),
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

export const users = pgTable('User', {
  id: uuid().defaultRandom().primaryKey(),
  email: text().notNull().unique(),
  username: text().notNull().unique(),
  password: text().notNull(),
  name: text(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' })
    .$onUpdate(() => new Date().toUTCString())
    .notNull(),
  role: userRole().default('MEMBER').notNull(),
  lastLoginAt: timestamp({ mode: 'string' }),
});

export const userRelations = relations(users, ({ many }) => ({
  groupUser: many(groupUsers),
  projectUser: many(projectUsers),
}));

export const endpoints = pgTable('Endpoint', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  method: httpMethod().notNull(),
  path: text().notNull(),
  description: text().notNull(),
  tags: text().array().default([]),
  body: jsonb().$type<Parameter>(),
  response: jsonb().$type<EndpointResponse[]>(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' })
    .$onUpdate(() => new Date().toUTCString())
    .notNull(),
  groupId: uuid()
    .notNull()
    .references(() => endpointGroups.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  headers: jsonb().array().$type<Parameter[]>().default([]),
  queryParams: jsonb().array().$type<Parameter[]>().default([]),
});

export const endpointRelations = relations(endpoints, ({ one }) => ({
  group: one(endpointGroups, {
    fields: [endpoints.groupId],
    references: [endpointGroups.id],
  }),
}));

export const settings = pgTable('Setting', {
  id: uuid().defaultRandom().primaryKey(),
  key: text().notNull().unique(),
  value: jsonb().notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' })
    .$onUpdate(() => new Date().toUTCString())
    .notNull(),
});

export const groupUsers = pgTable(
  'GroupUser',
  {
    groupId: uuid()
      .notNull()
      .references(() => groups.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    role: projectRole().default('GUEST').notNull(),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })]
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
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    role: projectRole().default('GUEST').notNull(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.userId] })]
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
