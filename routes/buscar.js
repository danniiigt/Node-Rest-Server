const { response } = require('express');
const { ObjectId } = require('mongoose').Types;
const { Router } = require('express');
const {Usuario, Categoria, Producto} = require('../models')
const router = Router();

const coleccionesPermitidas = [
    'categorias', 'usuarios', 'productos', 'roles'
]

const buscarUsuarios = async (termino = '', res = response) => {
    const esMongoID = ObjectId.isValid(termino)

    if(esMongoID) {
        const usuario = await Usuario.findById(termino)
        return res.json({
            results: (usuario) ? [usuario] : []
        })
    }

    const regex = new RegExp(termino, 'i')
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
            
            break;
        case 'productos':
            
            break;
        case 'roles':
            
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