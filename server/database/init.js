const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'finance.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          color TEXT DEFAULT '#3B82F6',
          icon TEXT DEFAULT '💰',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create transactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          category_id INTEGER,
          date DATE NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `);

      // Create budgets table
      db.run(`
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER,
          amount DECIMAL(10,2) NOT NULL,
          period TEXT NOT NULL CHECK(period IN ('monthly', 'yearly')),
          start_date DATE NOT NULL,
          end_date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `);

      // Insert default categories
      const defaultCategories = [
        { name: 'Salary', type: 'income', color: '#10B981', icon: '💼' },
        { name: 'Freelance', type: 'income', color: '#F59E0B', icon: '💻' },
        { name: 'Investment', type: 'income', color: '#8B5CF6', icon: '📈' },
        { name: 'Food & Dining', type: 'expense', color: '#EF4444', icon: '🍽️' },
        { name: 'Transportation', type: 'expense', color: '#06B6D4', icon: '🚗' },
        { name: 'Shopping', type: 'expense', color: '#EC4899', icon: '🛍️' },
        { name: 'Entertainment', type: 'expense', color: '#F97316', icon: '🎬' },
        { name: 'Healthcare', type: 'expense', color: '#84CC16', icon: '🏥' },
        { name: 'Utilities', type: 'expense', color: '#6366F1', icon: '⚡' },
        { name: 'Rent/Mortgage', type: 'expense', color: '#A855F7', icon: '🏠' }
      ];

      const insertCategory = db.prepare(`
        INSERT OR IGNORE INTO categories (name, type, color, icon) 
        VALUES (?, ?, ?, ?)
      `);

      defaultCategories.forEach(category => {
        insertCategory.run(category.name, category.type, category.color, category.icon);
      });

      insertCategory.finalize();

      // Insert sample transactions for demonstration
      const sampleTransactions = [
        { description: 'Monthly Salary', amount: 5000.00, type: 'income', category_id: 1, date: '2024-01-15', notes: 'January salary' },
        { description: 'Grocery Shopping', amount: 150.00, type: 'expense', category_id: 4, date: '2024-01-16', notes: 'Weekly groceries' },
        { description: 'Gas Station', amount: 45.00, type: 'expense', category_id: 5, date: '2024-01-17', notes: 'Fuel for car' },
        { description: 'Freelance Project', amount: 800.00, type: 'income', category_id: 2, date: '2024-01-18', notes: 'Web development project' },
        { description: 'Movie Tickets', amount: 25.00, type: 'expense', category_id: 7, date: '2024-01-19', notes: 'Weekend movie' }
      ];

      const insertTransaction = db.prepare(`
        INSERT OR IGNORE INTO transactions (description, amount, type, category_id, date, notes) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleTransactions.forEach(transaction => {
        insertTransaction.run(
          transaction.description,
          transaction.amount,
          transaction.type,
          transaction.category_id,
          transaction.date,
          transaction.notes
        );
      });

      insertTransaction.finalize();

      console.log('✅ Database initialized successfully');
      resolve();
    });
  });
};

// Close database connection
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
};

module.exports = { db, initDatabase, closeDatabase }; 