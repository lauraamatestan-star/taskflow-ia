const express = require('express');
const controllers = require('../controllers/task.controller');

const router = express.Router();

router.get('/', controllers.obtenerTodas);
router.post('/', controllers.crearTarea);
router.get('/:id', controllers.obtenerPorId);
router.patch('/:id', controllers.actualizarTarea);
router.delete('/:id', controllers.eliminarTarea);

module.exports = router;
