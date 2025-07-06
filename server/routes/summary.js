const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get financial summary
router.get('/', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let dateFilter = '';
  const params = [];
  
  if (start_date && end_date) {
    dateFilter = 'WHERE date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  } else if (start_date) {
    dateFilter = 'WHERE date >= ?';
    params.push(start_date);
  } else if (end_date) {
    dateFilter = 'WHERE date <= ?';
    params.push(end_date);
  }
  
  // Get total income and expenses
  const summaryQuery = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
    FROM transactions
    ${dateFilter}
  `;
  
  db.get(summaryQuery, params, (err, summary) => {
    if (err) {
      console.error('Error fetching summary:', err);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }
    
    // Calculate net income
    const netIncome = (summary.total_income || 0) - (summary.total_expenses || 0);
    
    // Get top spending categories
    const topCategoriesQuery = `
      SELECT 
        c.name,
        c.color,
        c.icon,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ${dateFilter}
      AND t.type = 'expense'
      GROUP BY c.id, c.name, c.color, c.icon
      ORDER BY total_amount DESC
      LIMIT 5
    `;
    
    db.all(topCategoriesQuery, params, (err, topCategories) => {
      if (err) {
        console.error('Error fetching top categories:', err);
        return res.status(500).json({ error: 'Failed to fetch top categories' });
      }
      
      // Get recent transactions
      const recentTransactionsQuery = `
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        ${dateFilter}
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT 10
      `;
      
      db.all(recentTransactionsQuery, params, (err, recentTransactions) => {
        if (err) {
          console.error('Error fetching recent transactions:', err);
          return res.status(500).json({ error: 'Failed to fetch recent transactions' });
        }
        
        res.json({
          summary: {
            total_income: summary.total_income || 0,
            total_expenses: summary.total_expenses || 0,
            net_income: netIncome,
            income_count: summary.income_count || 0,
            expense_count: summary.expense_count || 0
          },
          top_categories: topCategories || [],
          recent_transactions: recentTransactions || []
        });
      });
    });
  });
});

// Get monthly summary
router.get('/monthly', (req, res) => {
  const { year, month } = req.query;
  
  if (!year || !month) {
    return res.status(400).json({ error: 'Year and month are required' });
  }
  
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;
  
  const query = `
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
      DATE(date) as day,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as daily_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as daily_expenses
    FROM transactions
    WHERE date BETWEEN ? AND ?
    GROUP BY DATE(date)
    ORDER BY day ASC
  `;
  
  db.all(query, [startDate, endDate], (err, rows) => {
    if (err) {
      console.error('Error fetching monthly summary:', err);
      return res.status(500).json({ error: 'Failed to fetch monthly summary' });
    }
    
    const totalIncome = rows.reduce((sum, row) => sum + (row.total_income || 0), 0);
    const totalExpenses = rows.reduce((sum, row) => sum + (row.total_expenses || 0), 0);
    
    res.json({
      year: parseInt(year),
      month: parseInt(month),
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_income: totalIncome - totalExpenses,
      daily_data: rows
    });
  });
});

// Get yearly summary
router.get('/yearly', (req, res) => {
  const { year } = req.query;
  
  if (!year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  
  const query = `
    SELECT 
      strftime('%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
    FROM transactions
    WHERE strftime('%Y', date) = ?
    GROUP BY strftime('%m', date)
    ORDER BY month ASC
  `;
  
  db.all(query, [year], (err, rows) => {
    if (err) {
      console.error('Error fetching yearly summary:', err);
      return res.status(500).json({ error: 'Failed to fetch yearly summary' });
    }
    
    const totalIncome = rows.reduce((sum, row) => sum + (row.total_income || 0), 0);
    const totalExpenses = rows.reduce((sum, row) => sum + (row.total_expenses || 0), 0);
    
    res.json({
      year: parseInt(year),
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_income: totalIncome - totalExpenses,
      monthly_data: rows
    });
  });
});

module.exports = router; 