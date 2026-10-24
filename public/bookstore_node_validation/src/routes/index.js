const express = require('express');

const { BOOKS, getBookById } = require('../data/catalog');
const { clearCart, getSessionCart } = require('../services/cartStore');
const { renderCheckout, renderHome } = require('../utils/render');
const { validateCheckoutInput } = require('../validation/checkout');

const router = express.Router();

function parseQuantity(input) {
  const quantity = Number.parseInt(String(input || ''), 10);
  if (!Number.isInteger(quantity)) return null;
  return quantity;
}

function getCartDetails(sessionId) {
  const cart = getSessionCart(sessionId);
  const items = [];
  let total = 0;

  for (const [id, quantity] of cart.entries()) {
    const book = getBookById(id);
    if (!book) {
      items.push({ id, quantity, lineTotal: 0, unknownBook: true });
      continue;
    }

    const lineTotal = book.price * quantity;
    items.push({ id, quantity, lineTotal, book, unknownBook: false });
    total += lineTotal;
  }

  return { items, total };
}

function methodNotAllowed(allowedMethods) {
  return (req, res) => {
    res.set('Allow', allowedMethods.join(', '));
    res.status(405).send(`Method ${req.method} not allowed for ${req.path}.`);
  };
}

router.get('/', (req, res) => {
  const cart = getCartDetails(req.sessionId);
  res.status(200).send(renderHome({ books: BOOKS, cart }));
});

router.post('/cart/add', (req, res) => {
  const bookId = String(req.body.bookId || '').trim();
  const quantity = parseQuantity(req.body.quantity);

  if (!getBookById(bookId)) {
    const cart = getCartDetails(req.sessionId);
    return res.status(400).send(renderHome({ books: BOOKS, cart, error: 'Unknown book selected.' }));
  }

  if (!quantity || quantity < 1 || quantity > 99) {
    const cart = getCartDetails(req.sessionId);
    return res.status(400).send(renderHome({ books: BOOKS, cart, error: 'Quantity must be between 1 and 99.' }));
  }

  const cart = getSessionCart(req.sessionId);
  const currentQuantity = cart.get(bookId) || 0;
  cart.set(bookId, currentQuantity + quantity);

  const details = getCartDetails(req.sessionId);
  return res.status(200).send(renderHome({ books: BOOKS, cart: details, success: 'Book added to your cart.' }));
});

router.post('/cart/update', (req, res) => {
  const bookId = String(req.body.bookId || '').trim();
  const quantity = parseQuantity(req.body.quantity);

  if (!getBookById(bookId)) {
    const cart = getCartDetails(req.sessionId);
    return res.status(400).send(renderHome({ books: BOOKS, cart, error: 'Unknown book selected.' }));
  }

  if (!quantity || quantity < 1 || quantity > 99) {
    const cart = getCartDetails(req.sessionId);
    return res.status(400).send(renderHome({ books: BOOKS, cart, error: 'Quantity must be between 1 and 99.' }));
  }

  const cart = getSessionCart(req.sessionId);
  cart.set(bookId, quantity);
  const details = getCartDetails(req.sessionId);

  return res.status(200).send(renderHome({ books: BOOKS, cart: details, success: 'Cart quantity updated.' }));
});

router.post('/cart/remove', (req, res) => {
  const bookId = String(req.body.bookId || '').trim();
  const cart = getSessionCart(req.sessionId);
  cart.delete(bookId);

  const details = getCartDetails(req.sessionId);
  return res.status(200).send(renderHome({ books: BOOKS, cart: details, success: 'Book removed from cart.' }));
});

router.get('/checkout', (req, res) => {
  const cart = getCartDetails(req.sessionId);
  res.status(200).send(renderCheckout({ cart }));
});

router.post('/checkout', (req, res) => {
  const cart = getCartDetails(req.sessionId);
  const validation = validateCheckoutInput(req.body, cart);

  if (!validation.isValid) {
    return res.status(400).send(renderCheckout({ cart, errors: validation.errors, values: validation.values }));
  }

  clearCart(req.sessionId);
  return res.status(200).send(
    renderCheckout({
      cart: getCartDetails(req.sessionId),
      success: 'Order placed successfully! A confirmation has been sent to your email (demo message).',
    }),
  );
});

router.all('/', methodNotAllowed(['GET']));
router.all('/checkout', methodNotAllowed(['GET', 'POST']));
router.all('/cart/add', methodNotAllowed(['POST']));
router.all('/cart/update', methodNotAllowed(['POST']));
router.all('/cart/remove', methodNotAllowed(['POST']));

module.exports = {
  router,
};
