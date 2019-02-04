const { join } = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
let configFile = '';

if (process.platform === 'win32') {
  configFile = join(process.env.HOMEDRIVE, process.env.HOMEPATH, 'cpi-log-settings.json');
} else {
  configFile = join(process.env.HOME, 'cpi-log-settings.json');
}

const adapter = new FileSync(configFile);
const db = low(adapter);
db.defaults({
  tenants: []
}).write();

module.exports = db;

/*
tenants object signature:
{
  name: user alias
  url: base url as in browser, ie https://{Account Short Name}-tmn.{SSL Host}.{DC}.hana.ondemand.com/
  authorization: base64 encoded username and password
  artefacts: [{
    name,
    
  }]
}
*/
