// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
    index,
    integer, pgTable,
    pgTableCreator, serial,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `pdr_ai_v2_${name}`);


export const users = createTable("users", {
    id: serial("id").primaryKey(),
    userId: varchar("userId", {  length: 256 }).notNull(),
    companyId: varchar("companyId", {  length: 256 }).notNull(),
    role: varchar("role", {  length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),

});

export const company = createTable('company', {
    id: serial("id").primaryKey(),
    name: varchar("name", {  length: 256 }).notNull(),
    employerpasskey: varchar("employerPasskey", {  length: 256 }).notNull(),
    employeepasskey: varchar("employeePasskey", {  length: 256 }).notNull(),
    numberOfEmployees: varchar("numberOfEmployees",{  length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
});

export const document = createTable('document', {
    id: serial("id").primaryKey(),
    url: varchar("url", {  length: 256 }).notNull(),
    category: varchar("category", {  length: 256 }).notNull(),
    title: varchar("title", {  length: 256 }).notNull(),
    companyId: varchar("company id", {  length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
});

