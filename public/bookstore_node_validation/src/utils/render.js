function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function currency(value) {
  return `$${value.toFixed(2)}`;
}

function renderLayout({ title, content }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header class="site-header">
    <h1>ChapterCart Bookstore</h1>
    <p>Demo checkout only — do not use real payment details.</p>
    <nav><a href="/">Catalog</a> <a href="/checkout">Checkout</a></nav>
  </header>
  <main class="container">
    ${content}
  </main>
</body>
</html>`;
}

function renderMessages({ error, success }) {
  const sections = [];

  if (error) {
    sections.push(`<div class="alert alert-error" role="alert">${escapeHtml(error)}</div>`);
  }

  if (success) {
    sections.push(`<div class="alert alert-success" role="status">${escapeHtml(success)}</div>`);
  }

  return sections.join('');
}

function renderCartSummary(cart) {
  if (!cart.items.length) {
    return '<p>Your cart is empty.</p>';
  }

  const rows = cart.items.map((item) => {
    if (item.unknownBook) {
      return `<tr><td colspan="4">Unknown book (${escapeHtml(item.id)})</td></tr>`;
    }

    return `<tr>
      <td>${escapeHtml(item.book.title)}</td>
      <td>
        <form method="POST" action="/cart/update" class="inline-form">
          <input type="hidden" name="bookId" value="${escapeHtml(item.id)}" />
          <label class="sr-only" for="qty-${escapeHtml(item.id)}">Quantity for ${escapeHtml(item.book.title)}</label>
          <input id="qty-${escapeHtml(item.id)}" type="number" min="1" max="99" name="quantity" value="${item.quantity}" />
          <button type="submit">Update</button>
        </form>
      </td>
      <td>${currency(item.lineTotal)}</td>
      <td>
        <form method="POST" action="/cart/remove" class="inline-form">
          <input type="hidden" name="bookId" value="${escapeHtml(item.id)}" />
          <button type="submit" class="danger">Remove</button>
        </form>
      </td>
    </tr>`;
  }).join('');

  return `<table>
    <caption>Cart summary</caption>
    <thead><tr><th>Book</th><th>Quantity</th><th>Subtotal</th><th>Action</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><th colspan="2">Total</th><th colspan="2">${currency(cart.total)}</th></tr></tfoot>
  </table>`;
}

function renderHome({ books, cart, error, success }) {
  const catalog = books.map((book) => `<article class="book-card">
    <h2>${escapeHtml(book.title)}</h2>
    <p class="author">${escapeHtml(book.author)}</p>
    <p>${escapeHtml(book.description)}</p>
    <p class="price">${currency(book.price)}</p>
    <form method="POST" action="/cart/add" class="add-form">
      <input type="hidden" name="bookId" value="${escapeHtml(book.id)}" />
      <label for="add-${escapeHtml(book.id)}">Quantity</label>
      <input id="add-${escapeHtml(book.id)}" type="number" min="1" max="99" name="quantity" value="1" />
      <button type="submit">Add to cart</button>
    </form>
  </article>`).join('');

  const content = `
    ${renderMessages({ error, success })}
    <section>
      <h2>Book catalog</h2>
      <div class="grid">${catalog}</div>
    </section>
    <section>
      <h2>Your cart</h2>
      ${renderCartSummary(cart)}
      <p><a class="button-link" href="/checkout">Proceed to checkout</a></p>
    </section>
  `;

  return renderLayout({ title: 'Bookstore', content });
}

function fieldError(errors, key) {
  if (!errors[key]) return '';
  return `<p class="field-error" role="alert">${escapeHtml(errors[key])}</p>`;
}

function renderCheckout({ cart, errors = {}, values = {}, success }) {
  const content = `
    ${renderMessages({ error: errors.cart, success })}
    <section>
      <h2>Checkout</h2>
      <p>Demo payment flow only. Do not submit real card information.</p>
      ${renderCartSummary(cart)}
      <form method="POST" action="/checkout" novalidate>
        <div class="form-grid">
          <label>Full name<input name="customerName" value="${escapeHtml(values.customerName)}" required /></label>
          ${fieldError(errors, 'customerName')}

          <label>Email<input name="email" type="email" value="${escapeHtml(values.email)}" required /></label>
          ${fieldError(errors, 'email')}

          <label>Address<input name="address" value="${escapeHtml(values.address)}" required /></label>
          ${fieldError(errors, 'address')}

          <label>City<input name="city" value="${escapeHtml(values.city)}" required /></label>
          ${fieldError(errors, 'city')}

          <label>State/Province<input name="state" value="${escapeHtml(values.state)}" required /></label>
          ${fieldError(errors, 'state')}

          <label>Postal code<input name="postalCode" value="${escapeHtml(values.postalCode)}" required /></label>
          ${fieldError(errors, 'postalCode')}

          <label>Name on card<input name="cardName" value="${escapeHtml(values.cardName)}" required /></label>
          ${fieldError(errors, 'cardName')}

          <label>Card number<input name="cardNumber" inputmode="numeric" autocomplete="off" required /></label>
          ${fieldError(errors, 'cardNumber')}

          <label>Expiry (MM/YY)<input name="cardExpiry" value="${escapeHtml(values.cardExpiry)}" placeholder="MM/YY" required /></label>
          ${fieldError(errors, 'cardExpiry')}

          <label>CVV<input name="cardCvv" inputmode="numeric" autocomplete="off" required /></label>
          ${fieldError(errors, 'cardCvv')}
        </div>
        <button type="submit">Place order</button>
      </form>
    </section>
  `;

  return renderLayout({ title: 'Checkout', content });
}

module.exports = {
  renderCheckout,
  renderHome,
};
