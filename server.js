const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());   // incoming json parse krna

// MongoDB connection
connectDB();

// Health check route to test database connection
app.get('/api/health', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        res.json({
            server: 'running',
            database: states[dbState],
            dbName: mongoose.connection.name || 'not connected',
            port: PORT
        });
    } catch (error) {
        res.status(500).json({
            server: 'running',
            database: 'error',
            error: error.message
        });
    }
});

// Debug the routes import
console.log('Attempting to load routes...');
try {
    const tasksRouter = require('./routes/tasks');
    console.log('Routes loaded successfully:', typeof tasksRouter);
    console.log('Is function?', typeof tasksRouter === 'function');
    
    // Routes
    app.use('/api', tasksRouter);
    console.log('Routes registered successfully');
} catch (error) {
    console.error('Error loading routes:', error);
    process.exit(1);
}

app.get('/', (req, res) => {
    res.json({
        message: 'Todo API is running',
        status: 'OK'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'something went wrong',
    });
});

// handle 404 errors
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app; // Export the app for testing purposes