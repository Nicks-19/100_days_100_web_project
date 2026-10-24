function luhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
    let digit = Number.parseInt(cardNumber[index], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function normalizeText(value) {
  return String(value || '').trim();
}

function validateCheckoutInput(body, cart) {
  const errors = {};
  const values = {
    customerName: normalizeText(body.customerName),
    email: normalizeText(body.email).toLowerCase(),
    address: normalizeText(body.address),
    city: normalizeText(body.city),
    state: normalizeText(body.state),
    postalCode: normalizeText(body.postalCode),
    cardName: normalizeText(body.cardName),
    cardExpiry: normalizeText(body.cardExpiry),
  };

  const cardNumber = normalizeText(body.cardNumber).replace(/\s+/g, '');
  const cardCvv = normalizeText(body.cardCvv);

  if (!values.customerName || values.customerName.length < 2) {
    errors.customerName = 'Please enter your full name.';
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.address || values.address.length < 5) {
    errors.address = 'Please enter a valid shipping address.';
  }

  if (!values.city) {
    errors.city = 'City is required.';
  }

  if (!values.state || !/^[A-Za-z\s]{2,40}$/.test(values.state)) {
    errors.state = 'Please enter a valid state or province.';
  }

  if (!values.postalCode || !/^[A-Za-z0-9\-\s]{4,12}$/.test(values.postalCode)) {
    errors.postalCode = 'Please enter a valid postal code.';
  }

  if (!values.cardName || values.cardName.length < 2) {
    errors.cardName = 'Name on card is required.';
  }

  if (!/^\d{13,19}$/.test(cardNumber) || !luhnCheck(cardNumber)) {
    errors.cardNumber = 'Please enter a valid card number for this demo.';
  }

  if (!/^\d{3,4}$/.test(cardCvv)) {
    errors.cardCvv = 'Please enter a valid 3 or 4 digit CVV.';
  }

  if (!/^\d{2}\/\d{2}$/.test(values.cardExpiry)) {
    errors.cardExpiry = 'Expiry must be in MM/YY format.';
  } else {
    const [monthRaw, yearRaw] = values.cardExpiry.split('/');
    const month = Number.parseInt(monthRaw, 10);
    const year = Number.parseInt(yearRaw, 10);

    if (month < 1 || month > 12) {
      errors.cardExpiry = 'Expiry month must be between 01 and 12.';
    } else {
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.cardExpiry = 'Card expiry date cannot be in the past.';
      }
    }
  }

  if (!cart.items.length) {
    errors.cart = 'Your cart is empty. Add at least one book before checkout.';
  }

  if (cart.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    errors.cart = 'Your cart has invalid quantities. Please update it and try again.';
  }

  if (cart.items.some((item) => item.unknownBook)) {
    errors.cart = 'Your cart has an unknown book. Please remove it and try again.';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    values,
  };
}

module.exports = {
  validateCheckoutInput,
};
