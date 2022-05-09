const Role = require('../models/role')
const Usuario = require('../models/usuario')

const esRoleValido = async (rol = '') => {
    const existeRol = await Role.findOne({ rol })
    if (!existeRol) {
        throw new Error('Ese rol no está registrado en la BD')
    }
}

const emailExiste = async (correo = '') => {
    const existeEmail = await Usuario.findOne({ correo })
    if (existeEmail) {
      throw new Error('El correo introducido ya está en uso.')
    }
}

const existeUsuarioPorID = async (id = '') => {
    const existeUsuario = await Usuario.findById(id)
    if (!existeUsuario) {
      throw new Error('No se encuentra usuario con el ID proporcionado.')
    }
}

module.exports = {
    esRoleValido,
    emailExiste,
    existeUsuarioPorID
}