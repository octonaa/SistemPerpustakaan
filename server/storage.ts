import {
  users,
  members,
  books,
  loans,
  reports,
  type User,
  type UpsertUser,
  type Member,
  type InsertMember,
  type Book,
  type InsertBook,
  type Loan,
  type InsertLoan,
  type LoanWithRelations,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Member operations
  getMembers(): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member>;
  deleteMember(id: number): Promise<void>;
  searchMembers(query: string): Promise<Member[]>;

  // Book operations
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  searchBooks(query: string): Promise<Book[]>;

  // Loan operations
  getLoans(): Promise<LoanWithRelations[]>;
  getLoan(id: number): Promise<LoanWithRelations | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan>;
  deleteLoan(id: number): Promise<void>;
  getActiveLoans(): Promise<LoanWithRelations[]>;
  getOverdueLoans(): Promise<LoanWithRelations[]>;
  calculateFine(dueDate: Date, returnDate?: Date): number;
  returnBook(loanId: number): Promise<Loan>;

  // Report operations
  getReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<void>;

  // Dashboard statistics
  getDashboardStats(): Promise<{
    activeLoans: number;
    completedLoans: number;
    totalBooks: number;
    totalMembers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Member operations
  async getMembers(): Promise<Member[]> {
    return await db.select().from(members).orderBy(desc(members.createdAt));
  }

  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async createMember(memberData: InsertMember): Promise<Member> {
    // Generate member number
    const memberCount = await db.select({ count: count() }).from(members);
    const memberNumber = (memberCount[0].count + 1).toString();

    const [member] = await db
      .insert(members)
      .values({
        ...memberData,
        memberNumber,
      })
      .returning();
    return member;
  }

  async updateMember(id: number, memberData: Partial<InsertMember>): Promise<Member> {
    const [member] = await db
      .update(members)
      .set({
        ...memberData,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();
    return member;
  }

  async deleteMember(id: number): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  async searchMembers(query: string): Promise<Member[]> {
    return await db
      .select()
      .from(members)
      .where(
        sql`${members.fullName} ILIKE ${`%${query}%`} OR 
            ${members.memberNumber} ILIKE ${`%${query}%`} OR 
            ${members.identityNumber} ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(members.createdAt));
  }

  // Book operations
  async getBooks(): Promise<Book[]> {
    return await db.select().from(books).orderBy(desc(books.createdAt));
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(bookData: InsertBook): Promise<Book> {
    // Generate book number
    const bookCount = await db.select({ count: count() }).from(books);
    const bookNumber = (bookCount[0].count + 1).toString();

    const [book] = await db
      .insert(books)
      .values({
        ...bookData,
        bookNumber,
        availableQuantity: bookData.quantity || 1,
      })
      .returning();
    return book;
  }

  async updateBook(id: number, bookData: Partial<InsertBook>): Promise<Book> {
    const [book] = await db
      .update(books)
      .set({
        ...bookData,
        updatedAt: new Date(),
      })
      .where(eq(books.id, id))
      .returning();
    return book;
  }

  async deleteBook(id: number): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async searchBooks(query: string): Promise<Book[]> {
    return await db
      .select()
      .from(books)
      .where(
        sql`${books.title} ILIKE ${`%${query}%`} OR 
            ${books.author} ILIKE ${`%${query}%`} OR 
            ${books.publisher} ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(books.createdAt));
  }

  // Loan operations
  async getLoans(): Promise<LoanWithRelations[]> {
    return await db
      .select()
      .from(loans)
      .leftJoin(members, eq(loans.memberId, members.id))
      .leftJoin(books, eq(loans.bookId, books.id))
      .orderBy(desc(loans.createdAt))
      .then(results =>
        results.map(row => ({
          ...row.loans,
          member: row.members!,
          book: row.books!,
        }))
      );
  }

  async getLoan(id: number): Promise<LoanWithRelations | undefined> {
    const results = await db
      .select()
      .from(loans)
      .leftJoin(members, eq(loans.memberId, members.id))
      .leftJoin(books, eq(loans.bookId, books.id))
      .where(eq(loans.id, id));
    
    if (results.length === 0) return undefined;
    
    const row = results[0];
    return {
      ...row.loans,
      member: row.members!,
      book: row.books!,
    };
  }

  async createLoan(loanData: InsertLoan): Promise<Loan> {
    // Generate loan number
    const loanCount = await db.select({ count: count() }).from(loans);
    const loanNumber = (loanCount[0].count + 1).toString();

    // Calculate due date (7 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const [loan] = await db
      .insert(loans)
      .values({
        ...loanData,
        loanNumber,
        dueDate,
      })
      .returning();

    // Update book available quantity
    await db
      .update(books)
      .set({
        availableQuantity: sql`${books.availableQuantity} - 1`,
      })
      .where(eq(books.id, loanData.bookId));

    return loan;
  }

  async updateLoan(id: number, loanData: Partial<InsertLoan>): Promise<Loan> {
    const [loan] = await db
      .update(loans)
      .set({
        ...loanData,
        updatedAt: new Date(),
      })
      .where(eq(loans.id, id))
      .returning();
    return loan;
  }

  async deleteLoan(id: number): Promise<void> {
    const loan = await this.getLoan(id);
    if (loan && loan.status === "active") {
      // Return book to inventory
      await db
        .update(books)
        .set({
          availableQuantity: sql`${books.availableQuantity} + 1`,
        })
        .where(eq(books.id, loan.bookId));
    }
    await db.delete(loans).where(eq(loans.id, id));
  }

  async getActiveLoans(): Promise<LoanWithRelations[]> {
    return await db
      .select()
      .from(loans)
      .leftJoin(members, eq(loans.memberId, members.id))
      .leftJoin(books, eq(loans.bookId, books.id))
      .where(eq(loans.status, "active"))
      .orderBy(desc(loans.createdAt))
      .then(results =>
        results.map(row => ({
          ...row.loans,
          member: row.members!,
          book: row.books!,
        }))
      );
  }

  async getOverdueLoans(): Promise<LoanWithRelations[]> {
    const now = new Date();
    return await db
      .select()
      .from(loans)
      .leftJoin(members, eq(loans.memberId, members.id))
      .leftJoin(books, eq(loans.bookId, books.id))
      .where(and(eq(loans.status, "active"), lte(loans.dueDate, now)))
      .orderBy(desc(loans.createdAt))
      .then(results =>
        results.map(row => ({
          ...row.loans,
          member: row.members!,
          book: row.books!,
        }))
      );
  }

  calculateFine(dueDate: Date, returnDate?: Date): number {
    const today = returnDate || new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return diffDays * 1000; // Rp 1,000 per day
    }
    return 0;
  }

  async returnBook(loanId: number): Promise<Loan> {
    const loan = await this.getLoan(loanId);
    if (!loan) {
      throw new Error("Loan not found");
    }

    const returnDate = new Date();
    const fine = this.calculateFine(loan.dueDate, returnDate);

    const [updatedLoan] = await db
      .update(loans)
      .set({
        returnDate,
        fine: fine.toString(),
        status: "returned",
        updatedAt: new Date(),
      })
      .where(eq(loans.id, loanId))
      .returning();

    // Return book to inventory
    await db
      .update(books)
      .set({
        availableQuantity: sql`${books.availableQuantity} + 1`,
      })
      .where(eq(books.id, loan.bookId));

    return updatedLoan;
  }

  // Report operations
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    activeLoans: number;
    completedLoans: number;
    totalBooks: number;
    totalMembers: number;
  }> {
    const [activeLoanCount] = await db
      .select({ count: count() })
      .from(loans)
      .where(eq(loans.status, "active"));

    const [completedLoanCount] = await db
      .select({ count: count() })
      .from(loans)
      .where(eq(loans.status, "returned"));

    const [bookCount] = await db.select({ count: count() }).from(books);
    const [memberCount] = await db.select({ count: count() }).from(members);

    return {
      activeLoans: activeLoanCount.count,
      completedLoans: completedLoanCount.count,
      totalBooks: bookCount.count,
      totalMembers: memberCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
