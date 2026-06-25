const jwt = require('jsonwebtoken');

const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Validar existencia del encabezado Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Acceso denegado', 
        detalles: 'Token no provisto o formato inválido. Use "Bearer [Token]"' 
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verificar validez y expiración del token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Inyectar los datos decodificados en el objeto request
      req.usuario = decoded; 

      // Validar si el rol del token coincide con los roles permitidos
      if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({ 
          error: 'Permisos insuficientes', 
          detalles: `El rol "${req.usuario.rol}" no tiene autorización para este recurso.` 
        });
      }

      next(); // El usuario es válido, continuar al controlador
    } catch (error) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        detalles: 'El token ha expirado o es corrupto.' 
      });
    }
  };
};

module.exports = verificarRol;
