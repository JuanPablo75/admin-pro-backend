const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');
const { googleVerify } = require('../helpers/google-verify');



const login = async(req, res) => {

    const { email, password } = req.body;
    try {
        
        //Verificar Email
        const usuarioDB = await Usuario.findOne({ email });

        if (!usuarioDB){
            return res.status(400).json({
                ok: false,
                msg: 'Email no encontrado.'
            })
        }

        //Verificar Contraseña
        const validPassword = bcrypt.compareSync( password, usuarioDB.password);
        if(!validPassword){
            return res.status(400).json({
                ok: false,
                msg:'Contraseña no válida.'
            })
        
        }

        //Generar el TOKEN - JWT
        const token = await generarJWT( usuarioDB.id )

        res.json({
            ok:true,
            token
        })
    } catch (error) {
        console.log(error);
        res.status(500).jason({
            ok: false,
            msg:'Hable con el administrador.'
        })
        
    }
}

const googleSignIn = async(req, res) => {

    try {
        const { email, name, picture } = await googleVerify( req.body.token );

        const usuarioDB = await Usuario.findOne({ email });
        let usuario;

        if ( !usuarioDB ){
            usuario = new Usuario({
                nombre: name,
                email,
                password: '',
                img : picture,
                google: true
            })
        } else{
            usuario = usuarioDB;
            usuario.google = true;
        }

        // Guardar Usuario
        await usuario.save();

        // Generar el TOKEN -JWT
        const token = await generarJWT( usuario.id )

        res.json({
            ok: true,
            email, name, picture,
            token
        })
    }

        
     catch (err) {
        console.log(err)
        res.status(400).json({
            ok: false,
            msg: 'El token de Google no es correcto.'
        })
    }


}

const renewToken = async(req, res = response) => {

    const uid = req.uid;

    // Generar el TOKEN - JWT
    const token = await generarJWT( uid );

    // Obtener el usuario por Uid
    const usuario = await Usuario.findById(uid);

    res.json({
        ok: true,
        token,
        usuario
    });

}

module.exports = { login, googleSignIn, renewToken}