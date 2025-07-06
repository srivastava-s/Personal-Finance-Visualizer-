const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get all transactions with optional filtering
router.get('/', (req, res) => {
  const { type, category_id, start_date, end_date, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.color as category_color,
      c.icon as category_icon
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (type) {
    query += ' AND t.type = ?';
    params.push(type);
  }
  
  if (category_id) {
    query += ' AND t.category_id = ?';
    params.push(category_id);
  }
  
  if (start_date) {
    query += ' AND t.date >= ?';
    params.push(start_date);
  }
  
  if (end_date) {
    query += ' AND t.date <= ?';
    params.push(end_date);
  }
  
  query += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
    res.json(rows);
  });
});

// Get transaction by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.color as category_color,
      c.icon as category_icon
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching transaction:', err);
      return res.status(500).json({ error: 'Failed to fetch transaction' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(row);
  });
});

// Create new transaction
router.post('/', (req, res) => {
  const { description, amount, type, category_id, date, notes } = req.body;
  
  // Validation
  if (!description || !amount || !type || !date) {
    return res.status(400).json({ 
      error: 'Missing required fields: description, amount, type, date' 
    });
  }
  
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "income" or "expense"' });
  }
  
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  const query = `
    INSERT INTO transactions (description, amount, type, category_id, date, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [description, amount, type, category_id || null, date, notes || null], function(err) {
    if (err) {
      console.error('Error creating transaction:', err);
      return res.status(500).json({ error: 'Failed to create transaction' });
    }
    
    // Fetch the created transaction
    const selectQuery = `
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `;
    
    db.get(selectQuery, [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created transaction:', err);
        return res.status(500).json({ error: 'Transaction created but failed to fetch' });
      }
      
      res.status(201).json(row);
    });
  });
});

// Update transaction
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { description, amount, type, category_id, date, notes } = req.body;
  
  // Validation
  if (!description || !amount || !type || !date) {
    return res.status(400).json({ 
      error: 'Missing required fields: description, amount, type, date' 
    });
  }
  
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "income" or "expense"' });
  }
  
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  
  const query = `
    UPDATE transactions 
    SET description = ?, amount = ?, type = ?, category_id = ?, date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(query, [description, amount, type, category_id || null, date, notes || null, id], function(err) {
    if (err) {
      console.error('Error updating transaction:', err);
      return res.status(500).json({ error: 'Failed to update transaction' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Fetch the updated transaction
    const selectQuery = `
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `;
    
    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated transaction:', err);
        return res.status(500).json({ error: 'Transaction updated but failed to fetch' });
      }
      
      res.json(row);
    });
  });
});

// Delete transaction
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM transactions WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting transaction:', err);
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  });
});

module.exports = router; 