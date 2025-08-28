/* eslint-disable no-undef */
// server.js
import express, { json } from 'express';
import cors from 'cors';
import path from "path";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"; 
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

const __dirname = path.resolve();

const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 registration requests per windowMs
  message: "Too many requests, please try again later.",
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey)

const app = express();
app.use(bodyParser.json());
app.use(limiter);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", "data:"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(cors());
app.use(json());

app.use(express.static(path.join(__dirname, "dist")));

app.use('/api/', limiter);

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const cacheMiddleware = (ttl) => (req, res, next) => {
  const cacheKey = req.originalUrl;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Returning cached data for ${cacheKey}`);
    return res.status(200).json({ tours: cachedData });
  }
  res.locals.ttl = ttl;
  res.locals.cacheKey = cacheKey;
  next();
};

//AUTHENTICATION
app.post("/api/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, password, phone, country, role")
      .eq("email", email);

    if (error) {
      console.error("Error fetching user from Supabase:", error);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name, role: user.role, country: user.country, phone: user.phone }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful!",
      token,
    });
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

app.post("/api/register", authLimiter, async (req, res) => {
  const { name, country, phone, email, password } = req.body;

  if (!name || !country || !phone || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const salt = await bcrypt.genSalt(12); 
    const hashedPassword = await bcrypt.hash(password, salt);

    const { error } = await supabase
      .from("users")
      .insert([{ name, country, phone, email, password: hashedPassword }]);

    if (error) {
      console.error("Error inserting data into Supabase:", error);
      return res.status(500).json({ message: "Failed to register user." });
    }

    res.status(200).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error in /register:", error);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

// CONTACT
app.post('/api/contact', (req, res) => {
  // Extract the form data from the request body
  const { name, email, phone, question } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !phone || !question) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Log the received data to the console (you can also write it to a file or database)
  console.log('Contact Form Submitted:');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Phone:', phone);
  console.log('Question:', question);


  // Send a success response
  res.status(200).json({ message: 'Your message has been received!' });
});

// USER

app.get('/api/user/:userId', cacheMiddleware(120),async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  res.status(200).json({ message: 'test' });
});

app.put('/api/user/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, country } = req.body;

  if(req.body.userId || req.body.role || req.body.email || req.body.password) {
    return res.status(400).json({ message: 'Invalid Input' });
  }
  
  if (!id || !name || !phone || !country) {
    console.log('Invalid input:', { id, name, phone, country });
    return res.status(400).json({ message: 'User ID and all fields are required' });
  }

  try {
    console.log('Attempting to update user:', { id, name, phone, country });
    const updates = { name: name, phone: phone, country: country };
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('*');

    if (error) {
      console.error('Error updating user:', error);
      return res.status(400).json({ message: 'Failed to update user', error });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: data[0].id, email: data[0].email, name: data[0].name, role: data[0].role, country: data[0].country, phone: data[0].phone }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: 'User updated successfully',
      token: token,
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

//TOURS

app.get('/api/tours/user/:userId', cacheMiddleware(120), async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching tours:', error);
      return res.status(500).json({ message: 'Error fetching tours', error });
    }

    return res.status(200).json({ tours: data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

app.get('/api/tours/top', cacheMiddleware(120), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tours')
      .select('*, users(name)') 
      //.order('rating', { ascending: false }) 
      .limit(10);

    if (error) {
      console.error('Error fetching top tours:', error);
      return res.status(500).json({ message: 'Error fetching top tours', error });
    }

    cache.set(res.locals.cacheKey, data, 120);

    return res.status(200).json({ tours: data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});


// GUIDES

app.get('/api/guides/top', cacheMiddleware(120), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*, users(name)') 
      .order('ratings', { ascending: false }) 
      .limit(10);

    if (error) {
      console.error('Error fetching top guides:', error);
      return res.status(500).json({ message: 'Error fetching top guides', error });
    }

    cache.set(res.locals.cacheKey, data, 120);

    return res.status(200).json({ tours: data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

app.get('/api/guides/:userId', cacheMiddleware(120), async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('guides')
      .select('*, users(name, phone)') 
      .eq('user_id', userId)
      .limit(10);

    if (error) {
      console.error('Error fetching top guides:', error);
      return res.status(500).json({ message: 'Error fetching top guides', error });
    }

    cache.set(res.locals.cacheKey, data, 120);

    return res.status(200).json({ tours: data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

//GUIDEPAGE
app.get("/api/guide/:user_id/information", async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const guideResponse = await supabase
    .from('guides')
    .select('*, users(name)') 
    .eq('user_id', user_id);
    
    const toursResponse = await supabase
      .from("tours")
      .select("*")
      .eq("user_id", user_id);
  
    res.json({
      guide: guideResponse.data,
      tours: toursResponse.data,
    });
  } catch (error) {
    console.log('Error fetching guide data:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
