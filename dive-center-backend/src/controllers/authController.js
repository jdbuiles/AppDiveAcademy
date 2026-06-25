const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    // Buscar usuario por correo electrónico
    const userRes = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    const usuario = userRes.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar la contraseña con el hash de la BD
    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar el JWT incluyendo el ID y el ROL del Enum ('Administrador' o 'Instructor')
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Expiración recomendada para jornadas laborales
    );

    res.status(200).json({
      mensaje: 'Autenticación exitosa',
      token,
      usuario: { nombre: usuario.nombre, rol: usuario.rol }
    });

  } catch (error) {
    next(error);
  }
};
