const app = require('../src/app');

if (process.env.VERCEL === '1') {
    app.set('trust proxy', 1);
}

module.exports = app;