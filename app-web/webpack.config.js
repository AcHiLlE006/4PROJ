const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      path: '../.env',
      safe: false,            // charger même si certaines vars manquent
      systemvars: true        // autoriser process.env legacy
    })
  ]
};
