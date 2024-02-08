const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');
const { googleVerify } = require('../helpers/google-verify');

/**
 * Controlador para el inicio de sesión de usuarios mediante credenciales (email y contraseña).
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Verificar si el email existe en la base de datos
        const usuarioDB = await Usuario.findOne({ email });

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                msg: 'Email no encontrado en la base de datos.'
            });
        }

        // Verificar la contraseña utilizando bcrypt
        const validPassword = bcrypt.compareSync(password, usuarioDB.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta.'
            });
        }

        // Generar el TOKEN - JWT
        const token = await generarJWT(usuarioDB.id);

        // Enviar la respuesta con el token generado
        res.json({
            ok: true,
            token
        });
    } catch (error) {
        // Manejar errores internos del servidor
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor. Por favor, hable con el administrador.'
        });
    }
};

/**
 * Controlador para el inicio de sesión de usuarios mediante Google Sign-In.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const googleSignIn = async (req, res) => {
    try {
        // Verificar y obtener la información del usuario desde el token de Google
        const { email, name, picture } = await googleVerify(req.body.token);

        // Buscar si existe un usuario con el mismo email en la base de datos
        const usuarioDB = await Usuario.findOne({ email });
        let usuario;

        if (!usuarioDB) {
            // Crear un nuevo usuario si no existe en la base de datos
            usuario = new Usuario({
                nombre: name,
                email,
                password: '', // La autenticación se realiza mediante Google, por lo que no se almacena la contraseña.
                img: picture,
                google: true
            });
        } else {
            // Utilizar el usuario existente y marcarlo como usuario de Google
            usuario = usuarioDB;
            usuario.google = true;
        }

        // Guardar Usuario en la base de datos
        await usuario.save();

        // Generar el TOKEN - JWT
        const token = await generarJWT(usuario.id);

        // Enviar la respuesta con la información del usuario y el token generado
        res.json({
            ok: true,
            email, name, picture,
            token
        });
    } catch (err) {
        // Manejar errores al verificar el token de Google
        console.error(err);
        res.status(400).json({
            ok: false,
            msg: 'El token de Google no es válido.'
        });
    }
};

/**
 * Controlador para renovar el token de un usuario autenticado.
 * @param {Object} req - Objeto de solicitud HTTP que contiene la información del cliente.
 * @param {Object} res - Objeto de respuesta HTTP utilizado para enviar respuestas al cliente.
 */
const renewToken = async (req, res = response) => {
    const uid = req.uid;

    // Generar el TOKEN - JWT
    const token = await generarJWT(uid);

    // Obtener el usuario por Uid
    const usuario = await Usuario.findById(uid);

    // Enviar la respuesta con el nuevo token y la información del usuario
    res.json({
        ok: true,
        token,
        usuario
    });
};

// Exportar los controladores para su uso en otras partes de la aplicación
module.exports = { login, googleSignIn, renewToken };
