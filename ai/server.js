const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT } = require('./prompts/system');

const app = express();
const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json());

// Initialize Gemini
let model = null;
if (GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('Gemini AI initialized');
} else {
  console.log('No GEMINI_API_KEY set - using fallback responses');
}

// Conversation history per user
const conversations = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dinex-ai', geminiConnected: !!model });
});

// ─── FALLBACK RESPONSES (when no Gemini key) ─────────────────────────────────

function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('ahla') || msg.includes('hello') || msg.includes('salam') || msg.includes('hi')) {
    return {
      intent: 'GREETING',
      message: 'Ahla bik fi Dinex! 👋 Ena el assistant mta3ek, na3mel lik kol chay thebb. Nheb nchouflek el balance? Wala tab3ath flous? 9ouli chnoua thebb!',
      action: null,
      needsConfirmation: false
    };
  }

  // History check BEFORE balance (since "win sraft flousi" contains "flous")
  if (msg.includes('historique') || msg.includes('transactions') || msg.includes('win sraft') || msg.includes('sraft')) {
    return {
      intent: 'TRANSACTION_HISTORY',
      message: 'Haya nchoufou el transactions mta3ek... 📋',
      action: { type: 'get_transactions', params: {} },
      needsConfirmation: false
    };
  }

  // Send money check
  if (msg.includes('ab3ath') || msg.includes('nab3ath') || msg.includes('b3ath') || msg.includes('transfer') || msg.includes('nheb nab3ath')) {
    const amountMatch = msg.match(/(\d+)\s*(dt|dinar|d)/i) || msg.match(/(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[1]) : null;
    const phoneMatch = msg.match(/(\d{8})/);
    const phone = phoneMatch ? phoneMatch[1] : null;

    if (amount && phone) {
      return {
        intent: 'SEND_MONEY',
        message: `Tayeb, bech nab3ath ${amount} dinar lel numero ${phone}. Mouwafe9? ✅`,
        action: { type: 'send_money', params: { amount, toPhone: phone } },
        needsConfirmation: true
      };
    } else if (amount) {
      return {
        intent: 'SEND_MONEY',
        message: `Nheb nab3ath ${amount} dinar. L men? A3tini el numero mta3ou (8 chiffres).`,
        action: null,
        needsConfirmation: false
      };
    } else {
      return {
        intent: 'SEND_MONEY',
        message: '9addech theb tab3ath? W l men (a3tini el numero)? 💸',
        action: null,
        needsConfirmation: false
      };
    }
  }

  // Balance check (after history/send to avoid false matches on "flous")
  if (msg.includes('balance') || msg.includes('ba9a') || msg.includes('9addech') || msg.includes('kam') || msg.includes('compte') || msg.includes('flous')) {
    return {
      intent: 'CHECK_BALANCE',
      message: 'Tayeb, taw nchouflek 9addech 3andek fil compte... ⏳',
      action: { type: 'check_balance', params: {} },
      needsConfirmation: false
    };
  }

  if (msg.includes('insight') || msg.includes('analyse') || msg.includes('masrouf') || msg.includes('conseil') || msg.includes('categori')) {
    return {
      intent: 'GET_INSIGHTS',
      message: 'Taw nwarrik win sraft floussek hal chhar... 📊',
      action: { type: 'get_insights', params: {} },
      needsConfirmation: false
    };
  }

  if (msg.includes('zid') || msg.includes('ajouter') || msg.includes('deposit') || msg.includes('charge')) {
    const amountMatch = msg.match(/(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[1]) : null;
    if (amount) {
      return {
        intent: 'ADD_MONEY',
        message: `Bech nzidlek ${amount} dinar fil compte. Mouwafe9? ✅`,
        action: { type: 'add_money', params: { amount } },
        needsConfirmation: true
      };
    }
    return {
      intent: 'ADD_MONEY',
      message: '9addech theb tzid fil compte? 💰',
      action: null,
      needsConfirmation: false
    };
  }

  if (msg.includes('oui') || msg.includes('ey') || msg.includes('mouwafe9') || msg.includes('ok') || msg.includes('tayeb') || msg.includes('aya')) {
    return {
      intent: 'GENERAL',
      message: 'Tayeb, mel7a! ✅',
      action: null,
      needsConfirmation: false
    };
  }

  if (msg.includes('merci') || msg.includes('choukran') || msg.includes('yishik') || msg.includes('baraka')) {
    return {
      intent: 'GENERAL',
      message: 'Bl plaisir! Kol wa9t thebb 7aja, 9ouli bark. 😊',
      action: null,
      needsConfirmation: false
    };
  }

  if (msg.includes('chkoun') || msg.includes('chnowa') || msg.includes('help') || msg.includes('mseda') || msg.includes('ki')) {
    return {
      intent: 'HELP',
      message: 'Ena Dinex, el assistant mta3ek lel flous! 🤖 Najem na3mellek:\n\n💰 Nchouflek el balance\n💸 Nab3ath flous l 7ad\n📋 Nwarrik el historique mta3ek\n📊 Na3tik insights 3al masrouf mta3ek\n\nJarreb 9ouli "9addech ba9a?" wala "nheb nab3ath 50dt"!',
      action: null,
      needsConfirmation: false
    };
  }

  return {
    intent: 'GENERAL',
    message: 'Ma fhemtekch barcha 😅. Jarreb 9ouli 7aja ki "9addech ba9a fil compte?" wala "nheb nab3ath flous" wala "warini el historique".',
    action: null,
    needsConfirmation: false
  };
}

// ─── CALL BACKEND ────────────────────────────────────────────────────────────

async function callBackend(endpoint, method, token, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error(`Backend call failed: ${endpoint}`, error.message);
    return { error: 'Backend connection failed' };
  }
}

// ─── EXECUTE ACTION ──────────────────────────────────────────────────────────

async function executeAction(action, token) {
  if (!action) return null;

  switch (action.type) {
    case 'check_balance':
      return await callBackend('/api/wallet/balance', 'GET', token);

    case 'send_money':
      return await callBackend('/api/wallet/send', 'POST', token, {
        toPhone: action.params.toPhone,
        amount: action.params.amount,
        category: action.params.category || 'transfer',
        description: action.params.description || ''
      });

    case 'get_transactions':
      return await callBackend('/api/wallet/transactions', 'GET', token);

    case 'get_insights':
      return await callBackend('/api/insights/summary', 'GET', token);

    case 'add_money':
      return await callBackend('/api/wallet/add', 'POST', token, {
        amount: action.params.amount,
        source: action.params.source || 'Carte bancaire'
      });

    default:
      return null;
  }
}

// ─── FORMAT ACTION RESULT ────────────────────────────────────────────────────

function formatActionResult(action, result) {
  if (!result || result.error) {
    return `Mech mriguel, sar mouchkla: ${result?.error || 'erreur inconnue'} 😕`;
  }

  switch (action.type) {
    case 'check_balance':
      return `💰 Balance mta3ek taw hiya **${result.balance.toFixed(2)} ${result.currency}**. Chnoua thebb tdir?`;

    case 'send_money':
      if (result.success) {
        return `✅ Mel7a! Ba3atht ${result.transaction.amount} dinar l ${result.transaction.to}. Balance jdida: **${result.newBalance.toFixed(2)} DT**`;
      }
      return `❌ Ma njemtech nab3ath: ${result.error}`;

    case 'get_transactions': {
      const txs = result.transactions?.slice(0, 5) || [];
      if (txs.length === 0) return '📋 Ma 3andekch transactions baaed.';
      let msg = '📋 Ahom ekher el transactions mta3ek:\n\n';
      txs.forEach(tx => {
        const icon = tx.type === 'send' ? '🔴' : '🟢';
        const sign = tx.type === 'send' ? '-' : '+';
        const person = tx.type === 'send' ? tx.to : tx.from;
        msg += `${icon} ${sign}${tx.amount} DT — ${person} (${tx.date})\n`;
      });
      return msg;
    }

    case 'get_insights': {
      let msg = `📊 El masrouf mta3ek hal chhar:\n\n`;
      msg += `💸 Sraft: **${result.totalSpent.toFixed(2)} DT**\n`;
      msg += `💰 Jek: **${result.totalReceived.toFixed(2)} DT**\n\n`;
      if (result.categories?.length > 0) {
        msg += '📁 Par catégorie:\n';
        result.categories.forEach(cat => {
          msg += `  • ${cat.name}: ${cat.amount.toFixed(2)} DT (${cat.percentage}%)\n`;
        });
      }
      if (result.topCategory) {
        msg += `\n💡 Conseil: El catégorie eli sraft fiha akther hiya "${result.topCategory.name}" (${result.topCategory.amount.toFixed(2)} DT). Hawell tna99es chwaya! 😄`;
      }
      return msg;
    }

    case 'add_money':
      if (result.success) {
        return `✅ Zedna ${result.transaction.amount} dinar fil compte! Balance jdida: **${result.newBalance.toFixed(2)} DT** 🎉`;
      }
      return `❌ Ma njemtech nzid: ${result.error}`;

    default:
      return JSON.stringify(result);
  }
}

// ─── CHAT ENDPOINT ───────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { message, token, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message obligatoire' });
  }

  try {
    let aiResponse;
    let usedGemini = false;

    if (model && GEMINI_API_KEY) {
      try {
        // Use Gemini
        const historyKey = userId || 'default';
        if (!conversations.has(historyKey)) {
          conversations.set(historyKey, []);
        }
        const history = conversations.get(historyKey);

        const prompt = `${SYSTEM_PROMPT}\n\nHistorique mta3 el conversation:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n\nUser: ${message}\n\nJaweb b JSON valide:`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse JSON from response
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiResponse = JSON.parse(jsonMatch[0]);
          } else {
            aiResponse = { intent: 'GENERAL', message: responseText, action: null, needsConfirmation: false };
          }
        } catch {
          aiResponse = { intent: 'GENERAL', message: responseText, action: null, needsConfirmation: false };
        }

        // Update conversation history
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: aiResponse.message });
        if (history.length > 20) history.splice(0, 2);
        usedGemini = true;
      } catch (geminiError) {
        console.error('Gemini API error, falling back:', geminiError.message);
        aiResponse = getFallbackResponse(message);
      }
    } else {
      // Fallback
      aiResponse = getFallbackResponse(message);
    }

    // Execute action if present and no confirmation needed
    let actionResult = null;
    if (aiResponse.action && !aiResponse.needsConfirmation && token) {
      actionResult = await executeAction(aiResponse.action, token);
      if (actionResult) {
        aiResponse.message = formatActionResult(aiResponse.action, actionResult);
        aiResponse.actionResult = actionResult;
      }
    }

    res.json({
      response: aiResponse.message,
      intent: aiResponse.intent,
      action: aiResponse.action,
      needsConfirmation: aiResponse.needsConfirmation || false,
      actionResult
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.json({
      response: 'Mech mriguel, sar mouchkla technique 😕. Jarreb marra okhra.',
      intent: 'GENERAL',
      action: null,
      needsConfirmation: false
    });
  }
});

// ─── CONFIRM ACTION ENDPOINT ────────────────────────────────────────────────

app.post('/api/chat/confirm', async (req, res) => {
  const { action, token } = req.body;

  if (!action || !token) {
    return res.status(400).json({ error: 'Action w token obligatoires' });
  }

  try {
    const result = await executeAction(action, token);
    const message = formatActionResult(action, result);

    res.json({
      response: message,
      intent: action.type.toUpperCase(),
      actionResult: result,
      success: !result?.error
    });
  } catch (error) {
    console.error('Confirm action error:', error);
    res.json({
      response: 'Mech mriguel, ma njemtech nkammel el action 😕',
      intent: 'GENERAL',
      success: false
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dinex AI Service running on port ${PORT}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Gemini: ${GEMINI_API_KEY ? 'Connected' : 'Fallback mode'}`);
});
