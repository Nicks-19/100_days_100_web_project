const express = require('express');
const path = require('node:path');

const { router } = require('./routes');
const { ensureSession } = require('./services/cartStore');

function createApp({ cartCookieSecret }) {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use((req, res, next) => {
    req.sessionId = ensureSession(req, res, cartCookieSecret);
    next();
  });

  app.use(router);

  app.use((req, res) => {
    res.status(404).send('Page not found.');
  });

  return app;
}

module.exports = {
  createApp,
};
