const express = require('express');
const app = require('../eternova-backend/server.js');

app.get('/api/env-debug', (req, res) => {
    res.json({
        hasUrl: !!process.env.SUPABASE_URL,
        urlLength: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.length : 0,
        urlValue: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 10) + '...' : null,
        hasAnon: !!process.env.SUPABASE_ANON_KEY,
        hasService: !!process.env.SUPABASE_SERVICE_KEY,
        envKeys: Object.keys(process.env).filter(k => k.includes('SUPA'))
    });
});

module.exports = app;
