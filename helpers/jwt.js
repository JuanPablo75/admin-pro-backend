const jwt = require('jsonwebtoken');

/**
 * Genera un JSON Web Token (JWT) para un usuario identificado por su UID.
 * @param {string} uid - Identificador único del usuario para el cual se generará el JWT.
 * @returns {Promise<string>} - Promesa que resuelve con el JWT generado.
 */
const generarJWT = (uid) => {
    return new Promise((resolve, reject) => {
        // Crear el payload con el UID del usuario
        const payload = {
            uid
        };

        // Firmar el JWT con la clave secreta y establecer una vigencia de 12 horas
        jwt.sign( payload, process.env.JWT_SECRET, {
            expiresIn: '12h'
        }, (err, token) => {
            if (err) {
                console.error(err);
                reject('No se pudo generar el JWT');
            } else {
                // Resolver la promesa con el token generado
                resolve(token);
            }
        });
    });
};

// Exportar la función para su uso en otras partes de la aplicación
module.exports = {
    generarJWT
};
