const axios = require('axios');
const db = require('./settings');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const prettifyXml = require('prettify-xml');
const moment = require('moment');
const filenamify = require('filenamify');

module.exports = async (tenantId, flowname, lastRunDate) => {
  let tenant = db
    .read()
    .get('tenants')
    .find({ id: tenantId })
    .value();
  tenant[flowname] = tenant[flowname] || {};
  tenant[flowname].lastRunDate = lastRunDate;
  let cpi = axios.create({
    baseURL: `${tenant.url}/api/v1`,
    headers: {
      Authorization: tenant.auth
    }
  });
  let options = {
    params: {
      $format: 'json',
      $filter: `IntegrationFlowName eq '${flowname}'`,
      $orderby: 'LogEnd desc'
    }
  };

  if (lastRunDate && lastRunDate.length > 0) {
    options.params['$filter'] = options.params['$filter'].concat(
      ` and LogStart gt datetime'${lastRunDate}'`
    );
  } else {
    options.params['$top'] = 10;
  }

  const result = await cpi.get('/MessageProcessingLogs', options);
  const logs = result.data.d.results;
  if (logs.length === 0) {
    return lastRunDate;
  }
  let runDate = moment(logs[0].LogStart, 'x')
    .toISOString()
    .substr(0, 19);
  tenant[flowname].lastRunDate = runDate;
  db.read()
    .get('tenants')
    .find({ id: tenantId })
    .assign(tenant)
    .write();

  for (let log of logs) {
    let { MessageGuid, LogStart } = log;
    let logDate = new Date(LogStart.match(/[0-9]+/)[0] * 1);
    let logFolderName = `${logDate.toJSON()}-${MessageGuid}`.replace(/:/gi, '-');
    let flowFolder = path.join(tenant.folder, flowname);
    let logFolder = path.join(flowFolder, logFolderName);

    // Create the folder for this log
    if (!fs.existsSync(flowFolder)) {
      fs.mkdirSync(flowFolder);
    }

    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder);
    }
    // retrieve the attachment array
    const attachments = (await cpi.get(log.Attachments['__deferred'].uri)).data.d.results;
    fs.writeFileSync(path.join(logFolder, 'log.json'), JSON.stringify(log, null, 2));
    for (let attachment of attachments) {
      try {
        let result = await cpi.get(attachment['__metadata'].media_src);
        let ext = mime.extension(attachment.ContentType);
        let data = result.data;
        if (ext === 'xml') {
          data = prettifyXml(data);
        }
        let filename = filenamify(attachment.Name, { replacement: '-' });
        fs.writeFileSync(path.join(logFolder, `${filename}.${ext}`), data);
      } catch (e) {
        console.dir(`Error retrieving ${attachment.Name}`);
      }
    }
  }
  return runDate;
};
