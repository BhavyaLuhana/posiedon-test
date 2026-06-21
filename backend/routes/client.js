const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Submit client form
router.post('/submit', async (req, res) => {
  try {
    const clientData = req.body;
    
    // Check if client already exists with same PAN, Aadhar, Email, or Phone
    const existingClient = await Client.findOne({
      $or: [
        { panCardNumber: clientData.panCardNumber },
        { aadharNumber: clientData.aadharNumber },
        { email: clientData.email },
        { phone: clientData.phone }
      ]
    });
    
    if (existingClient) {
      // Decrypt to show friendly message
      const decrypted = existingClient.decryptFields();
      return res.status(400).json({
        success: false,
        message: 'You have already submitted your details. Our team will contact you shortly.',
        alreadySubmitted: true,
        submittedAt: existingClient.submittedAt
      });
    }
    
    // Create new client
    const client = new Client(clientData);
    await client.save();
    
    res.status(201).json({
      success: true,
      message: '✅ Form submitted successfully! We will contact you within 24-48 hours.',
      data: { id: client._id, submittedAt: client.submittedAt }
    });
  } catch (error) {
    console.error('Error submitting client form:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Please check your form inputs',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get all clients (Admin only)
router.get('/all', async (req, res) => {
  try {
    const clients = await Client.find()
      .sort({ submittedAt: -1 })
      .select('-__v'); // Exclude version field
    
    // Decrypt sensitive data for admin view
    const decryptedClients = clients.map(client => client.decryptFields());
    
    res.json({
      success: true,
      count: decryptedClients.length,
      data: decryptedClients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get client by ID (Admin only)
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    const decrypted = client.decryptFields();
    res.json({
      success: true,
      data: decrypted
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update client status (Admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = { status };
    if (status === 'Contacted') {
      updateData.contactedAt = new Date();
    }
    if (notes) {
      updateData.notes = notes;
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    const decrypted = client.decryptFields();
    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: decrypted
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get statistics (Admin only)
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Client.countDocuments();
    const pending = await Client.countDocuments({ status: 'Pending' });
    const contacted = await Client.countDocuments({ status: 'Contacted' });
    const approved = await Client.countDocuments({ status: 'Approved' });
    const rejected = await Client.countDocuments({ status: 'Rejected' });
    
    // Get today's submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = await Client.countDocuments({
      submittedAt: { $gte: today }
    });
    
    // Get last 7 days submissions
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weekSubmissions = await Client.countDocuments({
      submittedAt: { $gte: lastWeek }
    });
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        contacted,
        approved,
        rejected,
        todaySubmissions,
        weekSubmissions
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;