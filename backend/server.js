const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection logic with explicit error checking
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/employeeDB";

mongoose.connect(mongoURI)
    .then(() => console.log(">>> SUCCESS: Connected smoothly to MongoDB inside Docker container!"))
    .catch((err) => {
        console.error(">>> ERROR: Database link failed. Check Docker Desktop status.");
        console.error(err);
    });

// Employee Database Schema Definition
const EmployeeSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    salary: { type: Number, required: true },
    email: { type: String, required: true }
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

// API Routes

// 1. Create an Employee
app.post('/api/employees', async (req, res) => {
    try {
        const checkExisting = await Employee.findOne({ employeeId: req.body.employeeId });
        if (checkExisting) {
            return res.status(400).json({ message: "An employee with this ID already exists." });
        }
        const newEmployee = new Employee(req.body);
        const saved = await newEmployee.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 2. View All Employees
app.get('/api/employees', async (req, res) => {
    try {
        const list = await Employee.find();
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Edit Employee Details
app.put('/api/employees/:employeeId', async (req, res) => {
    try {
        const updated = await Employee.findOneAndUpdate(
            { employeeId: req.params.employeeId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: "Employee record not found." });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 4. Remove Employee
app.delete('/api/employees/:employeeId', async (req, res) => {
    try {
        const deleted = await Employee.findOneAndDelete({ employeeId: req.params.employeeId });
        if (!deleted) return res.status(404).json({ message: "Employee record not found." });
        res.json({ message: "Employee deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`>>> SUCCESS: API Server cleanly running on port ${PORT}`));