require('dotenv').config();
const express = require('express');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Basic route
app.get('/', (req, res) => {
	res.send('Bus Tracking System API is running');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
