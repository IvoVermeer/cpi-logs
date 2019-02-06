/* global io */
(() => {
  let socket = io.connect();
  let refreshArtifacts = document.querySelector('#refresh');
  let search = document.querySelector('#search');
  let modal = document.querySelector('#refresh-modal');

  refreshArtifacts.onclick = function() {
    let self = this;
    let id = self.dataset.tenant;
    self.disabled = true;
    socket.emit('refresh-artifacts', { id }, ({ artifacts, tenant }) => {
      let artifactsDiv = document.querySelector('#artifacts');
      artifactsDiv.innerHTML = artifacts
        .map(artifact => artifactTemplate(artifact, tenant))
        .join('\n');
      buttonHandlers();
      self.disabled = false;
    });
  };
  buttonHandlers();

  search.addEventListener('keyup', function() {
    let forms = document.querySelectorAll('form');
    for (let form of forms) {
      form.parentElement.classList.remove('w3-hide');
      if (this.value === '') continue;
      if (!form.dataset.artifact.toLowerCase().includes(this.value.toLowerCase())) {
        form.parentElement.classList.add('w3-hide');
      }
    }
  });

  function artifactTemplate(artifact, tenant) {
    let date = new Date(artifact.DeployedOn).toLocaleString();
    let formClassString = 'w3-container w3-col l4 m6 s12 w3-section';
    if (search.value && !artifact.Id.toLowerCase().includes(search.value.toLowerCase())) {
      formClassString += ' w3-hide';
    }
    /* eslint-disable */
    return `<div class="${formClassString}">
        <form class="w3-card" data-artifact="${artifact.Id}" data-tenant="${tenant.id}">
          <header class="w3-container w3-metro-blue">
            <h4>${artifact.Name}</h4>
          </header>
          <div class="w3-container">
            <p>Deployed on: ${date}</p>
            <p>Status: ${artifact.Status}</p>
          <label for="lastRunDate">Last run date (logs as of) </label>
          <input type="text" name="lastRunDate" value="${(tenant[artifact.Id] &&
            tenant[artifact.Id].lastRunDate) ||
            ''}" placeholder="yyyy-MM-ddTHH:mm:ss">
          </div>
          <div class="w3-container">
            <button class="w3-btn w3-metro-blue w3-margin" type="button" name="logs" value="${
              artifact.Id
            }">Refresh logs</button>
            <button class="w3-btn w3-metro-blue w3-margin" type="button" name="backup" value="${
              artifact.Id
            }">Backup</button>
          </div>
        </form>
      </div>`;
    /* eslint-enable */
  }

  function buttonHandlers() {
    let refreshes = document.querySelectorAll('button[name=logs]');
    let backups = document.querySelectorAll('button[name=backup]');

    for (let refresh of refreshes) {
      refresh.addEventListener('click', refreshHandler);
    }

    for (let backup of backups) {
      backup.addEventListener('click', backupHandler);
    }
    function refreshHandler() {
      let self = this;
      let form = self.form;
      let data = form.dataset;
      self.disabled = true;
      modal.style.display = 'block';

      let artifact = data.artifact;
      let tenant = data.tenant;
      let lastrunDateInput = form.querySelector('input[name=lastRunDate]');
      let lastRunDate = lastrunDateInput.value;
      socket.emit('refresh', { artifact, tenant, lastRunDate }, res => {
        self.disabled = false;
        modal.style.display = 'none';
        lastrunDateInput.value = res;
      });
    }

    function backupHandler() {
      let self = this;
      let form = self.form;
      let data = form.dataset;
      self.disabled = true;
      let flowName = data.artifact;
      let tenantId = data.tenant;
      socket.emit('backup', { tenantId, flowName }, () => {
        self.disabled = false;
      });
    }
  }
})();
