const { Router } = require('express')
const Usuario = require('../models/usuario')
const bcrypt = require('bcrypt');
const { esRoleValido, emailExiste, existeUsuarioPorID } = require('../helpers/db-validators')
const { check, validationResult } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const { request, response } = require('express');
const { tieneRole } = require('../middlewares/validar-roles');
const { validarCampos } = require('../middlewares/validar-campos');
const router = Router();

router.get('/', async (req, res) => {
  const { limite = 5, desde = 0 } = req.query

  const usuarios = await Usuario.find({ estado: true })
    .skip(Number(desde))
    .limit(Number(limite))

  res.json({
    "total": usuarios.length,
    "desde": desde,
    "limite": limite,
    usuarios,
  });
});

router.post(
  '/', [
  check('correo', 'El correo no es válido').isEmail(),
  check('password', 'La contraseña debe de tener 6 o más letras').isLength({ min: 6 }),
  check('rol').custom((rol) => esRoleValido(rol)),
  check('correo').custom((correo) => emailExiste(correo)),
  validarCampos
],
  async function (req, res) {

    let { nombre, correo, password, rol } = req.body
    const date = new Date()

    //Encriptar la contraseña
    const salt = bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password, salt);

    //Crear el usuario en la BD
    try {
      const usuario = new Usuario({ nombre, correo, password, rol })
      await usuario.save()

      res.json({
        ok: true,
        usuario
      })
    } catch (error) {
      res.json({
        ok: false,
        error
      })
    }
  })

router.put(
  '/:id', [
  check('id', 'El ID no es válido').isMongoId(),
  check('id').custom((id) => existeUsuarioPorID(id)),
  check('rol').custom((rol) => esRoleValido(rol)),
  validarCampos
],
  async function (req, res) {
    const id = req.params.id
    let { _id, password, google, correo, ...resto } = req.body

    if (password) {
      const salt = bcrypt.genSaltSync(10);
      password = bcrypt.hashSync(password, salt);
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true })

    const date = new Date()

    res.json({
      ok: true,
      usuario
    })
  })

router.delete('/:id', [
  validarJWT,
  tieneRole('ADMIN_ROLE'),
  check('id', 'No es un ID válido').isMongoId(),
  check('id').custom((id) => existeUsuarioPorID(id)),
  validarCampos
],
  async (req, res = response) => {

    const { id } = req.params;
    const usuarioAutenticado = req.usuario
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

    res.json(usuario);
  })

module.exports = router;