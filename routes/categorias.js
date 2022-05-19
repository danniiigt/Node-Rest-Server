const { Router } = require('express')
const { check, validationResult } = require('express-validator');
const { existeEsaCategoria, existeCategoriaPorID } = require('../helpers/db-validators');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();
const Categoria = require('../models/categoria');


// OBTENER TODAS LAS CATEGORIAS - Paginado - Mostrar total - Populate
router.get('/', validarJWT, async (req, res) => {
    const { limite = 5, desde = 0 } = req.query;
    const categorias = await Categoria.find()
        .skip(Number(desde))
        .limit(Number(limite))

    res.json({
        total: categorias.length,
        desde: desde,
        limite,
        categorias,
    })
});

//OBTENER CATEGORIA POR ID - Populate
router.get(
    '/:id', [
    validarJWT,
    check('id', 'El ID no es válido').not().isEmpty(),
    check('id').custom((id) => existeCategoriaPorID(id)),
    check('id', 'El ID no es válido').isMongoId()
],
    async (req, res) => {
        const id = req.params.id

        //Verificar si hay errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                errors: errors.array()
            });
        }

        const categoria = await Categoria.findById(id)

        res.json({
            ok: true,
            categoria
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
        const { nombre, estado } = req.body
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
router.put(
    '/:id', [
    validarJWT,
    check('id', 'El ID no es válido').not().isEmpty(),
    check('id').custom((id) => existeCategoriaPorID(id)),
    check('id', 'El ID no es válido').isMongoId(),
    check('nombre', 'El nombre no es válido').not().isEmpty()
],
    async (req, res) => {
        const id = req.params.id
        const {nombre} = req.body

        const categoria = await Categoria.findByIdAndUpdate(id, {nombre})
        categoria.save()

        if(categoria.nombre === nombre) {
            return res.json({
                ok: false,
                msg: "No se ha modificado la tarea puesto que el nombre introducido es el mismo al que ya hay."
            })
        } else {
            res.json({
                ok: true,
                modificado: nombre,
                categoria
            })
        }
    });


// BORRAR UNA CATEGORIA (PRIVADO) CON TOKEN_ID (SOLO ADMIN_ROLE)
router.delete('/', async (req, res) => {
    //NO BORRAR, PASAR EL ESTADO A false
    res.json({
        msg: 'todo OK'
    })
});

module.exports = router