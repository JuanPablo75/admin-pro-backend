const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');

/**
 * Obtiene un listado de usuarios paginado y su total.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {void}
 */
const getUsuarios = async (req, res = response) => {
    // Obtiene el valor de 'desde' de la consulta, o establece 0 por defecto
    const desde = Number(req.query.desde) || 0;

    // Consulta paginada de usuarios
    const usuarios = await Usuario
        .find({}, 'nombre email role google img')
        .skip(desde)
        .limit(5);

    // Obtiene el total de usuarios
    const total = await Usuario.countDocuments();

    // Responde con un objeto JSON que contiene el resultado y el total de usuarios
    res.json({
        ok: true,
        usuarios,
        total,
    });
};

/**
 * Crea un nuevo usuario en la base de datos.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {void}
 */
const crearUsuarios = async (req, res = response) => {
    // Obtiene el email y la contraseña del cuerpo de la solicitud
    const { email, password } = req.body;

    try {
        // Verifica si el correo ya está registrado
        const existeEmail = await Usuario.findOne({ email });

        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado.',
            });
        }

        // Crea un nuevo usuario y encripta la contraseña
        const usuario = new Usuario(req.body);
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        // Guarda el usuario en la base de datos
        await usuario.save();

        // Genera el TOKEN - JWT
        const token = await generarJWT(usuario.id);

        // Responde con un objeto JSON que contiene el resultado, el usuario y el token
        res.json({
            ok: true,
            msg: 'Crear Usuarios',
            usuario,
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado... revisar logs',
        });
    }
};

/**
 * Actualiza un usuario en la base de datos.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {void}
 */
const actualizarUsuario = async (req, res = response) => {
    // TODO: validar token y comprobar si es el usuario correcto

    const uid = req.params.id;
    const {} = req.params.id;

    try {
        // Busca el usuario por ID
        const usuarioDB = await Usuario.findById(uid);

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con ese id.',
            });
        }

        // Actualizaciones
        const { password, google, email, ...campos } = req.body;

        // Verifica si el correo ha cambiado
        if (usuarioDB.email !== email) {
            const existeEmail = await Usuario.findOne({ email });

            if (existeEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con ese email.',
                });
            }
        }

        // Si no es usuario de Google, actualiza el campo email
        if (!usuarioDB.gogle) {
            campos.email = email;
        } else if (usuarioDB.email !== email) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario de google no pueden cambiar su correo',
            });
        }

        // Actualiza el usuario en la base de datos
        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, campos, { new: true });

        // Responde con un objeto JSON que contiene el resultado y el usuario actualizado
        res.json({
            ok: true,
            usuario: usuarioActualizado,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado',
        });
    }
};

/**
 * Elimina un usuario de la base de datos.
 *
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @returns {void}
 */
const eliminarUsuario = async (req, res = response) => {
    const uid = req.params.id;

    try {
        // Busca el usuario por ID
        const usuarioDB = await Usuario.findById(uid);

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No hay usuarios registrados en la base de datos con ese id.',
            });
        }

        // Elimina el usuario de la base de datos
        await Usuario.findOneAndDelete({ _id: uid });

        // Responde con un objeto JSON que contiene el resultado y el usuario eliminado
        res.status(200).json({
            ok: true,
            msg: `Usuario ${usuarioDB.nombre} eliminado correctamente`,
            usuario: usuarioDB,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado.',
        });
    }
};

// Exporta los controladores para su uso en otros archivos
module.exports = { getUsuarios, crearUsuarios, actualizarUsuario, eliminarUsuario };
