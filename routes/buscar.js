const { response } = require('express');
const { ObjectId } = require('mongoose').Types;
const { Router } = require('express');
const {Usuario, Categoria, Producto, Role} = require('../models')
const router = Router();

const coleccionesPermitidas = [
    'categorias', 'usuarios', 'productos'
]

const buscarUsuarios = async (termino = '', res = response) => {
    const esMongoID = ObjectId.isValid(termino)

    if(esMongoID) {
        const usuario = await Usuario.findById(termino)
        return res.json({
            results: (usuario) ? [usuario] : []
        })
    }

    const regex = new RegExp(termino, 'i') // ESTO HACE QUE EL TERMINO SEA INSENSIBLE A LAS MINUSCULAS/MAYUSCULAS
    const usuarios = await Usuario.find({
        $or: [{nombre: regex}, {correo: regex}],
        $and: [{estado: true}]
    })

    res.json({
        ok: true,
        total: usuarios.length,
        results: usuarios
    })
}

const buscarCategorias = async (termino = '', res = response) => {
    const esMongoID = ObjectId.isValid(termino)

    if(esMongoID) {
        const categoria = await Categoria.findById(termino)

        return res.json({
            ok: true,
            results: (categoria) ? [categoria] : []
        })
    }

    const regex = new RegExp(termino, 'i') // ESTO HACE QUE EL TERMINO SEA INSENSIBLE A LAS MINUSCULAS/MAYUSCULAS
    const categorias = await Categoria.find({nombre: regex})

    res.json({
        ok: true,
        total: categorias.length,
        results: categorias
    })

}

const buscarProductos = async (termino = '', res = response) => {
    const esMongoID = ObjectId.isValid(termino)

    if(esMongoID) {
        const producto = Producto.findById(termino).populate('categoria', 'nombre')

        res.json({
            ok: true,
            results: (producto) ? [producto] : []
        })
    }

    const regex = new RegExp(termino, 'i') // ESTO HACE QUE EL TERMINO SEA INSENSIBLE A LAS MINUSCULAS/MAYUSCULAS
    const productos = await Producto.find({
        $or: [{nombre: regex}, {descripcion: regex}],
        $and: [{estado: true}]
    }).populate('categoria', 'nombre')

    res.json({
        ok: true,
        total: productos.length,
        results: productos,
    })
}

router.get('/:coleccion/:termino', (req, res) => {
    const { coleccion, termino } = req.params

    if(!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            ok: false,
            msg: `Las peticiones permitidas son: ${coleccionesPermitidas}`
        })
    }

    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res)
            break;
        case 'categorias':
            buscarCategorias(termino, res)
            break;
        case 'productos':
            buscarProductos(termino, res)
            break;
    
        default:
            res.status(500).json({
                ok: false,
                msg: 'Contacte con el ADMIN - Error de búsqueda'
            })
            break;
    }

    // res.json({
    //     msg: 'Buscar...',
    //     coleccion,
    //     termino,
    // })
})

module.exports = router