# ChapterCart Bookstore (Node.js Server-Side Validation Demo)

A mini e-commerce bookstore built with Node.js + Express to demonstrate:
- modular Node.js architecture,
- server-side validation,
- GET/POST request handling,
- cart + checkout flows,
- robust success/error messaging.

> **Demo-only payment flow:** do not enter real card data.

## Project location

```text
public/bookstore_node_validation/
```

## Features

- `GET /` catalog view with cart summary
- `POST /cart/add` add item(s)
- `POST /cart/update` update quantities
- `POST /cart/remove` remove items
- `GET /checkout` checkout form
- `POST /checkout` full server-side validation + order processing
- 404 and method-not-allowed responses
- Signed cookie session id + in-memory cart store (demo-safe, stateless client)

## Validation rules

Checkout requires:
- full name,
- valid email,
- shipping address,
- city/state/postal code,
- payment fields (cardholder, card number + Luhn check, expiry, CVV),
- non-empty cart with valid known items and quantities (1-99).

On validation failure:
- field-level errors are shown,
- safe values are preserved,
- full payment/card data is not stored or echoed.

## Setup

```bash
cd /home/runner/work/100_days_100_web_project/100_days_100_web_project/public/bookstore_node_validation
npm install
```

Optional env setup:

```bash
cp .env.example .env
```

## Scripts

```bash
npm start   # start server
npm run dev # start with Node watch mode
npm test    # run automated tests
```

## Run

```bash
npm start
```

Open:

```text
http://localhost:5500
```

## Test coverage included

- homepage GET
- checkout GET
- valid checkout POST
- invalid/missing checkout fields
- invalid quantities / unknown books
- empty-cart checkout rejection
- 404 handling
- method-not-allowed handling

## Example curl requests

Add a book to cart:

```bash
curl -i -c cookies.txt -d "bookId=clean-code&quantity=1" -X POST http://localhost:5500/cart/add
```

Valid checkout (demo card):

```bash
curl -i -b cookies.txt -d "customerName=Jane Reader&email=jane@example.com&address=123 Main Street&city=Austin&state=Texas&postalCode=78701&cardName=Jane Reader&cardNumber=4242424242424242&cardExpiry=12/99&cardCvv=123" -X POST http://localhost:5500/checkout
```

Invalid checkout (missing/invalid fields):

```bash
curl -i -b cookies.txt -d "customerName=&email=bad&address=12&city=&state=1&postalCode=!&cardName=&cardNumber=1234&cardExpiry=11/20&cardCvv=9" -X POST http://localhost:5500/checkout
```

## Deployment notes

### Generic Node host
1. Install dependencies: `npm install --omit=dev`
2. Set environment variables (`PORT`, `CART_COOKIE_SECRET`)
3. Start with: `npm start`

### Render
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Add env vars in Render dashboard.

### Railway
- Deploy from repository subdirectory `public/bookstore_node_validation`
- Set start command `npm start`
- Set env vars in project settings.

### Vercel (Node server)
- Use a Node server deployment configuration that starts `server.js`
- Ensure working directory is `public/bookstore_node_validation`
- Set `CART_COOKIE_SECRET` in environment settings.

## Project structure

```text
bookstore_node_validation/
├── .env.example
├── package.json
├── server.js
├── public/
│   └── styles.css
├── src/
│   ├── app.js
│   ├── data/catalog.js
│   ├── routes/index.js
│   ├── services/cartStore.js
│   ├── utils/render.js
│   └── validation/checkout.js
└── tests/
    └── app.test.js
```
