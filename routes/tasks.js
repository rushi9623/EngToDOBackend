const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Simple test route
router.get('/test', (req, res) => {
    res.json({ message: 'Routes are working!' });
});

// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tasks'
        });
    }
});

// Create a new task
router.post('/task', async (req, res) => {
    try {
        const { title, assignedTo, description, priority, status } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }
        
        const newTask = new Task({
            title: title.trim(),
            assignedTo: assignedTo ? assignedTo.trim() : 'Unassigned',
            description: description ? description.trim() : '',
            priority: priority || 'medium',
            status: status || 'pending'
        });

        const savedTask = await newTask.save();
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: savedTask
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating task'
        });
    }
});

// Update a task by ID
router.put('/task/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, assignedTo, description, priority, status } = req.body;

        // check if task exists
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Validate required fields
        if (title !== undefined && (title.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }

        // Update task fields
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo.trim() || 'Unassigned';
        if (description !== undefined) updateData.description = description.trim();
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });

    } catch (error) {
        console.error('Error updating task:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating task'
        });
    }
});

// Delete a task by ID
router.delete('/task/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        res.json({
            success: true,
            message: 'Task deleted successfully',
            data: deletedTask
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error deleting task'
        });
    }
});

module.exports = router;