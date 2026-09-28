// backend/src/controllers/feedbackController.js

const Feedback = require('../models/Feedback'); 
const nodemailer = require('nodemailer');

// UPDATED: Initialize Nodemailer transporter with SendGrid SSL SMTP settings (port 465 for Cloud Hosts like Render)
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net', 
    port: 465, 
    secure: true, // Use SSL/TLS to bypass cloud host port 587 blocks
    auth: {
        user: 'apikey', 
        pass: process.env.SENDGRID_API_KEY 
    }
});

async function sendFeedbackAutoReply(userEmail, userName, message) { 
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
    
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM_ADDRESS, 
            to: userEmail,
            subject: '✅ Confirmation: Thanks for your Notes Portal feedback!',
            text: emailText 
        });
    } catch (err) {
        if (err.responseCode === 550 || (err.message && err.message.includes('Sender Identity'))) {
            console.error(`⚠️ SendGrid Error: The sender address "${process.env.EMAIL_FROM_ADDRESS}" is not verified on your SendGrid account. Please verify it at https://app.sendgrid.com/settings/sender_auth`);
        } else {
            console.error('⚠️ Auto-reply email failed:', err.message);
        }
    }
}

async function sendAdminNotification(feedback) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM_ADDRESS, 
            to: process.env.ADMIN_EMAILS, 
            subject: `🚨 NEW FEEDBACK from ${feedback.userEmail}`,
            text: `Message:\n${feedback.message}\n\nView and manage in the Admin Panel.`
        });
    } catch (err) {
        if (err.responseCode === 550 || (err.message && err.message.includes('Sender Identity'))) {
            console.error(`⚠️ SendGrid Error: The sender address "${process.env.EMAIL_FROM_ADDRESS}" is not verified on your SendGrid account. Please verify it at https://app.sendgrid.com/settings/sender_auth`);
        } else {
            console.error('⚠️ Admin notification email failed:', err.message);
        }
    }
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