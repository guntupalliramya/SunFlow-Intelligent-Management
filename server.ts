import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini if key is provided
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.error('Failed to initialize Gemini client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SunFlow AI Server',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Secure Backend AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, role, userName, contextSummary } = req.body;
    const userMessage = messages?.[messages.length - 1]?.content || '';

    // System prompt with ERP context and role awareness
    const systemPrompt = `You are "SunFlow AI Assistant", the intelligent solar ERP copilot for SunPower Solutions, a premier rooftop solar installation company.
Current logged-in user: ${userName || 'Team Member'} (Role: ${role || 'admin'}).
Live System Context:
- Total Revenue: ₹${contextSummary?.totalRevenue?.toLocaleString() || '0'}
- Total Profit: ₹${contextSummary?.totalProfit?.toLocaleString() || '0'}
- Confirmed Orders: ${contextSummary?.confirmedOrders || 0}
- Installations Pending: ${contextSummary?.installationsPending || 0}
- Low Stock Items: ${contextSummary?.lowStockCount || 0}
- Open Service Tickets: ${contextSummary?.openTicketsCount || 0}

Guidelines:
1. Always base answers on facts and standard solar engineering standards (Voc, Isc, MPPT, PM Surya Ghar Muft Bijli Yojana subsidy, HDG structure, earthing < 2.5 ohms).
2. Never invent fake customer data.
3. Be professional, concise, and structured with markdown bullet points and emojis.`;

    // 1. If OpenRouter API key is set, call OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'https://sunflow.ai',
            'X-Title': 'SunFlow AI Solar ERP',
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((m: any) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (orResponse.ok) {
          const orData = await orResponse.json();
          const reply = orData?.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({ reply, source: 'openrouter' });
          }
        }
      } catch (err) {
        console.error('OpenRouter request error:', err);
      }
    }

    // 2. If Gemini API is configured
    if (geminiClient) {
      try {
        const response = await geminiClient.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `${systemPrompt}\n\nUser Question: ${userMessage}`,
        });

        if (response.text) {
          return res.json({ reply: response.text, source: 'gemini' });
        }
      } catch (err) {
        console.error('Gemini request error:', err);
      }
    }

    // 3. Fallback response indicating server status
    return res.json({
      reply: null,
      message: 'External AI keys not configured on server; frontend domain engine used.',
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process AI chat request' });
  }
});

// Mount Vite middleware for dev server
async function startServer() {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
  console.log(`SunFlow AI Server running at http://localhost:${port}`);
});
}

startServer();
