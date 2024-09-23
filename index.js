const express = require('express')
require('dotenv').config()
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Entry = require('./models/entry')
const { errorHandler } = require('./errorHandler')


const mongoURL = process.env.MONGODB_URI

mongoose.connect(mongoURL).then(() => {
  console.log('Connected to mongoDB')
}).catch((e) => {
  console.log(e)
})



app.use(express.static('dist'))
app.use(cors())
app.use(express.json())


morgan.token('body', (req) => req.body ? JSON.stringify(req.body) : null)
const postLog = morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: (req) => req.method !== 'POST'
})
const restLog = morgan(':method :url :status :res[content-length] - :response-time ms', {
  skip: (req) => req.method === 'POST'
})

app.use(postLog)
app.use(restLog)


const checkMatch = async (id) => {
  const match = await Entry.findById(id)
  return match


}

const checkIntegrity = async (contact) => {
  const checkResult = []
  if (!contact.name) checkResult.push('No name provided')
  if (!contact.number) checkResult.push('No number provided')

  const found = await Entry.findOne({ name: contact.name })
  if (found) {
    checkResult.push('Name already exists')
  }

  return checkResult


}

const baseURL = '/api'

app.get(`${baseURL}/persons`, (req, res, next) => {
  Entry.find({}).then((data) => {
    res.status(200).json(data)
  }).catch((e) => {
    next(e)
  })

})

app.get('/info', async (req, res, next) => {


  try {
    const entries = await Entry.find({})
    const to_send = `Phonebook has info for ${entries.length} people <br>${new Date()}`
    res.status(200).send(to_send)
  } catch(e) {
    next(e)
  }


})

app.get(`${baseURL}/persons/:id`, async (req, res, next) => {
  try {
    const id = req.params.id
    const match = await checkMatch(id)
    if (match) {
      return res.status(200).json(match)
    }
    res.status(404).end()
  } catch(e) {
    next(e)
  }


})

app.delete(`${baseURL}/persons/:id`, async (req, res, next) => {
  try {
    const id = req.params.id
    const match = await checkMatch(id)
    if (match) {
      Entry.findByIdAndDelete(match.id).then(() => {
        return res.status(200).json(match)
      }).catch((e) => {
        next(e)
      })

    } else {
      return res.status(404).end()
    }
  } catch (e) {
    next(e)
  }



})

app.post((`${baseURL}/persons`), async (req, res, next) => {

  try {
    const body = req.body
    console.log(body)
    if (!body) {
      return res.status(400).json({ error: 'Request has no content' })
    }

    const errors = await checkIntegrity(body)
    console.log(errors)

    if (errors.length > 0) {
      return res.status(400).json({ error: errors })
    }
    const newContact = new Entry({
      name: body.name,
      number: body.number
    })

    newContact.save().then((savedContact) => {
      res.status(201).json(savedContact)
    }).catch((e) => {
      console.log(e)
      next(e)

    })
  } catch (e) {
    next(e)
  }


})

app.put(`${baseURL}/persons/:id`, async (req, res, next) => {
  try {
    const body = req.body
    const id = req.params.id
    if (!body) {
      return res.status(400).json({ error: 'Request has no content' })
    }

    const User = await checkMatch(id)
    if (!User) {
      return res.status(404).send({ error: 'User not found' })
    }
    User.number = body.number
    User.save()
    res.status(200).send(body)


  } catch (e) {
    next(e)
  }
})


app.use(errorHandler)



const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log('Running on port', PORT)
})

