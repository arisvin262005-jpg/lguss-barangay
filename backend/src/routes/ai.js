const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/ai/analyze
 * Proxies analytics data to NVIDIA NIM API (meta/llama-3.3-70b-instruct)
 * and returns LLM-generated insight. API key stays server-side.
 */
router.post('/analyze', authenticate, async (req, res) => {
  const { risks = [], repeatOffenders = 0, totalResidents = 0, totalCases = 0 } = req.body;

  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  const NVIDIA_BASE_URL = process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

  if (!NVIDIA_API_KEY) {
    return res.status(503).json({ error: 'NVIDIA API key not configured on server.' });
  }

  // Build a structured prompt from the analytics payload
  const topRisks = risks.slice(0, 5).map(r =>
    `  - ${r.barangay}: ${r.caseCount} cases, Risk Score ${r.riskScore} (${r.level})`
  ).join('\n');

  const systemPrompt = `You are an expert AI analyst for the Local Government Unit Support System (LGUSS) of Mamburao, Occidental Mindoro, Philippines. You analyze Katarungang Pambarangay case data, resident demographics, and patrol risk scores to provide actionable governance recommendations. Speak in a professional, concise tone. Format your response with clear sections using emojis as headers. Limit to 5-7 bullet points total.`;

  const userPrompt = `Analyze the following barangay crime and case data for Mamburao, Occ. Mindoro and provide:
1. A brief 1-sentence executive summary
2. Top 2-3 risk findings based on the data
3. 2-3 specific actionable recommendations for the LGU

DATA SNAPSHOT:
- Total Residents Profiled: ${totalResidents}
- Total KP Cases in System: ${totalCases}
- Repeat Offenders Detected: ${repeatOffenders}
- Top Barangays by Risk Score:
${topRisks || '  - No barangay data available yet.'}

Respond concisely and professionally.`;

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('NVIDIA API Error:', errText);
      return res.status(502).json({ error: 'NVIDIA API request failed. Check server logs.' });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || 'No response generated.';

    return res.json({
      analysis: content,
      model: MODEL,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error('AI Route Error:', err);
    return res.status(500).json({ error: 'Server error while contacting AI service.' });
  }
});

module.exports = router;
