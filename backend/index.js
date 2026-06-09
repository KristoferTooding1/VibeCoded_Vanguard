const express = require('express');
const app = express();
const PORT = process.env.PORT || 5050;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Foundational Health-Check Route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: "operational", 
        timestamp: new Date(),
        framework: "Express on Node.js" 
    });
});

// Start the Server Engine
app.listen(PORT, () => {
    console.log(`\n🚀 QUANT SERVER INITIALIZED`);
    console.log(`📡 Listening on: http://localhost:${PORT}`);
});