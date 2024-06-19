const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const cors = require('cors');
const path = require("path"); 

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.get("/", (req, res) => { 
    app.use(express.static(path.resolve(__dirname, "frontend", "build"))); 
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html")); 
  }); 
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
