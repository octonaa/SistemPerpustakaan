import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  date,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Admin users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Library members table
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  memberNumber: varchar("member_number").notNull().unique(),
  identityNumber: varchar("identity_number").notNull(),
  identityType: varchar("identity_type").notNull(), // NIM, KTP, SIM
  fullName: varchar("full_name").notNull(),
  birthDate: date("birth_date"),
  class: varchar("class"), // S1 2, etc.
  address: text("address"),
  phone: varchar("phone"),
  registrationDate: timestamp("registration_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  bookNumber: varchar("book_number").notNull().unique(),
  category: varchar("category").notNull(), // Umum, etc.
  title: text("title").notNull(),
  type: varchar("type").notNull(), // Biografi, etc.
  author: varchar("author").notNull(),
  publisher: varchar("publisher").notNull(),
  publishYear: integer("publish_year").notNull(),
  entryDate: timestamp("entry_date").defaultNow(),
  quantity: integer("quantity").notNull().default(1),
  availableQuantity: integer("available_quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loans table
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  loanNumber: varchar("loan_number").notNull().unique(),
  memberId: integer("member_id").notNull().references(() => members.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  loanDate: timestamp("loan_date").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  returnDate: timestamp("return_date"),
  fine: decimal("fine", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status").notNull().default("active"), // active, returned, overdue
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reportType: varchar("report_type").notNull(), // monthly_loans, monthly_fines, books, new_members
  title: varchar("title").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, completed, failed
  filePath: varchar("file_path"),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const membersRelations = relations(members, ({ many }) => ({
  loans: many(loans),
}));

export const booksRelations = relations(books, ({ many }) => ({
  loans: many(loans),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  member: one(members, {
    fields: [loans.memberId],
    references: [members.id],
  }),
  book: one(books, {
    fields: [loans.bookId],
    references: [books.id],
  }),
}));

// Insert schemas
export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  memberNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  bookNumber: true,
  availableQuantity: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  loanNumber: true,
  fine: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  status: true,
  filePath: true,
  generatedAt: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Loan with relations
export type LoanWithRelations = Loan & {
  member: Member;
  book: Book;
};
