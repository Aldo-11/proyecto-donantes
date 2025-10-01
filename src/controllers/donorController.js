const Donor = require('../models/Donor');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

const donorController = {
  // Login de usuario
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      Donor.findUserByUsername(username, (err, user) => {
        if (err || !user) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = generateToken(user);
        res.json({
          message: 'Login exitoso',
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // Obtener todos los donantes (solo admin)
  getAllDonors: (req, res) => {
    Donor.getAll((err, donors) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener donantes' });
      }
      res.json(donors);
    });
  },

  // Crear nuevo donante (usuarios autenticados)
  createDonor: (req, res) => {
    const { name, email, blood_type, phone } = req.body;

    // Validaciones básicas
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    // Verificar si el email ya existe
    Donor.findByEmail(email, (err, existingDonor) => {
      if (err) {
        return res.status(500).json({ error: 'Error al verificar email' });
      }

      if (existingDonor) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Crear nuevo donante
      Donor.create({ name, email, blood_type, phone }, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al crear donante' });
        }
        res.status(201).json({ 
          message: 'Donante registrado exitosamente',
          donor: { name, email, blood_type, phone }
        });
      });
    });
  }
};

module.exports = donorController;