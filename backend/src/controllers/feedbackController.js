
const Feedback = require('../models/Feedback'); // Assuming you created this model
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
async function sendFeedbackAutoReply(userEmail, userName) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: '🚀 Thanks for your Notes Portal feedback!',
        text: `Hi ${userName || 'User'},\n\nThanks for your feedback. We've received your message and will respond as soon as possible.\n\n— The Notes Portal Team`
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
    const { userEmail, message, userName } = req.body;

    if (!userEmail || !message) {
        return res.status(400).json({ msg: 'Email and message are required.' });
    }

    try {
        // 1. Store feedback in DB
        const feedback = new Feedback({ userEmail, message });
        await feedback.save();

        // 2. Trigger email notifications (Non-blocking)
        sendFeedbackAutoReply(userEmail, userName).catch(console.error);
        sendAdminNotification(feedback).catch(console.error);

        res.status(201).json({ msg: 'Feedback submitted. Check your email for an auto-reply!' });

    } catch (err) {
        console.error('Feedback error:', err.message);
        res.status(500).send('Server error submitting feedback.');
    }
};