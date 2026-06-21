const express = require('express');
const cors = require('cors');
const supabase = require('./db');
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

// 4. PERSIST CALCULATION TO POSTGRESQL DATABASE
app.post('/api/save-calculation', async (req, res) => {
    try {
        const { 
            initialDeposit, 
            monthlyContribution, 
            annualReturn, 
            years, 
            totalValue, 
            totalPrincipal, 
            totalInterest 
        } = req.body;

        // Perform asynchronous insert transaction into PostgreSQL via Supabase client
        const { data, error } = await supabase
            .from('calculations')
            .insert([
                {
                    initial_deposit: parseFloat(initialDeposit) || 0,
                    monthly_contribution: parseFloat(monthlyContribution) || 0,
                    annual_return: parseFloat(annualReturn) || 0,
                    years: parseInt(years) || 0,
                    total_value: parseFloat(totalValue) || 0,
                    total_principal: parseFloat(totalPrincipal) || 0,
                    total_interest: parseFloat(totalInterest) || 0
                }
            ])
            .select(); // Returns the newly created row packet

        if (error) {
            throw error;
        }

        // Return affirmative status payload back to React
        res.status(201).json({
            success: true,
            message: "Data matrix successfully persisted to PostgreSQL storage matrix.",
            record: data[0]
        });

    } catch (error) {
        console.error("DATABASE ACCESS LAYER INTERRUPTION:", error.message);
        res.status(500).json({ 
            error: "Failed to persist calculations to cloud infrastructure.",
            details: error.message 
        });
    }
});

// Utility helper to prevent long decimal floating-point errors
function roundToCent(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

app.listen(PORT, () => {
    console.log(`\n QUANT SERVER INITIALIZED`);
    console.log(` Listening on: http://localhost:${PORT}`);
});