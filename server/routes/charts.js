const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get spending by category chart data
router.get('/spending-by-category', (req, res) => {
  const { start_date, end_date, limit = 10 } = req.query;
  
  let dateFilter = '';
  const params = [];
  
  if (start_date && end_date) {
    dateFilter = 'WHERE t.date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  } else if (start_date) {
    dateFilter = 'WHERE t.date >= ?';
    params.push(start_date);
  } else if (end_date) {
    dateFilter = 'WHERE t.date <= ?';
    params.push(end_date);
  }
  
  const query = `
    SELECT 
      c.name as category_name,
      c.color as category_color,
      c.icon as category_icon,
      SUM(t.amount) as total_amount,
      COUNT(t.id) as transaction_count,
      ROUND((SUM(t.amount) * 100.0 / (SELECT SUM(amount) FROM transactions t2 ${dateFilter} AND t2.type = 'expense')), 2) as percentage
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    ${dateFilter ? dateFilter.replace('t.', 't2.') : 'WHERE 1=1'}
    AND t.type = 'expense'
    GROUP BY c.id, c.name, c.color, c.icon
    ORDER BY total_amount DESC
    LIMIT ?
  `;
  
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching spending by category:', err);
      return res.status(500).json({ error: 'Failed to fetch spending by category data' });
    }
    
    res.json({
      labels: rows.map(row => row.category_name || 'Uncategorized'),
      datasets: [{
        data: rows.map(row => row.total_amount),
        backgroundColor: rows.map(row => row.category_color || '#3B82F6'),
        borderColor: rows.map(row => row.category_color || '#3B82F6'),
        borderWidth: 1
      }],
      raw_data: rows
    });
  });
});

// Get income vs expenses over time
router.get('/income-vs-expenses', (req, res) => {
  const { start_date, end_date, group_by = 'month' } = req.query;
  
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
  
  let groupClause = '';
  let labelFormat = '';
  
  switch (group_by) {
    case 'day':
      groupClause = 'DATE(date)';
      labelFormat = 'YYYY-MM-DD';
      break;
    case 'week':
      groupClause = "strftime('%Y-%W', date)";
      labelFormat = 'YYYY-WW';
      break;
    case 'month':
    default:
      groupClause = "strftime('%Y-%m', date)";
      labelFormat = 'YYYY-MM';
      break;
    case 'year':
      groupClause = "strftime('%Y', date)";
      labelFormat = 'YYYY';
      break;
  }
  
  const query = `
    SELECT 
      ${groupClause} as period,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    ${dateFilter}
    GROUP BY ${groupClause}
    ORDER BY period ASC
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching income vs expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch income vs expenses data' });
    }
    
    res.json({
      labels: rows.map(row => row.period),
      datasets: [
        {
          label: 'Income',
          data: rows.map(row => row.income),
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Expenses',
          data: rows.map(row => row.expenses),
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          fill: false
        }
      ],
      raw_data: rows
    });
  });
});

// Get monthly spending trend
router.get('/monthly-trend', (req, res) => {
  const { year } = req.query;
  
  if (!year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  
  const query = `
    SELECT 
      strftime('%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
      (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) as net_income
    FROM transactions
    WHERE strftime('%Y', date) = ?
    GROUP BY strftime('%m', date)
    ORDER BY month ASC
  `;
  
  db.all(query, [year], (err, rows) => {
    if (err) {
      console.error('Error fetching monthly trend:', err);
      return res.status(500).json({ error: 'Failed to fetch monthly trend data' });
    }
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    res.json({
      labels: rows.map(row => monthNames[parseInt(row.month) - 1]),
      datasets: [
        {
          label: 'Income',
          data: rows.map(row => row.income),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        },
        {
          label: 'Expenses',
          data: rows.map(row => row.expenses),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        },
        {
          label: 'Net Income',
          data: rows.map(row => row.net_income),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          type: 'line',
          fill: false
        }
      ],
      raw_data: rows
    });
  });
});

// Get daily spending pattern
router.get('/daily-pattern', (req, res) => {
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
  
  const query = `
    SELECT 
      strftime('%w', date) as day_of_week,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
      COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
      COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
    FROM transactions
    ${dateFilter}
    GROUP BY strftime('%w', date)
    ORDER BY day_of_week ASC
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching daily pattern:', err);
      return res.status(500).json({ error: 'Failed to fetch daily pattern data' });
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    res.json({
      labels: rows.map(row => dayNames[parseInt(row.day_of_week)]),
      datasets: [
        {
          label: 'Income',
          data: rows.map(row => row.income),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        },
        {
          label: 'Expenses',
          data: rows.map(row => row.expenses),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ],
      raw_data: rows
    });
  });
});

module.exports = router; 