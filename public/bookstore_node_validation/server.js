const { createApp } = require('./src/app');

const PORT = Number.parseInt(process.env.PORT || '5500', 10);
const CART_COOKIE_SECRET = process.env.CART_COOKIE_SECRET || 'demo-bookstore-secret';

const app = createApp({ cartCookieSecret: CART_COOKIE_SECRET });

app.listen(PORT, () => {
  console.log(`Bookstore app running at http://localhost:${PORT}`);
});
