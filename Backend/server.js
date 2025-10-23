import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors({ origin: 'http://localhost:5173' })) // Vite default port
app.use(bodyParser.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// signup
app.post('/signup', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return res.status(400).json({ error: error.message })
  res.json({ user: data.user })
})

// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(400).json({ error: error.message })
  res.json({ session: data.session, user: data.user })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`))
