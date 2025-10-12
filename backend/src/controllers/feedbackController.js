const Feedback = require('../models/Feedback'); 
const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or 'smtp' for production
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper functions for sending emails

// UPDATED: Now accepts the message to include in the reply
async function sendFeedbackAutoReply(userEmail, userName, message) { 
    // Template for the confirmation email
    const emailText = `
Hi ${userName || 'User'},

Thank you for reaching out to the Study Harbor team! We've successfully received your feedback.
We will review your input and respond to you as soon as possible.

---
Your Submitted Feedback:
"${message}"
---

If you have any urgent concerns, please reply to this email.

Thanks,
The Notes Portal Team
`;
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: '✅ Confirmation: Thanks for your Notes Portal feedback!',
        text: emailText // Using the enhanced template
    });
}

async function sendAdminNotification(feedback) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAILS, // Comma-separated list from .env
        subject: `🚨 NEW FEEDBACK from ${feedback.userEmail}`,
        text: `Message:\n${feedback.message}\n\nView and manage in the Admin Panel.`
    });
}

// --- Feedback Submission Endpoint ---
exports.submitFeedback = async (req, res) => {
    // Destructure message here
    const { userEmail, message, userName } = req.body; 

    if (!userEmail || !message) {
        return res.status(400).json({ msg: 'Email and message are required.' });
    }

    try {
        // 1. Store feedback in DB
        const feedback = new Feedback({ userEmail, message });
        await feedback.save();

        // 2. Trigger email notifications (Non-blocking)
        // UPDATED: Pass the message to the auto-reply function
        sendFeedbackAutoReply(userEmail, userName, message).catch(console.error); 
        sendAdminNotification(feedback).catch(console.error);

        res.status(201).json({ msg: 'Feedback submitted. Check your email for an auto-reply!' });

    } catch (err) {
        console.error('Feedback error:', err.message);
        res.status(500).send('Server error submitting feedback.');
    }
};