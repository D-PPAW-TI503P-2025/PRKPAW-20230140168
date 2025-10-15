const express = require('express');
const router = express.Router();

let books = [
  { id: 1, title: 'Amba Shotgun Malang', author: 'Ambatakum' },
  { id: 2, title: 'Roesdi Goyang 58', author: 'Ir. Roesdi Purwantoro' }
];

// 🟩 CREATE
router.post('/', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }
  const book = { id: books.length + 1, title, author };
  books.push(book);
  res.status(201).json(book);
});

// 🟦 READ ALL
router.get('/', (req, res) => {
  res.json(books);
});

// 🟨 READ BY ID
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// 🟧 UPDATE
router.put('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  book.title = title;
  book.author = author;
  res.json(book);
});

// 🟥 DELETE
router.delete('/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Book not found' });

  const deleted = books.splice(index, 1);
  res.json({ message: 'Book deleted', deleted });
});

module.exports = router;