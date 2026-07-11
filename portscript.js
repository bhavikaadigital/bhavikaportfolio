/* ============================================================
   BHAVIKA ASWANI — Digital Growth Specialist
   script.js — Three.js | Scroll Reveal | AI Orb | TTS | Chat
   ============================================================ */

'use strict';

/* ======================================================
   1. CUSTOM CURSOR
   ====================================================== */
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

(function animateCursor() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top = followerY + 'px';
  requestAnimationFrame(animateCursor);
})();


/* ======================================================
   2. THREE.JS BACKGROUND
   ====================================================== */
(function initThreeJS() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // ── Particle Field ──
  const particleCount = 2800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const colorA = new THREE.Color(0x00c8ff); // cyber blue
  const colorB = new THREE.Color(0xa855f7); // purple
  const colorC = new THREE.Color(0x06efb8); // cyan accent

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 3 + Math.random() * 12;

    positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const t = Math.random();
    let col;
    if (t < 0.5) col = colorA.clone().lerp(colorB, t * 2);
    else col = colorB.clone().lerp(colorC, (t - 0.5) * 2);

    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
    sizes[i] = Math.random() * 1.4 + 0.2;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Grid Lines (abstract mesh) ──
  const gridGeo = new THREE.BufferGeometry();
  const gridCount = 60;
  const gridPositions = [];

  for (let i = 0; i < gridCount; i++) {
    const x = (i / gridCount - 0.5) * 28;
    gridPositions.push(x, -4, -8, x, -4, 8);
  }
  for (let i = 0; i < gridCount; i++) {
    const z = (i / gridCount - 0.5) * 16 - 8;
    gridPositions.push(-14, -4, z, 14, -4, z);
  }

  gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridPositions), 3));
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x0a2540,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  const grid = new THREE.LineSegments(gridGeo, gridMat);
  scene.add(grid);

  // ── Floating Energy Orbs ──
  const orbGroup = new THREE.Group();
  scene.add(orbGroup);

  const orbData = [
    { radius: 0.18, pos: [-2.5, 1.2, -1], color: 0x00c8ff },
    { radius: 0.12, pos: [2.8, -0.8, -2], color: 0xa855f7 },
    { radius: 0.22, pos: [0.5, 2.2, -3], color: 0x06efb8 },
    { radius: 0.09, pos: [-1.8, -1.5, -1.5], color: 0x00c8ff },
    { radius: 0.14, pos: [3.2, 1.8, -2.5], color: 0xa855f7 },
  ];

  orbData.forEach(({ radius, pos, color }) => {
    const geo = new THREE.SphereGeometry(radius, 12, 12);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.userData = { originY: pos[1], speed: 0.4 + Math.random() * 0.6, phase: Math.random() * Math.PI * 2 };
    orbGroup.add(mesh);
  });

  // ── Mouse Interaction ──
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;
  const mouseSensitivity = 0.0012;

  document.addEventListener('mousemove', (e) => {
    targetRotY = (e.clientX / window.innerWidth - 0.5) * mouseSensitivity * 60;
    targetRotX = (e.clientY / window.innerHeight - 0.5) * mouseSensitivity * 30;
  });

  // ── Resize ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animate ──
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.01;

    // Smooth camera parallax
    currentRotX += (targetRotX - currentRotX) * 0.04;
    currentRotY += (targetRotY - currentRotY) * 0.04;
    particles.rotation.y = currentRotY + clock * 0.04;
    particles.rotation.x = currentRotX;

    // Floating orbs
    orbGroup.children.forEach(orb => {
      const { originY, speed, phase } = orb.userData;
      orb.position.y = originY + Math.sin(clock * speed + phase) * 0.25;
      orb.rotation.y += 0.01;
    });

    // Slow grid drift
    grid.position.z = (clock * 0.3) % 1.5 - 0.75;

    renderer.render(scene, camera);
  }
  animate();
})();


/* ======================================================
   3. NAV SCROLL EFFECT
   ====================================================== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ======================================================
   3b. MOBILE NAV MENU
   ====================================================== */
const navBurger = document.getElementById('navBurger');
const mobileNav = document.getElementById('mobileNav');

if (navBurger && mobileNav) {
  navBurger.addEventListener('click', () => {
    navBurger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navBurger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
}


/* ======================================================
   4. SCROLL REVEAL (IntersectionObserver)
   ====================================================== */
const revealEls = document.querySelectorAll(
  '.reveal-up, .reveal-clip, .reveal-left, .reveal-right'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));


/* ======================================================
   5. COUNTER ANIMATION (Metrics)
   ====================================================== */
function animateCount(el, target, duration = 1800) {
  const start = performance.now();
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const metricObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCount(el, target);
      metricObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.metric-num[data-target]').forEach(el => {
  metricObserver.observe(el);
});


/* ======================================================
   6. AI ORB & CHAT PANEL
   ====================================================== */
const aiOrb = document.getElementById('aiOrb');
const orbWrapper = document.getElementById('orbWrapper');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatSuggestions = document.getElementById('chatSuggestions');
const introMsg = document.getElementById('introMsg');
const tooltipText = document.getElementById('tooltipText');

let chatOpen = false;
let firstInteractionDone = false;
let isSpeaking = false;

// ── Toggle Chat ──
function openChat() {
  chatOpen = true;
  chatPanel.classList.add('open');
}
function closeChat() {
  chatOpen = false;
  chatPanel.classList.remove('open');
}

aiOrb.addEventListener('click', (e) => {
  e.stopPropagation();
  if (chatOpen) closeChat();
  else openChat();
});
chatClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeChat();
});

// ── First Interaction Trigger (TTS) ──
function triggerFirstInteraction() {
  if (firstInteractionDone) return;
  firstInteractionDone = true;

  openChat();
  showIntroMessage();
  speakIntro();
}

document.addEventListener('click', triggerFirstInteraction, { once: true });
document.addEventListener('keydown', triggerFirstInteraction, { once: true });

function showIntroMessage() {
  introMsg.style.display = 'block';
  introMsg.style.opacity = '1';
  introMsg.style.transform = 'translateY(0)';
}

// ── Web Speech API TTS ──
function speakIntro() {
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(
    "Hi, I am Bhavika Aswani's digital twin. I'm here to help you revolutionize your growth strategy. How can I assist you today?"
  );

  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.volume = 1;

  // Pick a female voice
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v =>
      v.name.toLowerCase().includes('female') ||
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Victoria') ||
      v.name.includes('Zira') ||
      v.name.includes('Hazel') ||
      (v.lang.startsWith('en') && v.name.toLowerCase().includes('google'))
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }

  isSpeaking = true;
  utterance.onend = () => { isSpeaking = false; };
}


/* ======================================================
   7. AI CHAT RESPONSES (local FAQ-based, instant & reliable)
   ====================================================== */
const FAQ_ANSWERS = [
  {
    keywords: ['yourself', 'about you', 'who are you', 'about bhavika'],
    answer: "I'm Bhavika Aswani, an AI Developer & Digital Specialist with an MCA. I build AI-powered systems, websites, CRMs, and content — plus handle social media management and video editing to help brands connect and grow. 🚀"
  },
  {
    keywords: ['contact', 'email', 'phone', 'number', 'reach'],
    answer: "You can reach me at bhavikaaswani35@gmail.com or call +91-9462210291. 📩"
  },
  {
    keywords: ['social media', 'content work', 'content creation', 'reels', 'video editing work'],
    answer: "I handle social media management and content creation end-to-end — strategy, video editing, and Instagram Reels — helping brands connect with their audience and grow visibility."
  },
  {
    keywords: ['philosophy', 'content approach', 'nazariya'],
    answer: "My content approach: deep research before creating anything, connecting through human psychology, and treating content as brand visibility — not just a money funnel."
  },
  {
    keywords: ['process', 'approach a project', 'work from start', 'how do you work'],
    answer: "My workflow: Research → Scripting → Video Shoot → Video Edit & Posting → Ads. Each step builds on the last for content that actually performs."
  },
  {
    keywords: ['get started', 'started working', 'begin', 'start a project'],
    answer: "Just fill the contact form below, or email/call me directly. We can also schedule a quick meeting first to discuss your project before starting. 🤝"
  }
];

function getLocalAnswer(userMessage) {
  const msg = userMessage.toLowerCase();
  for (const item of FAQ_ANSWERS) {
    if (item.keywords.some(k => msg.includes(k))) {
      return item.answer;
    }
  }
  return "For more on that, you can contact Bhavika directly at +91-9462210291 or bhavikaaswani35@gmail.com. 📞";
}

async function getAIResponse(userMessage) {
  // Simulate a brief natural delay before responding
  await new Promise(resolve => setTimeout(resolve, 500));
  return getLocalAnswer(userMessage);
}

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role === 'ai' ? 'ai-msg' : 'user-msg'}`;
  div.innerHTML = `<p>${text}</p>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function handleUserMessage(text) {
  if (!text.trim()) return;

  addMessage(text, 'user');
  chatInput.value = '';
  showTyping();

  const reply = await getAIResponse(text);
  removeTyping();
  addMessage(reply, 'ai');
}

// Suggestion buttons
document.querySelectorAll('.suggestion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    handleUserMessage(btn.dataset.msg);
  });
});

// Send button & Enter key
chatSend.addEventListener('click', () => handleUserMessage(chatInput.value));
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleUserMessage(chatInput.value);
});


/* ======================================================
   8. CONTACT FORM (Web3Forms integration)
   ====================================================== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>Sending...</span>';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      const result = await response.json();

      if (result.success) {
        btn.innerHTML = '<span>Message Sent! ✓</span>';
        btn.style.background = 'linear-gradient(135deg, #06efb8, #00c8ff)';
        contactForm.reset();
      } else {
        btn.innerHTML = '<span>Something went wrong. Try again.</span>';
        btn.style.background = 'linear-gradient(135deg, #e0567a, #a83232)';
      }
    } catch (err) {
      btn.innerHTML = '<span>Network error. Try again.</span>';
      btn.style.background = 'linear-gradient(135deg, #e0567a, #a83232)';
    }

    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 3500);
  });
}


/* ======================================================
   9. SMOOTH PARALLAX ON SCROLL
   ====================================================== */
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
}, { passive: true });

(function parallaxLoop() {
  const hero = document.querySelector('.hero-inner');
  if (hero) {
    hero.style.transform = `translateY(${scrollY * 0.25}px)`;
    hero.style.opacity = 1 - (scrollY / 600);
  }
  requestAnimationFrame(parallaxLoop);
})();


/* ======================================================
   10. NAV LINK ACTIVE STATE ON SCROLL
   ====================================================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));


/* ======================================================
   11. GLITCH EFFECT ON HERO NAME (subtle)
   ====================================================== */
const heroName = document.querySelector('.hero-name');
if (heroName) {
  setInterval(() => {
    heroName.style.textShadow = `
      ${(Math.random() - 0.5) * 4}px 0 rgba(0,200,255,0.4),
      ${(Math.random() - 0.5) * 4}px 0 rgba(168,85,247,0.4)
    `;
    setTimeout(() => { heroName.style.textShadow = 'none'; }, 80);
  }, 4000 + Math.random() * 3000);
}


/* ======================================================
   12. FORCE-MUTED VIDEOS
   (Travel CRM & Visa Verification videos must never
   play with sound, even if someone clicks unmute)
   ====================================================== */
document.querySelectorAll('video.force-muted').forEach((vid) => {
  vid.muted = true;
  vid.addEventListener('volumechange', () => {
    if (!vid.muted) vid.muted = true;
  });
});

/* ======================================================
   13. GLITCH EFFECT ON HERO NAME (subtle) — continued above
   ====================================================== */