const express = require("express");

// Encriptación de password
const bcrypt = require("bcrypt");

// Underscore para extensión de javascript.
const _ = require("underscore");

const Usuario = require("../models/usuario");

const app = express();

app.get("/", function (req, res) {
  res.json("Hello World");
});

app.get("/usuario", function (req, res) {
  let desde = parseInt(req.query.desde) || 0;

  let limite = parseInt(req.query.limite) || 5;

  Usuario.find({ estado: true }, "nombre email role estado google img")
    .skip(desde)
    .limit(limite)
    .exec((err, usuariosDb) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      Usuario.count({ estado: true }, (err, conteo) => {
        res.json({
          ok: true,
          usuario: usuariosDb,
          total: conteo,
        });
      });
    });
});

app.post("/usuario", function (req, res) {
  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role,
  });

  usuario.save((err, usuarioDb) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.status(200).json({
      ok: true,
      usuario: usuarioDb,
    });
  });
});

app.put("/usuario/:id", function (req, res) {
  const id = req.params.id;
  const body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

  Usuario.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, usuarioDb) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDb,
      });
    }
  );
});

app.delete("/usuario/:id", function (req, res) {
  const id = req.params.id;
  const body = { estado: false };

  Usuario.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, usuarioDb) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      if (!usuarioDb) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario no encontrado",
          },
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDb,
      });
    }
  );

  // Usuario.findByIdAndDelete(id, (err, usuarioDb) => {
  //   if (err) {
  //     return res.status(400).json({
  //       ok: false,
  //       err,
  //     });
  //   }

  //   if (!usuarioDb) {
  //     return res.status(400).json({
  //       ok: false,
  //       err: {
  //         message: "Usuario no encontrado",
  //       },
  //     });
  //   }

  //   res.json({
  //     ok: true,
  //     usuario: usuarioDb,
  //   });
  // });
});

module.exports = app;
