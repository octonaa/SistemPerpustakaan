import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMemberSchema, insertBookSchema, insertLoanSchema, insertReportSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Members routes
  app.get("/api/members", isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      let members;
      
      if (search && typeof search === "string") {
        members = await storage.searchMembers(search);
      } else {
        members = await storage.getMembers();
      }
      
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      res.json(member);
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  app.post("/api/members", isAuthenticated, async (req, res) => {
    try {
      const memberData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: error.errors });
      }
      console.error("Error creating member:", error);
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  app.put("/api/members/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const memberData = insertMemberSchema.partial().parse(req.body);
      const member = await storage.updateMember(id, memberData);
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: error.errors });
      }
      console.error("Error updating member:", error);
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  app.delete("/api/members/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMember(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting member:", error);
      res.status(500).json({ message: "Failed to delete member" });
    }
  });

  // Books routes
  app.get("/api/books", isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      let books;
      
      if (search && typeof search === "string") {
        books = await storage.searchBooks(search);
      } else {
        books = await storage.getBooks();
      }
      
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      console.error("Error creating book:", error);
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      res.json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBook(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Loans routes
  app.get("/api/loans", async (req, res) => {
    try {
      const loans = await storage.getLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching loans:", error);
      res.status(500).json({ message: "Failed to fetch loans" });
    }
  });

  app.get("/api/loans/active", async (req, res) => {
    try {
      const loans = await storage.getActiveLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching active loans:", error);
      res.status(500).json({ message: "Failed to fetch active loans" });
    }
  });

  app.get("/api/loans/overdue", async (req, res) => {
    try {
      const loans = await storage.getOverdueLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching overdue loans:", error);
      res.status(500).json({ message: "Failed to fetch overdue loans" });
    }
  });

  app.get("/api/loans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const loan = await storage.getLoan(id);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      console.error("Error fetching loan:", error);
      res.status(500).json({ message: "Failed to fetch loan" });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const loanData = insertLoanSchema.parse(req.body);
      
      // Check if book is available
      const book = await storage.getBook(loanData.bookId);
      if (!book || book.availableQuantity <= 0) {
        return res.status(400).json({ message: "Book is not available for loan" });
      }
      
      const loan = await storage.createLoan(loanData);
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid loan data", errors: error.errors });
      }
      console.error("Error creating loan:", error);
      res.status(500).json({ message: "Failed to create loan" });
    }
  });

  app.put("/api/loans/:id/return", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const loan = await storage.returnBook(id);
      res.json(loan);
    } catch (error) {
      console.error("Error returning book:", error);
      res.status(500).json({ message: "Failed to return book" });
    }
  });

  app.delete("/api/loans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLoan(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting loan:", error);
      res.status(500).json({ message: "Failed to delete loan" });
    }
  });

  // Reports routes
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReport(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
