// ── API KEY ── Replace with your Gemini API key
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

// ── Gemini API call ──
async function askGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 600 }
      })
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'The stars are silent right now... try again 🌙';
}

// ── Starfield ──
function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.008 + 0.002,
        dir: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createStars();
  draw();
  window.addEventListener('resize', () => { resize(); createStars(); });
}

// ── Floating hearts ──
function initHearts() {
  const container = document.querySelector('.hearts-bg');
  if (!container) return;
  const emojis = ['💕', '✨', '🌙', '⭐', '💫', '🌸', '💗', '🔮'];

  function spawnHeart() {
    const el = document.createElement('div');
    el.className = 'heart-float';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (Math.random() * 1 + 0.6) + 'rem';
    const dur = Math.random() * 10 + 10;
    el.style.animationDuration = dur + 's';
    el.style.animationDelay = Math.random() * 5 + 's';
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + 5) * 1000);
  }

  for (let i = 0; i < 12; i++) spawnHeart();
  setInterval(spawnHeart, 2500);
}

// ── Init on load ──
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initHearts();
});
