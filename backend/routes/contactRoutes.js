const express = require('express');
const router = express.Router();
const EmailService = require('../services/EmailService');

function isValidReplyEmail(s) {
    if (!s || typeof s !== 'string') return false;
    const t = s.trim();
    if (t.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

/** Keep in sync with CONTACT_TYPE_LABELS in EmailService.js */
const ENQUIRY_TYPES = [
    'general',
    'technical',
    'billing',
    'feedback',
    'schools_b2b',
    'press',
    'hkdse_content',
    'privacy_data'
];

/**
 * POST /api/contact
 * Body: { enquiryType, message, language?: 'en'|'zh', replyEmail?: string }
 */
router.post('/', async (req, res) => {
    const { enquiryType, message, language, replyEmail } = req.body || {};
    if (!ENQUIRY_TYPES.includes(enquiryType)) {
        return res.status(400).json({ error: 'Invalid enquiry type.' });
    }
    const text = typeof message === 'string' ? message.trim() : '';
    if (text.length < 10) {
        return res.status(400).json({ error: 'Message is too short. Please add a bit more detail (at least 10 characters).' });
    }
    if (text.length > 8000) {
        return res.status(400).json({ error: 'Message is too long (max 8,000 characters).' });
    }

    const trimmedForm = typeof replyEmail === 'string' ? replyEmail.trim() : '';
    let effectiveReply = null;
    if (isValidReplyEmail(trimmedForm)) {
        effectiveReply = trimmedForm;
    } else if (req.authUser?.email && isValidReplyEmail(String(req.authUser.email).trim())) {
        effectiveReply = String(req.authUser.email).trim();
    }
    if (!effectiveReply) {
        return res.status(400).json({
            error: 'Please enter a valid email address so we can reply to you.'
        });
    }

    const lang = language === 'zh' ? 'zh' : 'en';
    const result = await EmailService.sendContactEnquiry({
        enquiryType,
        message: text,
        language: lang,
        replyEmail: effectiveReply,
        authUser: req.authUser || null,
        uid: req.uid || null
    });

    if (!result.success) {
        return res.status(502).json({ error: result.error || 'Could not send message. Please try again later.' });
    }

    return res.json({ ok: true, deliveryMode: result.deliveryMode, mock: !!result.mock });
});

module.exports = router;
