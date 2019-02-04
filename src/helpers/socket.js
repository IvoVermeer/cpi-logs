const socket = require('socket.io');
const getLogs = require('./get-message-logs');
const backupArtifact = require('./backup-artifact');
const getArtifacts = require('./get-artifacts');
module.exports = http => {
  const io = socket(http);
  io.on('connect', socket => {
    socket.on('refresh', (data, response) => {
      getLogs(data.tenant, data.artifact, data.lastRunDate)
        .then(result => {
          response(result);
        })
        .catch(() => {
          response('Error!');
        });
    });
    socket.on('backup', (data, response) => {
      backupArtifact(data.tenantId, data.flowName)
        .then(result => {
          response(result);
        })
        .catch(error => {
          response(error);
        });
    });
    socket.on('refresh-artifacts', (data, response) => {
      getArtifacts(data.id)
        .then(data => {
          response(data);
        })
        .catch(() => {
          response('Error!');
        });
    });
  });
};
