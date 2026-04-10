const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

const uploadsDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../dev-storage/uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png']

const resolveUploadFilePath = (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('/uploads/')) {
    return null
  }

  const fileName = path.basename(imageUrl)
  const extension = path.extname(fileName).toLowerCase()

  if (!fileName || !ALLOWED_EXTENSIONS.includes(extension)) {
    return null
  }

  return path.join(uploadsDir, fileName)
}

const generateRandomString = (length = 15) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let output = ''

  for (let i = 0; i < length; i += 1) {
    output += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return output
}

router.post('/uploads', async (req, res) => {
  const { fileName, mimeType, base64Data } = req.body || {}

  if (!fileName || !mimeType || !base64Data) {
    return res.status(400).json({ error: 'Missing file data' })
  }

  const inputExtension = path.extname(fileName).toLowerCase()

  if (!ALLOWED_MIME_TYPES.includes(mimeType) || !ALLOWED_EXTENSIONS.includes(inputExtension)) {
    return res.status(400).json({ error: 'only .jpg .jpeg and .png allowed' })
  }

  try {
    const extension = inputExtension === '.png' ? '.png' : inputExtension === '.jpeg' ? '.jpeg' : '.jpg'
    const finalFileName = `${generateRandomString(15)}${extension}`
    const filePath = path.join(uploadsDir, finalFileName)
    const buffer = Buffer.from(base64Data, 'base64')

    await fs.promises.writeFile(filePath, buffer)

    res.status(201).json({
      fileName: finalFileName,
      imageUrl: `/uploads/${finalFileName}`,
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

router.delete('/uploads', async (req, res) => {
  const { imageUrl } = req.body || {}
  const filePath = resolveUploadFilePath(imageUrl)

  if (!filePath) {
    return res.status(400).json({ error: 'Invalid image URL' })
  }

  try {
    await fs.promises.unlink(filePath)
    return res.json({ message: 'Image deleted successfully' })
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.json({ message: 'Image already deleted' })
    }

    console.error('Delete upload error:', err)
    return res.status(500).json({ error: 'Failed to delete image' })
  }
})

module.exports = router