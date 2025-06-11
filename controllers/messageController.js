import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getMessages = async (req, res) => {
  const { screenId } = req.query
  
  try {
    const where = screenId ? { screenId } : {}
    
    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { timestamp: 'asc' }
    })
    
    // Convertir BigInt a string para JSON
    const messagesResponse = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toString()
    }))
    
    res.json(messagesResponse)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createMessage = async (req, res) => {
  const { text, sender, timestamp, screenId } = req.body
  
  try {
    if (!text || !sender) {
      return res.status(400).json({ error: 'Texto y sender son requeridos' })
    }
    
    const message = await prisma.chatMessage.create({
      data: {
        text,
        sender,
        timestamp: BigInt(timestamp || Date.now()),
        screenId
      }
    })
    
    const messageResponse = {
      ...message,
      timestamp: message.timestamp.toString()
    }
    
    res.status(201).json({ 
      message: 'Mensaje creado exitosamente', 
      data: messageResponse 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { getMessages, createMessage }