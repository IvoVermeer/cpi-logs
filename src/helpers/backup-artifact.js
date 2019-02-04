const axios = require('axios');
const db = require('./settings');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

module.exports = async (tenantId, flowname) => {
  let tenant = db
    .read()
    .get('tenants')
    .find({ id: tenantId })
    .value();
  let options = {
    headers: {
      Authorization: tenant.auth
    },
    responseType: 'arraybuffer'
  };
  const { data } = await axios.get(
    `${tenant.url}/api/v1/IntegrationDesigntimeArtifacts(Id='${flowname}',Version='active')/$value`,
    options
  );
  let filename = `${moment().format('YYYY-MM-DDTHH-mm-ss')}-${flowname}.zip`;
  let file = path.join(tenant.folder, flowname, '_backup', filename);
  fs.writeFileSync(file, data);
  return `File was saved to ${path.resolve(file)}`;
};
