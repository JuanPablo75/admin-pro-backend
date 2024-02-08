const { response } = require('express');
const { validationResult } = require('express-validator');

/**
 * Middleware para validar los campos de una solicitud utilizando express-validator.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {function} next - Función para pasar el control al siguiente middleware.
 * @returns {Object} - Respuesta HTTP indicando si hay errores de validación en los campos.
 */
const validarCampos = (req, res = response, next) => {
    // Verificar los resultados de la validación utilizando express-validator
    const errores = validationResult(req);

    // Comprobar si hay errores y devolver una respuesta con los errores mapeados
    if (!errores.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errors: errores.mapped()
        });
    }

    // Pasar al siguiente middleware o controlador si no hay errores
    next();
};

// Exportar el middleware para su uso en otras partes de la aplicación
module.exports = {
    validarCampos
};
