const express = require('express');
const tenantController = require('../controllers/tenant-controller');
const { catchErrors } = require('../helpers/error-handlers');
const router = express.Router();

router.get('/', tenantController.getTenants);
router.get('/add-tenant', tenantController.newTenantForm);
router.post('/add-tenant', tenantController.saveNewTenant);
router.get('/:tenantId/edit', catchErrors(tenantController.editTenantById));
router.post('/:tenantId/edit', catchErrors(tenantController.saveTenantById));
router.post('/:tenantId/delete', catchErrors(tenantController.deleteTenantById));
router.get('/:tenantId/view', catchErrors(tenantController.viewTenantById));

module.exports = router;
