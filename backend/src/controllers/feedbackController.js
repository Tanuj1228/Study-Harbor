// backend/src/controllers/feedbackController.js

const Feedback = require('../models/Feedback'); 
const nodemailer = require('nodemailer');

// UPDATED: Initialize Nodemailer transporter with SendGrid SMTP settings
const transporter = nodemailer.createTransport({
    // Use SendGrid's standard SMTP settings
    host: 'smtp.sendgrid.net', 
    port: 587, 
    secure: false, // Use STARTTLS
    auth: {
        // SendGrid requires the username 'apikey'
        user: 'apikey', 
        // We use the environment variable for the API key
        pass: process.env.SENDGRID_API_KEY 
    }
});

// Helper functions for sending emails
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
        // Sender email must be verified on SendGrid
        from: process.env.EMAIL_FROM_ADDRESS, 
        to: userEmail,
        subject: '✅ Confirmation: Thanks for your Notes Portal feedback!',
        text: emailText 
    });
}

async function sendAdminNotification(feedback) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM_ADDRESS, 
        to: process.env.ADMIN_EMAILS, 
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
        sendFeedbackAutoReply(userEmail, userName, message).catch(console.error); 
        sendAdminNotification(feedback).catch(console.error);

        res.status(201).json({ msg: 'Feedback submitted. Check your email for an auto-reply!' });

    } catch (err) {
        // Log the error to your console for troubleshooting
        console.error('Feedback submission failed with 500 error:', err.message); 
        res.status(500).send('Server error submitting feedback.');
    }
};