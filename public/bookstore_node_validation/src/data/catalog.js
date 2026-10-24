const BOOKS = [
  {
    id: 'clean-code',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    price: 29.99,
    description: 'A handbook of agile software craftsmanship.',
  },
  {
    id: 'pragmatic-programmer',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    price: 34.5,
    description: 'Practical guidance for becoming a better programmer.',
  },
  {
    id: 'designing-data-intensive-apps',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    price: 42,
    description: 'A deep dive into data systems and architecture.',
  },
  {
    id: 'eloquent-javascript',
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    price: 24,
    description: 'A modern introduction to JavaScript programming.',
  },
];

const BOOK_MAP = new Map(BOOKS.map((book) => [book.id, book]));

function getBookById(id) {
  return BOOK_MAP.get(id) || null;
}

module.exports = {
  BOOKS,
  getBookById,
};
