const { Router } = require('express');
const { check } = require('express-validator');
const { existeProductoPorID, existeEseProducto } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');
const router = Router();
const { Producto } = require('../models/');

// OBTENER TODOS LOS PRODUCTOS - Paginado - Mostrar total - Populate
router.get('/', async (req, res) => {
    const { limite = 5, desde = 0 } = req.query;
    const productos = await Producto.find({ estado: true })
        .skip(Number(desde))
        .limit(Number(limite))

    res.json({
        ok: true,
        total: productos.length,
        desde,
        limite,
        productos
    })
})


//OBTENER PRODUCTO POR ID
router.get(
    '/:id', [
    check('id', 'El ID no puede estar vacio').not().isEmpty(),
    check('id').custom((id) => existeProductoPorID(id)),
    validarCampos
],
    async (req, res) => {
        const id = req.params.id
        const producto = await Producto.findById(id)

        res.json({
            ok: true,
            producto
        })
    })


//CREAR PRODUCTO (PRIVADO) CON TOKEN_ID (CUALQUIER ROL)
router.post(
    '/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('nombre').custom((nombre) => existeEseProducto(nombre)),
    validarCampos
],
    async (req, res) => {
        const { nombre, precio, categoria, descripcion, disponible } = req.body
        const usuario = req.usuario._id

        const producto = new Producto({ nombre, precio, categoria, descripcion, disponible, usuario })
        await producto.save()

        res.json({
            ok: true,
            producto
        })
    })


// ACTUALIZAR PRODUCTO (PRIVADO) CON TOKEN_ID (CUALQUIER ROL)
router.put(
    '/:id', [
    validarJWT,
    check('id', 'El ID no es válido').not().isEmpty(),
    check('id').custom((id) => existeProductoPorID(id)),
    check('nombre').custom((nombre) => existeEseProducto(nombre)),
    validarCampos
],
    async (req, res) => {
        const id = req.params.id
        const { categoria, usuario, _id, estado, ...resto } = req.body
        resto.usuario = req.usuario._id

        if (Object.keys(resto).length === 0) {
            return res.json({
                ok: false,
                msg: 'Debes de introducir nuevos datos para actualizar el producto'
            })
        }

        const producto = await Producto.findByIdAndUpdate(id, resto, { new: true })
        res.json({
            ok: true,
            producto
        })

    })


// BORRAR UNA PRODUCTO (PRIVADO) CON TOKEN_ID (SOLO ADMIN_ROLE)
router.delete(
    '/:id', [
    validarJWT,
    tieneRole('ADMIN_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom((id) => existeProductoPorID(id)),
    validarCampos
],
    async (req, res) => {
        const id = req.params.id
        const producto = await Producto.findByIdAndUpdate(id, {estado: false}, {new: true})
        
        res.json({
            ok: true,
            producto
        })
    })

module.exports = router