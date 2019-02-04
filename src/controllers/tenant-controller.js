const axios = require('axios');
const shortid = require('shortid');
const db = require('../helpers/settings');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');

exports.getTenants = (req, res) => {
  const tenants = db
    .read()
    .get('tenants')
    .value();
  if (tenants.length === 0) {
    req.flash('w3-pale-yellow', 'Please add a tenant');
    return res.redirect('/add-tenant');
  }
  res.render('tenants', { tenants });
};

exports.newTenantForm = (req, res) => {
  res.render('edit-tenant');
};

exports.saveNewTenant = (req, res) => {
  let encoded = Buffer.from(`${req.body.username}:${req.body.password}`).toString('base64');
  let tenantUrl = new URL(req.body.url).origin;
  let tenant = {
    name: req.body.name,
    url: tenantUrl,
    folder: req.body.folder,
    id: shortid.generate(),
    username: req.body.username,
    auth: `Basic ${encoded}`
  };
  if (tenant.name === '' || tenant.url == '') {
    req.flash('w3-pale-yellow', 'Please fill in all information');
    return res.redirect('/add-tenant');
  }
  db.read()
    .get('tenants')
    .push(tenant)
    .write();
  res.redirect('/');
};

exports.editTenantById = (req, res) => {
  let tenant = db
    .read()
    .get('tenants')
    .find({ id: req.params.tenantId })
    .value();
  res.render('edit-tenant', { tenant });
};

exports.saveTenantById = (req, res) => {
  let tenantUrl = new URL(req.body.url).origin;
  let newTenant = {
    name: req.body.name,
    url: tenantUrl,
    folder: req.body.folder,
    username: req.body.username
  };
  if (req.body.password) {
    let encoded = Buffer.from(`${req.body.username}:${req.body.password}`).toString('base64');
    newTenant.auth = `Basic ${encoded}`;
  }
  db.read()
    .get('tenants')
    .find({ id: req.params.tenantId })
    .assign(newTenant)
    .write();
  res.redirect('/');
};

exports.deleteTenantById = (req, res) => {
  db.read()
    .get('tenants')
    .remove({ id: req.params.tenantId })
    .write();
  res.redirect('/');
};

exports.viewTenantById = async (req, res) => {
  let tenant = db
    .read()
    .get('tenants')
    .find({ id: req.params.tenantId })
    .value();
  // First check that the tenant has a folder registered and that it exists
  if (!tenant.folder) res.redirect(`/${tenant.id}/edit`);
  let logFolder = path.normalize(tenant.folder);
  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
  }
  let uri = `${tenant.url}/api/v1/IntegrationRuntimeArtifacts`;
  const runtime = await axios.get(uri, {
    query: {
      $format: 'json'
    },
    headers: {
      Authorization: tenant.auth
    }
  });
  // res.json(runtime.data.d.results);
  const artifacts = _.chain(runtime.data.d.results)
    .filter(o => o.Type === 'INTEGRATION_FLOW')
    .each(o => (o.DeployedOn = moment(o.DeployedOn, 'x')))
    .sortBy(['DeployedOn'])
    .reverse()
    .value();
  res.render('runtime', { title: 'Runtime artifacts', artifacts, tenant });
};
