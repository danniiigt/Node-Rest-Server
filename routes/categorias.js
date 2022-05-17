const { Router } = require('express')
const { check, validationResult } = require('express-validator');
const { existeEsaCategoria } = require('../helpers/db-validators');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();
const Categoria = require('../models/categoria')


// OBTENER TODAS LAS CATEGORIAS
router.get('/', async (req, res) => {
    res.json({
        msg: 'todo OK'
    })
});


router.get('/:id', async (req, res) => {
    res.json({
        msg: 'todo OK'
    })
});


//CREAR CATEGORIA (PRIVADO) CON TOKEN_ID (CUALQUIER ROL)
router.post(
    '/', [
        validarJWT,
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('nombre').custom((nombre) => existeEsaCategoria(nombre)),
        //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
        //check('usuario', 'Introduce un ID de usuario válido').isMongoId(),
        // check('estado', 'El estado es obligatorio').not().isEmpty(),
    ],
    async (req, res) => {
        const { nombre, estado} = req.body
        const usuario = req.usuario._id

        //Verificar si hay errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                errors: errors.array()
            });
        }

        const categoria = new Categoria({
            nombre,
            estado,
            usuario
        })
        await categoria.save()

        res.json({
            ok: true,
            categoria
        })
    });


// ACTUALIZAR CATEGORIA (PRIVADO) CON TOKEN_ID (CUALQUIER ROL)
router.put('/', async (req, res) => {
    res.json({
        msg: 'todo OK'
    })
});


// BORRAR UNA CATEGORIA (PRIVADO) CON TOKEN_ID (SOLO ADMIN_ROLE)
router.delete('/', async (req, res) => {
    //NO BORRAR, PASAR EL ESTADO A false
    res.json({
        msg: 'todo OK'
    })
});

module.exports = router