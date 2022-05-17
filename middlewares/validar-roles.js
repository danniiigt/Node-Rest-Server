const { response } = require("express")

const esAdminRole = (req, res = response, next) => {
    if(req.usuario) {
        const usuario = req.usuario

        if(usuario.rol !== "ADMIN_ROLE") {
            return res.status(401).json({
                ok: false,
                msg: 'El usuario no posee el rol de Administrador'
            })
        }

    } else {
        return res.status(500).json({
            ok: false,
            msg: 'No hay un usuario establecido'
        })
    }


    next()
}

const tieneRole = (...roles) => {
    return(req, res = response, next) => {
        if(!req.usuario) {
            return res.status(500).json({
                ok: false,
                msg: 'No hay un usuario establecido'
            })
        }

        if(!roles.includes(req.usuario.rol)) {
            return res.status(500).json({
                ok: false,
                msg: `El usuario no tiene uno de los roles aceptados: ${roles}`
            })
        }

        next()
    }
}

module.exports = {
    esAdminRole,
    tieneRole
}