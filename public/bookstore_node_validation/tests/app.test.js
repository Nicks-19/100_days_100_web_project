const assert = require('node:assert/strict');
const { test } = require('node:test');
const request = require('supertest');

const { createApp } = require('../src/app');

function buildApp() {
  return createApp({ cartCookieSecret: 'test-secret' });
}

async function addItem(agent, bookId = 'clean-code', quantity = 1) {
  return agent.post('/cart/add').type('form').send({ bookId, quantity });
}

test('GET / renders homepage with catalog and cart summary', async () => {
  const app = buildApp();
  const response = await request(app).get('/');

  assert.equal(response.status, 200);
  assert.match(response.text, /ChapterCart Bookstore/);
  assert.match(response.text, /Book catalog/);
  assert.match(response.text, /Your cart is empty/i);
});

test('GET /checkout renders checkout form', async () => {
  const app = buildApp();
  const response = await request(app).get('/checkout');

  assert.equal(response.status, 200);
  assert.match(response.text, /Demo payment flow only/i);
  assert.match(response.text, /name="customerName"/);
});

test('POST /checkout succeeds with valid data and non-empty cart', async () => {
  const app = buildApp();
  const agent = request.agent(app);

  await addItem(agent);
  const response = await agent.post('/checkout').type('form').send({
    customerName: 'Jane Reader',
    email: 'jane@example.com',
    address: '123 Main Street',
    city: 'Austin',
    state: 'Texas',
    postalCode: '78701',
    cardName: 'Jane Reader',
    cardNumber: '4242424242424242',
    cardExpiry: '12/99',
    cardCvv: '123',
  });

  assert.equal(response.status, 200);
  assert.match(response.text, /Order placed successfully/i);
  assert.match(response.text, /Your cart is empty/i);
});

test('POST /checkout returns field errors for missing/invalid values', async () => {
  const app = buildApp();
  const agent = request.agent(app);

  await addItem(agent);
  const response = await agent.post('/checkout').type('form').send({
    customerName: '',
    email: 'invalid-email',
    address: '12',
    city: '',
    state: '1',
    postalCode: '!',
    cardName: '',
    cardNumber: '1234',
    cardExpiry: '11/20',
    cardCvv: '9',
  });

  assert.equal(response.status, 400);
  assert.match(response.text, /Please enter your full name/i);
  assert.match(response.text, /Please enter a valid email address/i);
  assert.match(response.text, /Please enter a valid card number/i);
});

test('POST /checkout rejects empty cart', async () => {
  const app = buildApp();
  const response = await request(app).post('/checkout').type('form').send({
    customerName: 'A Reader',
    email: 'reader@example.com',
    address: '15 Market Road',
    city: 'Denver',
    state: 'Colorado',
    postalCode: '80202',
    cardName: 'A Reader',
    cardNumber: '4242424242424242',
    cardExpiry: '12/99',
    cardCvv: '123',
  });

  assert.equal(response.status, 400);
  assert.match(response.text, /cart is empty/i);
});

test('cart routes reject unknown books and invalid quantities', async () => {
  const app = buildApp();
  const agent = request.agent(app);

  const unknownBook = await addItem(agent, 'unknown-book', 1);
  assert.equal(unknownBook.status, 400);
  assert.match(unknownBook.text, /Unknown book selected/i);

  const validAdd = await addItem(agent, 'clean-code', 1);
  assert.equal(validAdd.status, 200);

  const invalidQty = await agent.post('/cart/update').type('form').send({
    bookId: 'clean-code',
    quantity: -1,
  });
  assert.equal(invalidQty.status, 400);
  assert.match(invalidQty.text, /Quantity must be between 1 and 99/i);
});

test('returns 404 for unknown route', async () => {
  const app = buildApp();
  const response = await request(app).get('/missing-route');

  assert.equal(response.status, 404);
  assert.equal(response.text, 'Page not found.');
});

test('returns 405 for unsupported methods on known routes', async () => {
  const app = buildApp();

  const postHome = await request(app).post('/');
  assert.equal(postHome.status, 405);
  assert.match(postHome.text, /Method POST not allowed/i);

  const getCartAdd = await request(app).get('/cart/add');
  assert.equal(getCartAdd.status, 405);
  assert.match(getCartAdd.text, /Method GET not allowed/i);
});
