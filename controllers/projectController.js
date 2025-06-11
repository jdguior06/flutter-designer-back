import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getProjectsByUser = async (req, res) => {
  const { userId } = req.params

  try {
    const projects = await prisma.proyecto.findMany({
      where: { userId: parseInt(userId) },
      include: {
        screens: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        },
        user: {
          select: { id: true, name: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createProject = async (req, res) => {
  const { name, description, deviceType, userId } = req.body

  try {
    if (!name || !userId) {
      return res.status(400).json({ error: 'Nombre y userId son requeridos' })
    }

    // Crear el proyecto
    const project = await prisma.proyecto.create({
      data: {
        name,
        description,
        deviceType,
        userId: parseInt(userId)
      }
    })

    // Crear la primera pantalla automáticamente
    const defaultScreen = await prisma.screen.create({
      data: {
        name: 'Home',
        elements: [],
        proyectoId: project.id
      }
    })

    // Retornar proyecto con la pantalla incluida
    const projectWithScreens = await prisma.proyecto.findUnique({
      where: { id: project.id },
      include: {
        screens: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: { id: true, name: true, username: true }
        }
      }
    })

    res.status(201).json({
      message: 'Proyecto creado exitosamente',
      project: projectWithScreens
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getProjectById = async (req, res) => {
  const { id } = req.params

  try {
    const project = await prisma.proyecto.findUnique({
      where: { id: parseInt(id) },
      include: {
        screens: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: { id: true, name: true, username: true }
        }
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateProject = async (req, res) => {
  const { id } = req.params
  const { name, description, deviceType } = req.body

  try {
    const project = await prisma.proyecto.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(deviceType && { deviceType })
      },
      include: {
        screens: true
      }
    })

    res.json({
      message: 'Proyecto actualizado exitosamente',
      project
    })
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Proyecto no encontrado' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
}

const deleteProject = async (req, res) => {
  const { id } = req.params

  try {
    await prisma.proyecto.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: 'Proyecto eliminado correctamente' })
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Proyecto no encontrado' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
}

export {
  getProjectsByUser,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
}