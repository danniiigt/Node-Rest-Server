const { Router } = require('express');
const { check } = require('express-validator');
const { coleccionesPermitidas } = require('../helpers/db-validators');
const { subirArchivo } = require('../helpers/subir-archivo');
const { validarArchivo } = require('../middlewares/validar-archivo');
const { validarCampos } = require('../middlewares/validar-campos');
const { Usuario, Producto } = require('../models')
const path = require('path')
const router = Router();
const fs = require('fs')
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)


router.post('/', [
    validarArchivo,
    validarCampos
], async (req, res) => {
    // Texto
    let nombreArchivo;

    try {
        nombreArchivo = await subirArchivo(req.files, ['pdf', 'txt'], 'texto')
        res.json({
            ok: true,
            nombreArchivo
        })
    } catch (error) {
        res.json({
            ok: false,
            error
        })
    }

})

router.put(
    '/:coleccion/:id', [
    check('id', 'El id debe ser de mongo').isMongoId(),
    check('coleccion').custom(c => coleccionesPermitidas(c, ['usuarios', 'productos'])),
    validarCampos,
    validarArchivo,
], async (req, res) => {

    const coleccion = req.params.coleccion
    const id = req.params.id
    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id)

            if (!modelo) {
                return res.status(400).json({
                    ok: false,
                    error: `No existe usuario con el ID ${id}`
                })
            }
            break;

        case 'productos':
            modelo = await Producto.findById(id)

            if (!modelo) {
                return res.status(400).json({
                    ok: false,
                    error: `No existe producto con el ID ${id}`
                })
            }

            break;

        default:
            return res.status(500).json({
                ok: false,
                error: 'Contacte con el administrador'
            })
    }

    // Limpiar imagenes previas
    if (modelo.img) {
        const nombreArr = modelo.img.split("/");
        const nombre = nombreArr[nombreArr.length - 1]
        const [cloudinaryId] = nombre.split(".")
        cloudinary.uploader.destroy(cloudinaryId)
    }

    const {tempFilePath} = req.files.archivo
    const {secure_url} = await cloudinary.uploader.upload(tempFilePath)

    try {
        modelo.img = secure_url
        await modelo.save()
        res.json({
            ok: true,
            modelo
        })
    } catch (error) {
        res.json({
            ok: false,
            error
        })
    }
})

router.get('/:coleccion/:id', [
    check('id', 'El id debe ser de mongo').isMongoId(),
    check('coleccion').custom(c => coleccionesPermitidas(c, ['usuarios', 'productos'])),
    validarCampos,
], async (req, res) => {

    const coleccion = req.params.coleccion
    const id = req.params.id
    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id)

            if (!modelo) {
                return res.status(400).json({
                    ok: false,
                    error: `No existe usuario con el ID ${id}`
                })
            }
            break;

        case 'productos':
            modelo = await Producto.findById(id)

            if (!modelo) {
                return res.status(400).json({
                    ok: false,
                    error: `No existe producto con el ID ${id}`
                })
            }

            break;

        default:
            return res.status(500).json({
                ok: false,
                error: 'Contacte con el administrador'
            })
    }

    // Limpiar imagenes previas
    if (modelo.img) {
        const pathImg = path.join(__dirname, '../uploads', coleccion, modelo.img)
        if (fs.existsSync(pathImg)) {
            return res.sendFile(pathImg)
        }
    } else {
        const pathNoImage = path.join(__dirname, '../assets/no-image.jpg')
        res.sendFile(pathNoImage)
    }


})

module.exports = router