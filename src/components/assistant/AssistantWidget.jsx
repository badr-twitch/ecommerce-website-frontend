import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, RefreshCcw, Sparkles, AlertTriangle, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { useAssistantContext } from '../../contexts/AssistantContext';

// Human-readable labels for internal routes. Kept in sync with the backend's
// PAGE_LABELS map (services/assistantService.js). Only includes routes that
// actually exist in App.jsx — we never render a link the app can't navigate to.
const INTERNAL_PAGE_LABELS = {
  '/': 'Accueil',
  '/products': 'Produits',
  '/categories': 'Catégories',
  '/cart': 'Panier',
  '/wishlist': 'Favoris',
  '/profile': 'Mon profil',
  '/orders': 'Mes commandes',
  '/track-order': 'Suivi de commande',
  '/checkout': 'Paiement',
  '/membership': 'Adhésion',
  '/contact': 'Contact',
  '/faq': 'FAQ',
  '/help': 'Aide',
  '/shipping': 'Livraison',
  '/returns': 'Retours',
  '/about': 'À propos',
  '/privacy': 'Confidentialité',
  '/terms': 'Conditions',
  '/login': 'Connexion',
  '/register': 'Inscription',
};

const isKnownInternalRoute = (href) =>
  typeof href === 'string' && Object.prototype.hasOwnProperty.call(INTERNAL_PAGE_LABELS, href);

const PagePill = ({ to, children, onNavigate }) => (
  <Link
    to={to}
    onClick={onNavigate}
    className="inline-flex items-center gap-1 align-baseline rounded-full bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 text-xs font-medium hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
  >
    {children}
    <ArrowUpRight className="w-3 h-3" />
  </Link>
);

// Inline Markdown subset supported (in this priority):
//   1) Internal page link  `[Label](/route)` → clickable PagePill (known routes only)
//   2) Bold                `**text**`        → <strong>
//   3) Italic              `*text*`          → <em>
//   4) Bare internal route `/route`          → clickable PagePill (defence-in-depth)
// Everything else is emitted as plain text — HTML is never interpreted, so
// there is no XSS surface even if the model tries to slip raw tags in.
const INLINE_PAGE_LINK = /\[([^\]]+)\]\((\/[a-zA-Z0-9/_-]+)\)/;
const INLINE_BOLD = /\*\*([^*\n]+?)\*\*/;
const INLINE_ITALIC = /\*([^*\n]+?)\*/;
const INLINE_BARE_ROUTE = /(\/[a-zA-Z][a-zA-Z0-9/_-]*)/;

// Walks the string, finds the earliest inline token, emits it as a React node,
// and recurses on the remainder. Bold/italic content is re-parsed recursively
// so nested formatting (e.g. bold containing a page link) still renders.
function renderInline(text, onNavigate, keyPrefix) {
  const out = [];
  let remaining = text;
  let k = 0;
  while (remaining.length > 0) {
    const candidates = [];
    const link = remaining.match(INLINE_PAGE_LINK);
    if (link) candidates.push({ kind: 'link', index: link.index, match: link });
    const bold = remaining.match(INLINE_BOLD);
    if (bold) candidates.push({ kind: 'bold', index: bold.index, match: bold });
    const italic = remaining.match(INLINE_ITALIC);
    if (italic) candidates.push({ kind: 'italic', index: italic.index, match: italic });
    const bare = remaining.match(INLINE_BARE_ROUTE);
    if (bare) candidates.push({ kind: 'bare', index: bare.index, match: bare });

    if (candidates.length === 0) {
      out.push(remaining);
      break;
    }
    candidates.sort((a, b) => a.index - b.index);
    const next = candidates[0];
    const full = next.match[0];
    if (next.index > 0) out.push(remaining.slice(0, next.index));

    const nodeKey = `${keyPrefix}-${k++}`;
    if (next.kind === 'link') {
      const [, label, route] = next.match;
      if (isKnownInternalRoute(route)) {
        out.push(
          <PagePill key={nodeKey} to={route} onNavigate={onNavigate}>
            {label}
          </PagePill>
        );
      } else {
        out.push(full);
      }
    } else if (next.kind === 'bold') {
      out.push(
        <strong key={nodeKey} className="font-semibold">
          {renderInline(next.match[1], onNavigate, `${nodeKey}b`)}
        </strong>
      );
    } else if (next.kind === 'italic') {
      out.push(
        <em key={nodeKey} className="italic">
          {renderInline(next.match[1], onNavigate, `${nodeKey}i`)}
        </em>
      );
    } else if (next.kind === 'bare') {
      const route = next.match[1];
      if (isKnownInternalRoute(route)) {
        out.push(
          <PagePill key={nodeKey} to={route} onNavigate={onNavigate}>
            {INTERNAL_PAGE_LABELS[route]}
          </PagePill>
        );
      } else {
        out.push(full);
      }
    }
    remaining = remaining.slice(next.index + full.length);
  }
  return out;
}

// Block-level parser: groups consecutive lines into paragraph or unordered-list
// blocks (list markers: `- ` or `* `). Blank lines separate blocks. Each block
// is then rendered with the inline parser. No raw HTML is ever interpreted.
function renderAssistantContent(text, onNavigate) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let paragraph = null;
  let list = null;

  const flushParagraph = () => {
    if (paragraph) { blocks.push({ type: 'p', lines: paragraph }); paragraph = null; }
  };
  const flushList = () => {
    if (list) { blocks.push({ type: 'ul', items: list }); list = null; }
  };

  for (const raw of lines) {
    const listMatch = raw.match(/^\s*[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      if (!list) list = [];
      list.push(listMatch[1]);
      continue;
    }
    if (raw.trim() === '') {
      flushList();
      flushParagraph();
      continue;
    }
    flushList();
    if (!paragraph) paragraph = [];
    paragraph.push(raw);
  }
  flushList();
  flushParagraph();

  return blocks.map((block, idx) => {
    const keyPrefix = `blk-${idx}`;
    if (block.type === 'ul') {
      return (
        <ul key={keyPrefix} className="list-disc pl-5 space-y-0.5 my-1 first:mt-0 last:mb-0">
          {block.items.map((item, i) => (
            <li key={`${keyPrefix}-li-${i}`}>
              {renderInline(item, onNavigate, `${keyPrefix}-li-${i}`)}
            </li>
          ))}
        </ul>
      );
    }
    const parts = [];
    block.lines.forEach((line, i) => {
      if (i > 0) parts.push(<br key={`${keyPrefix}-br-${i}`} />);
      parts.push(...renderInline(line, onNavigate, `${keyPrefix}-l${i}`));
    });
    return (
      <p key={keyPrefix} className="my-1 first:mt-0 last:mb-0">
        {parts}
      </p>
    );
  });
}

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Bonjour ! Je suis votre assistant shopping. Posez-moi une question sur nos produits, la livraison ou les retours — je vous réponds avec ce que je sais, et je vous oriente vers /contact si besoin.",
};

const STORAGE_KEY = 'assistant:conversation:v1';

// Generic chip catalog. Each chip is shown ONLY if the backend reports that the
// corresponding knowledge-guide topic is filled. The "contact" chip is always
// shown because it just sends the user to the /contact page — no knowledge needed.
const CHIP_CATALOG = [
  { id: 'delivery', label: 'Délais de livraison', prompt: 'Quels sont vos délais de livraison au Maroc ?' },
  { id: 'returns', label: 'Retours et remboursements', prompt: 'Quelle est votre politique de retour ?' },
  { id: 'payment', label: 'Moyens de paiement', prompt: 'Quels moyens de paiement acceptez-vous ?' },
  { id: 'categories', label: 'Catégories de produits', prompt: 'Quelles catégories de produits vendez-vous ?' },
  { id: 'faq', label: 'Questions fréquentes', prompt: 'Quelles sont les questions les plus fréquentes ?' },
  { id: 'brand', label: 'À propos de la marque', prompt: 'Pouvez-vous me présenter votre marque ?' },
];

const AssistantWidget = () => {
  const { pageContext } = useAssistantContext();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) { /* ignore */ }
    return [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);

  // Backend assistant state: { configured, topics }
  const [assistantState, setAssistantState] = useState({ configured: null, topics: [] });

  const scrollAnchorRef = useRef(null);
  const inputRef = useRef(null);
  const sendingRef = useRef(false);

  // Persist conversation within the browser session
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (_) { /* ignore quota / private mode */ }
  }, [messages]);

  // Fetch health once the panel is opened for the first time
  useEffect(() => {
    if (!open) return;
    if (assistantState.configured !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/assistant/health');
        if (!cancelled && res.data?.success) {
          setAssistantState({
            configured: !!res.data.data.configured,
            topics: Array.isArray(res.data.data.topics) ? res.data.data.topics : [],
          });
        }
      } catch (_) {
        if (!cancelled) setAssistantState({ configured: false, topics: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [open, assistantState.configured]);

  useEffect(() => {
    if (open && scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const availableChips = useMemo(() => {
    const { topics } = assistantState;
    return CHIP_CATALOG.filter((chip) => topics.includes(chip.id));
  }, [assistantState]);

  const isLimitedMode = assistantState.configured === false || availableChips.length === 0;
  const showChips = messages.length <= 1 && !loading && availableChips.length > 0;

  const sendWithText = useCallback(async (text) => {
    if (sendingRef.current || loading) return;
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const nextUser = { role: 'user', content: trimmed };
    const optimistic = [...messages, nextUser];
    setMessages(optimistic);
    setInput('');
    setErrorState(null);
    setLoading(true);
    sendingRef.current = true;

    try {
      const history = optimistic.filter((m) => m !== WELCOME_MESSAGE);
      const payload = { messages: history };
      if (pageContext && typeof pageContext === 'object') {
        payload.context = pageContext;
      }
      const res = await api.post('/assistant/chat', payload);
      const reply = res.data?.data?.reply ||
        "Je n'ai pas pu générer de réponse. Merci de réessayer ou de nous contacter via /contact.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const serverMsg = err?.response?.data?.error;
      setErrorState(serverMsg || "Une erreur est survenue. Réessayez dans un instant.");
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [loading, messages, pageContext]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendWithText(input);
    }
  };

  const resetConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setErrorState(null);
    setInput('');
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir l'assistant shopping"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Assistant</span>
        </button>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Assistant shopping"
            className="fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden
                       inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]
                       sm:inset-auto sm:bottom-5 sm:right-5 sm:rounded-2xl sm:w-[380px] sm:h-[560px] sm:max-h-[80vh]"
          >
            <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-heading font-semibold leading-tight truncate">Assistant shopping</div>
                  <div className="text-[11px] text-white/80 leading-tight">
                    {assistantState.configured === null
                      ? 'Chargement…'
                      : isLimitedMode
                        ? 'Mode limité — certaines infos non disponibles'
                        : 'Toujours prêt à vous aider'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetConversation}
                  title="Nouvelle conversation"
                  aria-label="Nouvelle conversation"
                  className="p-1.5 rounded-md hover:bg-white/15 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer l'assistant"
                  className="p-1.5 rounded-md hover:bg-white/15 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Limited-mode banner: only shown when the guide is empty OR no topics are covered */}
            {isLimitedMode && assistantState.configured !== null && (
              <div className="flex items-start gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-amber-800 text-xs leading-snug">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  L'assistant ne dispose pas encore de toutes les informations officielles de la boutique.
                  Pour une réponse vérifiée, consultez <a href="/faq" className="underline font-medium">/faq</a> ou
                  contactez-nous via <a href="/contact" className="underline font-medium">/contact</a>.
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] text-sm leading-relaxed rounded-2xl px-3.5 py-2 shadow-sm
                      ${m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md whitespace-pre-wrap'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'}`}
                  >
                    {m.role === 'assistant'
                      ? renderAssistantContent(m.content, () => setOpen(false))
                      : m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-bl-md px-3.5 py-2 shadow-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                    </span>
                  </div>
                </div>
              )}

              {errorState && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorState}
                </div>
              )}

              <div ref={scrollAnchorRef} />
            </div>

            {/* Suggestion chips — only before the first user message, only for covered topics */}
            {showChips && (
              <div className="px-3 pt-2 pb-1 border-t border-gray-100 bg-white">
                <div className="text-[11px] font-medium text-gray-500 mb-1.5">Suggestions</div>
                <div className="flex flex-wrap gap-1.5">
                  {availableChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => sendWithText(chip.prompt)}
                      className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100 hover:bg-primary-100 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              className="border-t border-gray-200 bg-white px-3 py-2.5 flex items-end gap-2"
              onSubmit={(e) => { e.preventDefault(); sendWithText(input); }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={2000}
                placeholder="Posez votre question…"
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-28"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Envoyer"
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 text-white h-9 w-9 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="px-3 pb-2 text-[10px] text-gray-400 leading-snug">
              Les réponses peuvent être approximatives. Pour toute demande officielle, contactez-nous via /contact.
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default AssistantWidget;
