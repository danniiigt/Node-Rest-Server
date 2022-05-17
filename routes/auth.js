const { response } = require('express');
const { Router } = require('express')
const { check, validationResult } = require('express-validator');
const router = Router();
const Usuario = require('../models/usuario')
const bcrypt = require('bcrypt');
const { generarJWT } = require('../helpers/generar-jwt');
const { googleVerify } = require('../helpers/validar-token-google');

router.post(
    '/login', [
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    ],
    async (req, res = response) => {

        //Verificar si hay errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                errors: errors.array()
            });
        }

        const { correo, password } = req.body;
        try {

            // Verificar si el email existe
            const usuario = await Usuario.findOne({correo})
            if(!usuario) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No se encuentra usuario con dicho email'
                })
            }

            // Verificar usuario activo
            if(!usuario.estado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El usuario con ese email está dado de baja'
                })
            }

            // Verificar la contraseña
            const validPassword = bcrypt.compareSync(password, usuario.password)

            if(!validPassword) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La contraseña no coincide'
                })
            }

            // Generar el JWT
            const token = await generarJWT(usuario._id)


            res.json({
                usuario,
                token
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: 'Hable con el administrador',
            })
        }
    });

router.post(
    '/google', [
        check('id_token', 'El token ID es necesario').not().isEmpty()
    ], 
    async (req, res) => {
        const {id_token} = req.body

        //Verificar si hay errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                errors: errors.array()
            });
        }

        try {
            const {correo, nombre, img} = await googleVerify(id_token)
            let usuario = await Usuario.findOne({correo})

            if(!usuario) {
                const data = {
                    nombre, 
                    correo, 
                    password: '123456',
                    rol: 'USER_ROLE',
                    google: true,
                    img
                }

                usuario = new Usuario(data);
                await usuario.save();
            }

            if(!usuario.estado) {
                res.status(401).json({
                    ok: false,
                    msg: 'Usuario bloqueado'
                })
            }

            // Generar el JWT
            const token = await generarJWT(usuario.id)

            res.json({
                usuario,
                token
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                ok: false,
                error
            })
        }

    })

module.exports = router;