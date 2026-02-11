const express = require('express');
const router = express.Router();
const MathsIntentRouter = require('../../services/maths/MathsIntentRouter');

// This will be integrated into the main chat endpoint
// For now, we export the router logic for use in chatRoutes.js

module.exports = {
    classifyIntent: async (message, history) => {
        return await MathsIntentRouter.classify(message, history);
    }
};
