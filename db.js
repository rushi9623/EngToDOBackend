const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase');
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Connected to database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1); // Exit process with failure
    } 
};

module.exports = connectDB;