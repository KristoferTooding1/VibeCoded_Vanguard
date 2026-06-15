const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5050;

// 1. Enable Global CORS (Allows your React frontend to hit these endpoints safely)
app.use(cors());

// 2. Middleware to parse incoming JSON payloads
app.use(express.json());

// Welcome Route
app.get('/', (req, res) => {
    res.send('<h1>Vanguard Investing API Gateway</h1><p>Server status: Active</p>');
});

// Health-Check Route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: "operational", 
        timestamp: new Date(),
        framework: "Express on Node.js" 
    });
});

// 3. SECURE CALCULATION ENDPOINT
app.post('/api/calculate', (req, res) => {
    try {
        // Pull numeric parameters from the React HTTP request body
        const { initialDeposit, monthlyContribution, annualReturn, years } = req.body;

        const P = parseFloat(initialDeposit) || 0;
        const PMT = parseFloat(monthlyContribution) || 0;
        const r = (parseFloat(annualReturn) || 0) / 100;
        const t = parseInt(years) || 0;
        const n = 12;

        let totalPortfolio = P;
        let totalInvestedPrincipal = P;

        if (t > 0) {
            const totalMonths = t * n;
            const monthlyRate = r / n;

            if (r === 0) {
                totalPortfolio = P + (PMT * totalMonths);
                totalInvestedPrincipal = P + (PMT * totalMonths);
            } else {
                const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
                totalPortfolio = (P * Math.pow(1 + monthlyRate, totalMonths - 1)) + 
                                 (PMT * (compoundFactor - 1) / monthlyRate);
                totalInvestedPrincipal = P + (PMT * totalMonths);
            }
        }

        const totalCompoundedInterest = Math.max(0, totalPortfolio - totalInvestedPrincipal);

        // Return pure, unformatted numeric data. Let the frontend handle currency localization.
        res.json({
            totalValue: roundToCent(totalPortfolio),
            totalPrincipal: roundToCent(totalInvestedPrincipal),
            totalInterest: roundToCent(totalCompoundedInterest)
        });

    } catch (error) {
        res.status(500).json({ error: "Internal server compilation error during calculation execution." });
    }
});

// Utility helper to prevent long decimal floating-point errors
function roundToCent(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

app.listen(PORT, () => {
    console.log(`\n🚀 QUANT SERVER INITIALIZED`);
    console.log(`📡 Listening on: http://localhost:${PORT}`);
});