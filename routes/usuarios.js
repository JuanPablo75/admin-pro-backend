/*
    Ruta: /api/usuarios
*/

const { Router } = require('express');
const { check } = require('express-validator');

const { getUsuarios, crearUsuarios, actualizarUsuario, eliminarUsuario } = require('../controllers/usuarios');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

router.get('/', validarJWT, getUsuarios);

router.post( '/', 
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('password', 'El password es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').not().isEmpty(),
        validarCampos
    ],
    crearUsuarios);

router.put('/:id',
    [
        validarJWT,
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').not().isEmpty(),
        check('role', 'El role es obligatorio').not().isEmpty(),
        validarCampos
    ],
    actualizarUsuario);

router.delete('/:id',
    validarJWT,
    eliminarUsuario);



module.exports = router;