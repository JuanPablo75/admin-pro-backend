const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

/**
 * Middleware para validar el token JWT en una petición.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {function} next - Función para pasar el control al siguiente middleware.
 * @returns {Object} - Respuesta HTTP indicando si el token es válido o no.
 */
const validarJWT = (req, res, next) => {
    // Leer el token del encabezado 'x-token' de la petición
    const token = req.header('x-token');

    // Verificar si el token está presente en la petición
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición.'
        });
    }

    try {
        // Verificar el token utilizando la clave secreta definida en el entorno
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);

        // Agregar el uid al objeto de solicitud para que esté disponible en los controladores
        req.uid = uid;

        // Pasar al siguiente middleware o controlador
        next();

    } catch (error) {
        // Manejar el caso en el que el token no es válido
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }
};

const validarADMIN_ROLE = async( req, res, next ) => {

    const uid = req.uid;

    try {

        const usuarioDB = await Usuario.findById(uid);

        if( !usuarioDB ){
            return res.status(404).json({
                ok: 'false',
                msg:'Usuario no existe.'
            })
        } 

        if (usuarioDB.role !== 'ADMIN_ROLE'){
            return res.status(403).json({
                ok: 'false',
                msg:'No tiene privilegios para hacer eso'
            })
        }

        next();
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        })
    }
}

const validarADMIN_ROLE_o_MismoUsuario = async( req, res, next ) => {

    const uid = req.uid;
    const id = req.params.id;
    try {

        const usuarioDB = await Usuario.findById(uid);

        if( !usuarioDB ){
            return res.status(404).json({
                ok: 'false',
                msg:'Usuario no existe.'
            })
        } 

        if (usuarioDB.role === 'ADMIN_ROLE' || uid === id ){

            next();

        } else {
            return res.status(403).json({
                ok: 'false',
                msg:'No tiene privilegios para hacer eso'
            })
        }

        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador.'
        })
    }

}

// Exportar el middleware para su uso en otras partes de la aplicación
module.exports = {
    validarJWT,
    validarADMIN_ROLE,
    validarADMIN_ROLE_o_MismoUsuario
};
