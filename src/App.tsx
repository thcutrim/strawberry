import { useState, useEffect, useRef } from 'react';
import type { Message, ProfitRobotStatus, PortfolioData } from './types';
import { OptionsPayoffChart } from './components/OptionsPayoffChart';
import { OrderTicketWidget } from './components/OrderTicketWidget';
import { ProfitBridgeModal } from './components/ProfitBridgeModal';
import { PortfolioWidget } from './components/PortfolioWidget';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { evaluateTraderIntent } from './services/jevEngine';
import {
  Send,
  Image as ImageIcon,
  Cpu,
  Bot,
  User,
  Plus,
  Sliders,
  Zap,
  Sparkles,
  Layers,
  Wallet,
  Trash2,
  Database,
  Loader2
} from 'lucide-react';
import { keepAliveSupabase } from './services/keepalive';
import { APP_VERSION } from './config';

const API_WORKER_URL = 'https://strawberry-bridge.edigicert-app.workers.dev';
const CHAT_STORAGE_KEY = 'strawberry_chat_messages';

const INITIAL_WELCOME_MSG: Message = {
  id: '1',
  sender: 'assistant',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  text: 'Olá! Sou o assistente Strawberry AI especializado em Opções e Derivativos. Conectado automaticamente à sua conta Genial Investimentos via login do Google. Como posso te ajudar agora?'
};

export function App() {
  // Rehydrate Chat Messages History from LocalStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Falha ao carregar histórico do chat:', e);
      }
    }
    return [INITIAL_WELCOME_MSG];
  });

  const [inputText, setInputText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [livePortfolio, setLivePortfolio] = useState<PortfolioData | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'checking'>('checking');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Persist Messages History on state change
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Anti-suspensão automática do Supabase (Keep-Alive periódico no carregamento)
  useEffect(() => {
    keepAliveSupabase()
      .then((res) => {
        if (res.success) {
          setDbStatus('connected');
        }
      })
      .catch((err) => console.warn('Supabase Keep-Alive Warning:', err));
  }, []);

  // Automated Background Fetch from Genial API Worker
  useEffect(() => {
    fetch(`${API_WORKER_URL}/api/portfolio`)
      .then((res) => res.json())
      .then((data: PortfolioData) => setLivePortfolio(data))
      .catch((err) => console.error('Auto Fetch Genial Error:', err));
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userPrompt = inputText;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userPrompt,
      imageUrl: selectedImage || undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsGenerating(true);

    // ⚡ Execute TypeSafe JEV Engine with Automated SSO Live Broker State (System-1 Decision)
    const jevResult = evaluateTraderIntent(userPrompt, livePortfolio);

    let finalResponseText = jevResult.suggestedResponse;
    let modelSource = 'TypeSafe Jev System-1';

    // Se requer modelo generativo (perguntas sobre ações, ativos B3, conceitos financeiros):
    if (jevResult.requiresLLM) {
      try {
        const response = await fetch(`${API_WORKER_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userPrompt,
            history: messages.slice(-6).map((m) => ({
              role: m.sender,
              text: m.text
            }))
          })
        });

        if (response.ok) {
          const chatData = await response.json();
          if (chatData.response) {
            finalResponseText = chatData.response;
            modelSource = chatData.model || 'DeepSeek-V3';
          }
        } else {
          finalResponseText =
            '⚠️ Instabilidade momentânea no processamento do modelo de inteligência artificial. Por favor, tente enviar sua pergunta novamente.';
        }
      } catch (err) {
        console.error('Erro ao chamar endpoint /api/chat:', err);
        finalResponseText =
          '⚠️ Erro de conexão com o Strawberry AI Bridge. Por favor, verifique a conexão e tente novamente.';
      }
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: finalResponseText,
      payoffWidget: jevResult.payoffWidget,
      orderTicketWidget: jevResult.orderTicketWidget,
      portfolioWidget: jevResult.portfolioWidget,
      jevCategory: `TypeSafe JEV: ${jevResult.questions.intent} | ${modelSource} (${jevResult.executionTimeMs}ms)`
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsGenerating(false);
  };

  const handleNewChat = () => {
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Nova sessão iniciada. Como posso te ajudar na sua análise de Opções e Custódia?'
    };
    setMessages([welcomeMsg]);
  };

  const handleTicketConfirm = (ticketId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.orderTicketWidget && msg.orderTicketWidget.id === ticketId) {
          return {
            ...msg,
            orderTicketWidget: { ...msg.orderTicketWidget, status: 'EXECUTED' }
          };
        }
        return msg;
      })
    );
  };

  const handleSimulatePrintUpload = () => {
    setSelectedImage(
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
    );
  };

  // Mock Profit Pro Robots
  const [robots] = useState<ProfitRobotStatus[]>([
    {
      id: 'robo-win-22',
      name: 'ROBO_WIN_22_IRONFLOW_WAVETREND',
      asset: 'WINV26 (Mini-Índice)',
      status: 'RUNNING',
      todayPnl: 973.0,
      totalTrades: 124,
      winRate: 39.52
    }
  ]);

  return (
    <div className="flex h-screen bg-[#142035] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar Left */}
      <aside className="w-72 bg-[#182740] border-r border-[#203455] flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2 py-3 mb-4 border-b border-[#203455]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg glow-blue">
              🍓
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-none">Strawberry AI</h1>
              <span className="text-[10px] text-amber-400 font-mono font-medium">Options & Derivatives</span>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full bg-[#1c2d4a] hover:bg-[#203355] text-blue-300 border border-[#253c62] rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold transition-all mb-6"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Nova Análise de Opções</span>
          </button>

        </div>

        {/* Profit Pro, JEV & Supabase Indicator */}
        <div className="bg-[#1b2b47] border border-[#23375b] p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> TypeSafe JEV Active
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase Anti-Pause
            </span>
            <span className="text-emerald-400 font-semibold">{dbStatus === 'connected' ? 'Ativo' : 'Conectando'}</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full text-center text-blue-400 hover:text-blue-300 text-xs font-mono font-medium underline"
          >
            Ver Robôs & Custódia →
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col justify-between bg-[#17253c] relative">
        {/* Top Header */}
        <header className="h-14 border-b border-[#203455] bg-[#182740]/80 backdrop-blur-md px-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">🍓</span>
            <div className="leading-none">
              <span className="text-sm font-bold text-white">Strawberry AI</span>
              <span className="block text-[9px] text-gray-500 font-mono mt-0.5">Options & Derivatives</span>
            </div>
            <span
              className={`ml-1 text-[10px] font-mono px-2 py-1 rounded-full border flex items-center gap-1.5 ${
                dbStatus === 'connected'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/50'
              }`}
              title="Keep-alive ativo no Supabase PostgreSQL"
            >
              <Database className="w-3 h-3" /> {dbStatus === 'connected' ? 'DB Ativo' : 'DB...'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNewChat}
              title="Limpar histórico e iniciar nova conversa"
              className="bg-[#1e304f] hover:bg-[#23375b] text-gray-300 border border-[#263d65] text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Limpar Histórico</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1e304f] hover:bg-[#23375b] text-blue-300 border border-blue-800/40 text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all hidden sm:flex"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Profit Pro Bridge</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-600/50 flex items-center justify-center text-xs font-bold text-blue-200">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className={`max-w-[88%] space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-950/60 border border-blue-800/60 text-blue-100 rounded-tr-none'
                      : 'bg-[#1b2c48] border border-[#23385c] text-gray-200 rounded-tl-none shadow-xl'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}

                  {/* Attached Image */}
                  {msg.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-[#263d65]">
                      <img src={msg.imageUrl} alt="Print do Gráfico" className="w-full max-h-60 object-cover" />
                    </div>
                  )}
                </div>

                {/* Embedded Portfolio Custody Widget */}
                {msg.portfolioWidget && <PortfolioWidget data={msg.portfolioWidget} />}

                {/* Embedded Payoff Chart Widget */}
                {msg.payoffWidget && <OptionsPayoffChart data={msg.payoffWidget} />}

                {/* Embedded Order Ticket Widget */}
                {msg.orderTicketWidget && (
                  <OrderTicketWidget data={msg.orderTicketWidget} onConfirm={handleTicketConfirm} />
                )}

                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono px-1">
                  <span>{msg.timestamp}</span>
                  {msg.jevCategory && (
                    <span className="text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                      ⚡ {msg.jevCategory}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Indicador de Geração da IA */}
          {isGenerating && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-none bg-[#1b2c48] border border-[#23385c] text-xs font-mono text-blue-300 shadow-lg animate-pulse">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <span>Strawberry AI analisando mercado e processando resposta...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#203455] bg-[#182740]/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Quick Action Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setInputText('Descreva minha carteira na Genial')}
                className="bg-[#1c2d4a] hover:bg-[#213558] text-blue-300 border border-blue-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-blue-400" /> Ver Custódia Genial
              </button>

              <button
                onClick={() => setInputText('Simular Trava de Baixa com PUT')}
                className="bg-[#1c2d4a] hover:bg-[#213558] text-amber-300 border border-amber-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Trava com PUT
              </button>

              <button
                onClick={() => setInputText('Comprar Straddle em BOVA11')}
                className="bg-[#1c2d4a] hover:bg-[#213558] text-emerald-300 border border-emerald-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Layers className="w-3 h-3 text-emerald-400" /> Straddle Volatilidade
              </button>

              <button
                onClick={() => setInputText('Pausar robôs no Profit Pro')}
                className="bg-[#1c2d4a] hover:bg-[#213558] text-amber-300 border border-amber-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Sliders className="w-3 h-3 text-amber-400" /> Pausar Robôs
              </button>
            </div>

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="flex items-center gap-2 bg-[#1e304f] p-2 rounded-lg border border-[#263d65] text-xs text-blue-300">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Print anexado para análise visual de IA</span>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="ml-auto text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Text Input Box */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                disabled={isGenerating}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleSendMessage()}
                placeholder={isGenerating ? "Strawberry AI está gerando resposta..." : "Pergunte sobre ações, B3, opções, carteira Genial ou robôs..."}
                className="w-full bg-[#1b2c48] border border-[#24395f] focus:border-blue-500 rounded-2xl py-3.5 pl-4 pr-24 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner disabled:opacity-60"
              />

              <div className="absolute right-2 flex items-center gap-1">
                <button
                  onClick={handleSimulatePrintUpload}
                  disabled={isGenerating}
                  title="Anexar print do Profit Pro ou TradingView"
                  className="p-2 text-gray-400 hover:text-blue-400 rounded-xl hover:bg-[#213456] transition-all disabled:opacity-40"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={isGenerating || (!inputText.trim() && !selectedImage)}
                  className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com versão da aplicação */}
        <footer className="border-t border-[#203455] bg-[#182740]/70 px-4 py-1.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span>Strawberry AI — Options & Derivatives</span>
            <span className="text-gray-400">v{APP_VERSION}</span>
          </div>
        </footer>
      </main>

      {/* Profit Pro Modal */}
      <ProfitBridgeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        robots={robots}
      />
    </div>
  );
}

export default App;
