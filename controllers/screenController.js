import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createScreen = async (req, res) => {
  const { name, elements = [], proyectoId } = req.body
  
  try {
    if (!name || !proyectoId) {
      return res.status(400).json({ error: 'Nombre y proyectoId son requeridos' })
    }
    
    const screen = await prisma.screen.create({
      data: {
        name,
        elements,
        proyectoId: parseInt(proyectoId)
      }
    })
    
    res.status(201).json({ 
      message: 'Screen creada exitosamente', 
      screen 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getScreenById = async (req, res) => {
  const { id } = req.params
  
  try {
    const screen = await prisma.screen.findUnique({
      where: { id },
      include: {
        proyecto: {
          select: { id: true, name: true, deviceType: true }
        }
      }
    })
    
    if (!screen) {
      return res.status(404).json({ error: 'Screen no encontrada' })
    }
    
    res.json(screen)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateScreen = async (req, res) => {
  const { id } = req.params
  const { name, elements } = req.body
  
  try {
    const screen = await prisma.screen.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(elements && { elements })
      }
    })
    
    res.json({ 
      message: 'Screen actualizada exitosamente', 
      screen 
    })
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Screen no encontrada' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
}

const deleteScreen = async (req, res) => {
  const { id } = req.params
  
  try {
    await prisma.screen.delete({
      where: { id }
    })
    
    res.json({ message: 'Screen eliminada correctamente' })
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Screen no encontrada' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
}

export { createScreen, getScreenById, updateScreen, deleteScreen }