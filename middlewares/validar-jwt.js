const { request, response } = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario')


const validarJWT = async ( req = request, res = response, next ) => {
    const token = req.header('x-token');

    if(!token) {
        return res.status(401).json({
            ok: false,
            msg: 'Debes de incluir un token en la petición a través de los headers (x-token).'
        })
    }

    try {
        const {uid} = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
        
        // Leer el usuario que corresponde al uid
        const usuario = await Usuario.findById(uid)

        // Verificar que el usuario no sea undefined
        if(!usuario) {
            return res.status(401).json({
                ok: false,
                msg: 'El usuario no existe en la BD'
            })
        }

        // Verificar que el usuario esté dado de alta (estado: true)
        if(!usuario.estado) {
            return res.status(401).json({
                ok: false,
                msg: 'El usuario está dado de baja'
            })
        }

        req.usuario = usuario
        next()
    } catch (error) {
        res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        })
    }
}

module.exports = {validarJWT}