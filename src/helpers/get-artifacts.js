const db = require('./settings');
const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');

module.exports = async id => {
  let tenant = db
    .read()
    .get('tenants')
    .find({ id })
    .value();
  let uri = `${tenant.url}/api/v1/IntegrationRuntimeArtifacts`;
  const runtime = await axios.get(uri, {
    query: {
      $format: 'json'
    },
    headers: {
      Authorization: tenant.auth
    }
  });
  const artifacts = _.chain(runtime.data.d.results)
    .filter(o => o.Type === 'INTEGRATION_FLOW')
    .each(o => (o.DeployedOn = moment(o.DeployedOn, 'x')))
    .sortBy(['DeployedOn'])
    .reverse()
    .value();
  return { artifacts, tenant };
};
