const path = require('node:path')
const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  studentId: { type: String, required: true, unique: true, trim: true },
  department: { type: String, required: true, trim: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  fatherName: { type: String, required: true, trim: true },
  motherName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  arrears: { type: Number, required: true, min: 0 },
  companies: { type: [String], required: true, validate: (companies) => companies.length === 4 },
  registeredAt: { type: Date, default: Date.now },
})

const Registration = mongoose.model('Registration', registrationSchema)

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.get('/api/registrations', async (_request, response, next) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 }).lean()
    response.json(registrations)
  } catch (error) {
    next(error)
  }
})

app.post('/api/registrations', async (request, response, next) => {
  try {
    if (Number(request.body.arrears) !== 0) {
      return response.status(400).json({ message: 'Students must have zero standing arrears.' })
    }
    if (!Array.isArray(request.body.companies) || request.body.companies.length !== 4) {
      return response.status(400).json({ message: 'Choose exactly four companies.' })
    }

    const registration = await Registration.create(request.body)
    response.status(201).json(registration)
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'A registration already exists for this student ID or email.' })
    }
    if (error.name === 'ValidationError') {
      return response.status(400).json({ message: error.message })
    }
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ message: 'An unexpected server error occurred.' })
})

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set in server/.env')
  process.exitCode = 1
} else {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      app.listen(port, () => console.log(`Registration API listening at http://localhost:${port}`))
    })
    .catch((error) => {
      console.error('Could not connect to MongoDB:', error.message)
      process.exitCode = 1
    })
}