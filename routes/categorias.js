const { Router } = require('express')
const { check, validationResult } = require('express-validator');
const { existeEsaCategoria, existeCategoriaPorID } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');
const router = Router();
const Categoria = require('../models/categoria');


// OBTENER TODAS LAS CATEGORIAS - Paginado - Mostrar total - Populate
router.get('/', validarJWT, async (req, res) => {
    const { limite = 5, desde = 0 } = req.query;
    const categorias = await Categoria.find({ estado: true })
        .skip(Number(desde))
        .limit(Number(limite))

    res.json({
        ok: true,
        total: categorias.length,
        desde,
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
    check('id', 'El ID no es válido').isMongoId(),
    validarCampos
],
    async (req, res) => {
        const id = req.params.id
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
    validarCampos
    //check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    //check('usuario', 'Introduce un ID de usuario válido').isMongoId(),
    // check('estado', 'El estado es obligatorio').not().isEmpty(),
],
    async (req, res) => {
        const { nombre, estado } = req.body
        const usuario = req.usuario._id

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
    check('nombre', 'Debes de incluir el nuevo nombre').not().isEmpty(),
    check('nombre').custom((nombre) => existeEsaCategoria(nombre)),
    validarCampos
],
    async (req, res) => {
        const id = req.params.id
        const { nombre } = req.body
        const usuario = req.usuario._id

        const categoria = await Categoria.findByIdAndUpdate(id, { nombre, usuario }, {new: true})
        categoria.save()

        res.json({
            ok: true,
            categoria
        })
    });


// BORRAR UNA CATEGORIA (PRIVADO) CON TOKEN_ID (SOLO ADMIN_ROLE)
router.delete(
    '/:id', [
    validarJWT,
    tieneRole('ADMIN_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom((id) => existeCategoriaPorID(id))],
    async (req, res) => {
        const id = req.params.id
        const usuarioAutenticado = req.usuario
        const categoria = await Categoria.findByIdAndUpdate(id, { estado: false })

        if (!categoria.estado) {
            return res.json({
                ok: false,
                msg: 'La categoria ya está deshabilitada.'
            })
        } else {
            res.json({
                ok: true,
                categoria
            })
        }
    });

module.exports = router