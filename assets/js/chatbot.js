// Portfolio AI Assistant — chat widget
// After deploying the Cloudflare Worker, replace the placeholder URL below.
const WORKER_URL = 'https://portfolio-chatbot.taiwo-jegede.workers.dev';

const WELCOME_MSG =
  "Hi! I'm Taiwo's AI assistant. Ask me anything about his background, skills, AWS experience, or availability.";

const $ = id => document.getElementById(id);

const panel       = $('chat-panel');
const bubble      = $('chat-bubble');
const messages    = $('chat-messages');
const form        = $('chat-form');
const input       = $('chat-input');
const sendBtn     = $('chat-send');
const badge       = $('chat-badge');
const iconOpen    = $('chat-icon-open');
const iconClose   = $('chat-icon-close');
const suggestions = $('chat-suggestions');

let isOpen    = false;
let isLoading = false;

// ---------------------------------------------------------------------------
// Open / close
// ---------------------------------------------------------------------------

function openChat() {
  isOpen = true;
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('chat-panel--open'));
  bubble.setAttribute('aria-expanded', 'true');
  iconOpen.style.display  = 'none';
  iconClose.style.display = '';
  badge.style.display     = 'none';
  if (messages.children.length === 0) addBotMsg(WELCOME_MSG);
  setTimeout(() => input.focus(), 280);
}

function closeChat() {
  isOpen = false;
  panel.classList.remove('chat-panel--open');
  panel.hidden = true;
  bubble.setAttribute('aria-expanded', 'false');
  iconOpen.style.display  = '';
  iconClose.style.display = 'none';
}

bubble.addEventListener('click', () => (isOpen ? closeChat() : openChat()));
$('chat-close-btn').addEventListener('click', closeChat);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeChat(); });

// ---------------------------------------------------------------------------
// Message rendering
// ---------------------------------------------------------------------------

function addMsg(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg--${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

const addBotMsg  = text => addMsg(text, 'bot');
const addUserMsg = text => addMsg(text, 'user');

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--bot chat-msg--typing';
  div.id = 'chat-typing';
  div.innerHTML =
    '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const el = $('chat-typing');
  if (el) el.remove();
}

// ---------------------------------------------------------------------------
// Suggestion chips
// ---------------------------------------------------------------------------

suggestions.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    suggestions.style.display = 'none';
    send(chip.dataset.q);
  });
});

// ---------------------------------------------------------------------------
// Form submit
// ---------------------------------------------------------------------------

form.addEventListener('submit', e => {
  e.preventDefault();
  const q = input.value.trim();
  if (!q || isLoading) return;
  input.value = '';
  suggestions.style.display = 'none';
  send(q);
});

// ---------------------------------------------------------------------------
// Core send
// ---------------------------------------------------------------------------

async function send(question) {
  if (isLoading) return;
  isLoading = true;
  sendBtn.disabled = true;
  input.disabled   = true;

  addUserMsg(question);
  showTyping();

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: AbortSignal.timeout(30_000),
    });

    removeTyping();

    if (!res.ok) {
      addBotMsg("Something went wrong. Please try again or email Taiwo directly at jegedetaiwo95@gmail.com");
      return;
    }

    const data = await res.json();
    addBotMsg(data.answer || "No response received. Please try again.");
  } catch (err) {
    removeTyping();
    if (err.name === 'TimeoutError') {
      addBotMsg("Request timed out — please try again in a moment.");
    } else {
      addBotMsg("Network error. Check your connection and try again.");
    }
  } finally {
    isLoading        = false;
    sendBtn.disabled = false;
    input.disabled   = false;
    input.focus();
  }
}
