import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { username, name, email, password, rol } = req.body;
  
  try {
    // Validaciones
    if (!username || !name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        rol: rol || 'user'
      }
    });

    // No enviar la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: userWithoutPassword 
    });
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'El username o email ya existe' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'tu_secret_key', 
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      message: 'Login exitoso', 
      token, 
      user: userWithoutPassword 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        rol: true,
        createdAt: true,
        _count: {
          select: { proyectos: true }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { register, login, getUserById };