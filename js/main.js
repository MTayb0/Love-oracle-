// ── API KEY ── Replace with your Gemini API key
const GEMINI_API_KEY = 'AIzaSyDSz7FPKRMqigxNOhqdjjySphW4k1Br23g';

// ── Gemini API call ──
// Throws a descriptive error instead of failing silently, so pages can show
// the user what actually went wrong (bad key, quota, network, etc).
async function askGemini(prompt, { json = false } = {}) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('No Gemini API key has been set in js/main.js yet.');
  }

  let res;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
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
      }
    );
  } catch (networkErr) {
    throw new Error('Could not reach the AI service. Check your internet connection.');
  }

  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.error?.message || ''; } catch (e) {}
    if (res.status === 400 || res.status === 403) {
      throw new Error('The API key was rejected. Re-check it in js/main.js and its website restrictions. ' + detail);
    }
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

// Strips ```json fences etc and parses JSON safely. Returns null on failure
// so callers can fall back gracefully instead of crashing.
function safeParseJSON(text) {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
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
      <!-- girl
