// ── Proxy URL ── Calls go through our Deno proxy, which holds the real
// Gemini API key server-side. No API key lives in this file anymore.
const PROXY_URL = 'https://royal-dodo-1799.mtayb0.deno.net';

// ── Gemini API call (via proxy) ──
// Throws a descriptive error instead of failing silently, so pages can show
// the user what actually went wrong (quota, network, etc).
async function askGemini(prompt, { json = false } = {}) {
  let res;
  try {
    res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 700,
          ...(json ? { responseMimeType: 'application/json' } : {})
        }
      })
    });
  } catch (networkErr) {
    throw new Error('Could not reach the AI service. Check your internet connection.');
  }

  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.error?.message || ''; } catch (e) {}
    if (res.status === 429) {
      throw new Error('Free quota reached for now — try again in a minute.');
    }
    throw new Error('AI service error (' + res.status + '). ' + detail);
  }

  const data = await res.json();
  const blockReason = data.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error('The request was blocked by safety filters (' + blockReason + '). Try rephrasing.');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('The AI returned an empty response. Please try again.');
  }
  return text.trim();
}

// ── Improved JSON parsing ──
// Now extracts the JSON object from anywhere in the text, even if the AI
// adds extra fluff around it. Also logs the raw text if parsing fails.
function safeParseJSON(text) {
  try {
    // 1. First, try to find the actual JSON object boundaries { ... }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      // Try parsing just the extracted JSON
      return JSON.parse(jsonStr);
    }

    // 2. Fallback: strip markdown fences and try again
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
    
  } catch (e) {
    // 3. Log the raw text so you can debug if it happens again
    console.error('Failed to parse JSON. Raw response:', text);
    return null;
  }
}

// Shows a real error message in a result/error element instead of a vague
// one-liner, so the user (and you, debugging) can see exactly what failed.
function showOracleError(err, container) {
  console.error('Love Oracle error:', err);
  if (!container) return;
  container.style.display = 'block';
  container.innerHTML = `
    <div style="background:rgba(232,65,122,0.12); border:1px solid rgba(232,65,122,0.4); border-radius:14px; padding:1.1rem; color:#ffd9e3; font-size:0.85rem; line-height:1.6;">
      <strong>🌩️ Something went wrong:</strong><br/>${err.message || 'Unknown error. Please try again.'}
    </div>`;
}

// ── Dawn village scene ──
// Builds: sparse upper-sky stars, a moon, distant hill silhouettes,
// a tree with two figures sitting beneath it, birds crossing the sky,
// and a few fireflies drifting near the couple.

function buildSceneScaffold() {
  const page = document.querySelector('.page');
  if (!page || document.querySelector('.scene-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'scene-overlay';
  document.body.insertBefore(overlay, page);

  const moon = document.createElement('div');
  moon.className = 'moon';
  document.body.insertBefore(moon, page);

  const hills = document.createElement('div');
  hills.className = 'silhouette-hills';
  hills.innerHTML = `
    <svg viewBox="0 0 1000 300" preserveAspectRatio="none">
      <path d="M0,180 Q150,100 300,160 T600,140 T1000,170 L1000,300 L0,300 Z" fill="#241a3c" opacity="0.9"/>
      <path d="M0,220 Q200,160 400,200 T800,190 T1000,210 L1000,300 L0,300 Z" fill="#1a1330"/>
    </svg>`;
  document.body.insertBefore(hills, page);

  const figures = document.createElement('div');
  figures.className = 'scene-figures';
  figures.innerHTML = `
    <svg viewBox="0 0 420 260" preserveAspectRatio="xMidYMax meet">
      <!-- tree trunk -->
      <path d="M200,260 L208,150 L214,150 L222,260 Z" fill="#1a1330"/>
      <!-- canopy -->
      <g class="leaf-sway">
        <ellipse cx="210" cy="110" rx="95" ry="70" fill="#1f1838"/>
        <ellipse cx="160" cy="130" rx="55" ry="42" fill="#241a3c"/>
        <ellipse cx="265" cy="125" rx="58" ry="44" fill="#241a3c"/>
      </g>
      <!-- bench -->
      <rect x="170" y="222" width="80" height="6" rx="2" fill="#1a1330"/>
      <rect x="178" y="228" width="6" height="14" fill="#1a1330"/>
      <rect x="238" y="228" width="6" height="14" fill="#1a1330"/>
      <!-- girl sitting (left) -->
      <g fill="#1a1330">
        <circle cx="192" cy="196" r="9"/>
        <path d="M183,205 Q180,222 186,224 L198,224 Q202,222 200,205 Z"/>
        <path d="M186,224 L184,222 L188,222 Z"/>
        <path d="M198,224 L196,222 L200,222 Z"/>
      </g>
      <!-- boy sitting (right) -->
      <g fill="#1a1330">
        <circle cx="230" cy="195" r="9"/>
        <path d="M221,204 Q218,222 224,224 L237,224 Q241,222 239,204 Z"/>
        <path d="M224,224 L222,222 L226,222 Z"/>
        <path d="M237,224 L235,222 L239,222 Z"/>
      </g>
    </svg>`;
  document.body.insertBefore(figures, page);

  // Sparse stars confined to upper third of the sky
  for (let i = 0; i < 35; i++) {
    const star = document.createElement('div');
    star.className = 'sky-star';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = (Math.random() * 30) + 'vh';
    star.style.animationDelay = (Math.random() * 3) + 's';
    document.body.insertBefore(star, page);
  }

  // Birds crossing the sky periodically
  function spawnBird() {
    const bird = document.createElement('div');
    bird.className = 'bird';
    bird.style.top = (Math.random() * 20 + 5) + 'vh';
    const dur = Math.random() * 6 + 10;
    bird.style.animationDuration = dur + 's';
    bird.style.fontSize = (Math.random() * 0.5 + 0.7) + 'rem';
    document.body.insertBefore(bird, page);
    setTimeout(() => bird.remove(), dur * 1000);
  }
  for (let i = 0; i < 3; i++) setTimeout(spawnBird, i * 2000);
  setInterval(spawnBird, 7000);

  // Fireflies drifting near the couple under the tree
  function spawnFirefly() {
    const fly = document.createElement('div');
    fly.className = 'firefly';
    fly.style.left = (45 + Math.random() * 14) + 'vw';
    fly.style.bottom = (Math.random() * 12 + 4) + 'vh';
    const dur = Math.random() * 3 + 3;
    fly.style.animationDuration = dur + 's';
    document.body.insertBefore(fly, page);
    setTimeout(() => fly.remove(), dur * 1000);
  }
  setInterval(spawnFirefly, 900);
  for (let i = 0; i < 5; i++) setTimeout(spawnFirefly, i * 400);
}

// ── Init on load ──
document.addEventListener('DOMContentLoaded', () => {
  buildSceneScaffold();
});
