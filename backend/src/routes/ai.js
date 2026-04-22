const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
// Shared helper: call NVIDIA NIM or return null on failure
// ─────────────────────────────────────────────────────────────
async function callNvidia(messages, { temperature = 0.5, max_tokens = 512 } = {}) {
  const NVIDIA_API_KEY  = process.env.NVIDIA_API_KEY;
  const NVIDIA_BASE_URL = process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const MODEL           = process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

  if (!NVIDIA_API_KEY) return null; // signal: no key

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, messages, temperature, top_p: 0.9, max_tokens, stream: false }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('NVIDIA API Error:', errText);
    return null;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

// ─────────────────────────────────────────────────────────────
// Local fallback chatbot (rule-based) — works without API key
// ─────────────────────────────────────────────────────────────
function localChatFallback(message) {
  const msg = message.toLowerCase();

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('kumusta'))
    return 'Hello po! Ako ang CRPS Assistant ng Barangay Management System ng Mamburao, Occidental Mindoro. Paano kita matutulungan?';

  if (msg.includes('resident') || msg.includes('profile'))
    return 'Ang CRPS ay may Residents module na nagpapahintulot sa inyo na mag-profile ng mga residente kasama ang kanilang personal na impormasyon, katayuan sa pamumuhay, at espesyal na kategorya (Senior, PWD, 4Ps, etc). Pumunta sa menu → Inhabitants → Residents.';

  if (msg.includes('certification') || msg.includes('clearance') || msg.includes('indigency'))
    return 'Para mag-isyu ng Barangay Clearance o Certificate of Indigency, pumunta sa Certifications module. Ang DSS (Decision Support System) ay awtomatikong nag-e-evaluate ng eligibility ng bawat kahilingan.';

  if (msg.includes('case') || msg.includes('katarungang') || msg.includes('dispute'))
    return 'Ang Cases module ay para sa Katarungang Pambarangay (KP) cases. Makikita doon ang lahat ng filed cases, hearing schedules, at settlement records.';

  if (msg.includes('offline') || msg.includes('internet') || msg.includes('sync'))
    return 'Oo, ang CRPS ay offline-first! Kahit walang internet, kaya mong mag-login at mag-input ng data. Ang mga datos ay nise-save sa local queue at awtomatikong sine-sync sa server kapag bumalik na ang koneksyon.';

  if (msg.includes('blockchain') || msg.includes('audit'))
    return 'Ang CRPS ay may Blockchain Audit Trail. Bawat aksyon sa sistema (login, pagdaragdag ng residente, pag-isyu ng sertipiko) ay nire-record sa isang tamper-proof chain para sa transparency at accountability.';

  if (msg.includes('drrm') || msg.includes('gad') || msg.includes('disaster'))
    return 'Ang DRRM/GAD module ay para sa Disaster Risk Reduction and Management Plans at Gender and Development Programs ng bawat barangay.';

  if (msg.includes('report') || msg.includes('analytics') || msg.includes('dashboard'))
    return 'Ang Reports at AI Analytics module ay nagbibigay ng real-time statistics, risk scoring per barangay, at NVIDIA Llama 3.3 AI-powered insights para sa LGU governance decisions.';

  if (msg.includes('tanod') || msg.includes('patrol') || msg.includes('tracking'))
    return 'Ang Live Patrol Tracking module ay nagpapakita ng real-time na lokasyon ng mga Tanod sa mapa. Ang mga Tanod ay makakapag-update ng kanilang posisyon gamit ang GPS.';

  if (msg.includes('user') || msg.includes('account') || msg.includes('register') || msg.includes('login'))
    return 'Para mag-register ng bagong account, pumunta sa /register page. Ang mga role ay: Admin (full access), Secretary (barangay-level access), at Tanod (patrol access). Ang admin ang nag-a-approve ng mga bagong account.';

  if (msg.includes('password') || msg.includes('demo'))
    return 'Ang demo password para sa lahat ng built-in accounts ay: admin123\n\nAdmin: admin@barangay.gov.ph\nSecretary: secretary@barangay.gov.ph\nTanod: tanod@barangay.gov.ph';

  // Generic fallback
  return 'Pasensya na, ngayon ay offline mode lang ang aking sagot. Para sa mas detalyadong tugon, siguraduhing may koneksyon sa internet para magamit ang NVIDIA AI. Pero pwede mo akong tanungin tungkol sa: mga residente, certifications, cases, offline sync, blockchain audit, DRRM, reports, o patrol tracking.';
}

/**
 * POST /api/ai/analyze
 * Proxies analytics data to NVIDIA NIM API and returns LLM-generated insight.
 * Falls back to local rule-based analysis if no API key is configured.
 */
router.post('/analyze', authenticate, async (req, res) => {
  const { risks = [], repeatOffenders = 0, totalResidents = 0, totalCases = 0 } = req.body;

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
    const content = await callNvidia(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { temperature: 0.2, max_tokens: 1024 }
    );

    if (!content) {
      // No API key — return 503 so frontend knows to use its own local fallback
      return res.status(503).json({ error: 'NVIDIA API key not configured. The frontend local engine will be used instead.' });
    }

    return res.json({ analysis: content, model: process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct', timestamp: new Date().toISOString() });

  } catch (err) {
    console.error('AI Analyze Route Error:', err);
    return res.status(500).json({ error: 'Server error while contacting AI service.', details: err.message });
  }
});

/**
 * POST /api/ai/chat
 * Handles conversational queries for the CRPS Chatbot.
 * Falls back gracefully to a local rule-based chatbot if no NVIDIA API key is set.
 */
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required.' });

  const systemPrompt = `You are the AI Assistant for the CRPS (Centralized Residents Profiling System), used by barangays in Mamburao, Occidental Mindoro. You are helpful, professional, and bilingual (English/Filipino). Answer any question the user has, but maintain your persona as the CRPS Assistant. CRPS handles resident profiling, cases, certifications, offline-first sync, and Blockchain audit trails. Keep responses brief and conversational.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: message }
  ];

  try {
    // Try NVIDIA NIM first
    const content = await callNvidia(messages, { temperature: 0.5, max_tokens: 512 });

    if (content) {
      return res.json({ reply: content, source: 'nvidia' });
    }

    // ── No API key configured: use local rule-based fallback ──
    console.log('[AI Chat] NVIDIA API key not set — using local fallback chatbot.');
    const fallbackReply = localChatFallback(message);
    return res.json({ reply: fallbackReply, source: 'local', offline: true });

  } catch (err) {
    console.error('Chat Route Error:', err);
    // Even on crash, serve local fallback so the chatbot never goes dark
    const fallbackReply = localChatFallback(message);
    return res.json({ reply: fallbackReply, source: 'local', offline: true });
  }
});

module.exports = router;
