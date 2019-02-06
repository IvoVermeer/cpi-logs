#!/usr/bin/env node
const http = require('./src/app');
const opn = require('opn');

if (process.env.NODEENV === 'dev') {
  const inspector = require('inspector');
  inspector.open();
}

http.listen(3000, () => {
  if (process.env.NODEENV !== 'dev') {
    opn(`http://localhost:${http.address().port}`);
    console.log('The app has started, the browser should have opened.');
    console.log('If browser did not open, go to http://localhost:3000');
    console.log('Keep this window open, closing it will end the app');
    console.log('Press Ctrl+C to quit the app');
  }
});
