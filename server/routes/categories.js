const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get all categories
router.get('/', (req, res) => {
  const { type } = req.query;
  
  let query = 'SELECT * FROM categories';
  const params = [];
  
  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY name ASC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    res.json(rows);
  });
});

// Get category by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM categories WHERE id = ?';
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching category:', err);
      return res.status(500).json({ error: 'Failed to fetch category' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(row);
  });
});

// Create new category
router.post('/', (req, res) => {
  const { name, type, color, icon } = req.body;
  
  // Validation
  if (!name || !type) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, type' 
    });
  }
  
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "income" or "expense"' });
  }
  
  const query = `
    INSERT INTO categories (name, type, color, icon)
    VALUES (?, ?, ?, ?)
  `;
  
  db.run(query, [name, type, color || '#3B82F6', icon || '💰'], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Category with this name already exists' });
      }
      console.error('Error creating category:', err);
      return res.status(500).json({ error: 'Failed to create category' });
    }
    
    // Fetch the created category
    const selectQuery = 'SELECT * FROM categories WHERE id = ?';
    
    db.get(selectQuery, [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created category:', err);
        return res.status(500).json({ error: 'Category created but failed to fetch' });
      }
      
      res.status(201).json(row);
    });
  });
});

// Update category
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, color, icon } = req.body;
  
  // Validation
  if (!name || !type) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, type' 
    });
  }
  
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "income" or "expense"' });
  }
  
  const query = `
    UPDATE categories 
    SET name = ?, type = ?, color = ?, icon = ?
    WHERE id = ?
  `;
  
  db.run(query, [name, type, color || '#3B82F6', icon || '💰', id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Category with this name already exists' });
      }
      console.error('Error updating category:', err);
      return res.status(500).json({ error: 'Failed to update category' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Fetch the updated category
    const selectQuery = 'SELECT * FROM categories WHERE id = ?';
    
    db.get(selectQuery, [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated category:', err);
        return res.status(500).json({ error: 'Category updated but failed to fetch' });
      }
      
      res.json(row);
    });
  });
});

// Delete category
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Check if category is being used by any transactions
  const checkQuery = 'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?';
  
  db.get(checkQuery, [id], (err, row) => {
    if (err) {
      console.error('Error checking category usage:', err);
      return res.status(500).json({ error: 'Failed to check category usage' });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that is being used by transactions' 
      });
    }
    
    // Delete the category
    const deleteQuery = 'DELETE FROM categories WHERE id = ?';
    
    db.run(deleteQuery, [id], function(err) {
      if (err) {
        console.error('Error deleting category:', err);
        return res.status(500).json({ error: 'Failed to delete category' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    });
  });
});

module.exports = router; 