#! /usr/bin/env node

require('dotenv').config({ silent: true });

const server = require('./app');

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log('Server running on port: %d', port);
});
