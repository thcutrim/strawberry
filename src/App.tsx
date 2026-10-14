import { useState, useEffect, useRef } from 'react';
import type { Message, ProfitRobotStatus, PortfolioData } from './types';
import { OptionsPayoffChart } from './components/OptionsPayoffChart';
import { OrderTicketWidget } from './components/OrderTicketWidget';
import { ProfitBridgeModal } from './components/ProfitBridgeModal';
import { PortfolioWidget } from './components/PortfolioWidget';
import { evaluateTraderIntent } from './services/jevEngine';
import {
  Send,
  Image as ImageIcon,
  Cpu,
  Bot,
  User,
  Plus,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  Wallet,
  Trash2,
  Database
} from 'lucide-react';
import { keepAliveSupabase } from './services/keepalive';

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

  const handleSendMessage = () => {
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

    // ⚡ Execute TypeSafe JEV Engine with Automated SSO Live Broker State
    const jevResult = evaluateTraderIntent(userPrompt, livePortfolio);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: jevResult.suggestedResponse,
        payoffWidget: jevResult.payoffWidget,
        orderTicketWidget: jevResult.orderTicketWidget,
        portfolioWidget: jevResult.portfolioWidget,
        jevCategory: `TypeSafe JEV: ${jevResult.questions.intent} | Confiança: ${(jevResult.questions.confidenceScore * 100).toFixed(0)}% (${jevResult.executionTimeMs}ms)`
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
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
    <div className="flex h-screen bg-[#08090c] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar Left */}
      <aside className="w-72 bg-[#10121a] border-r border-[#1f2433] flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2 py-3 mb-4 border-b border-[#1f2433]">
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
            className="w-full bg-[#161a26] hover:bg-[#1d2334] text-blue-300 border border-[#262e45] rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold transition-all mb-6"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Nova Análise de Opções</span>
          </button>

          {/* Quick Prompts */}
          <div className="space-y-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
              Ações Rápidas DE TRADING
            </span>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setInputText('Descreva minha carteira atual na Genial')}
                className="w-full text-left p-2.5 rounded-lg bg-[#141620] hover:bg-[#1c202e] border border-[#222736] text-gray-300 flex items-center gap-2 transition-all"
              >
                <Wallet className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">Ver Custódia Genial</span>
              </button>

              <button
                onClick={() => setInputText('Simular Trava de Alta em PETR4')}
                className="w-full text-left p-2.5 rounded-lg bg-[#141620] hover:bg-[#1c202e] border border-[#222736] text-gray-300 flex items-center gap-2 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Trava de Alta em PETR4</span>
              </button>

              <button
                onClick={() => setInputText('Analisar robô no Profit Pro')}
                className="w-full text-left p-2.5 rounded-lg bg-[#141620] hover:bg-[#1c202e] border border-[#222736] text-gray-300 flex items-center gap-2 transition-all"
              >
                <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Status do Robô WINV26</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profit Pro, JEV & Supabase Indicator */}
        <div className="bg-[#141722] border border-[#23293a] p-3 rounded-xl space-y-2">
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
      <main className="flex-1 flex flex-col justify-between bg-[#0e0f14] relative">
        {/* Top Header */}
        <header className="h-14 border-b border-[#1f2433] bg-[#10121a]/80 backdrop-blur-md px-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Cloudflare Access Safe
            </span>

            <span className="text-xs bg-blue-950/80 text-blue-300 border border-blue-800/60 px-2.5 py-1 rounded-full font-mono hidden sm:inline">
              ⚡ Genial API Auto-Connected (SSO Login)
            </span>

            <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-full font-mono hidden md:inline-flex items-center gap-1.5" title="Keep-alive ativo no Supabase PostgreSQL">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase Keep-Alive
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNewChat}
              title="Limpar histórico e iniciar nova conversa"
              className="bg-[#1a1e2b] hover:bg-[#23283a] text-gray-300 border border-[#2b3145] text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Limpar Histórico</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1a1e2b] hover:bg-[#23283a] text-blue-300 border border-blue-800/40 text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all hidden sm:flex"
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
                      : 'bg-[#151824] border border-[#24293a] text-gray-200 rounded-tl-none shadow-xl'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Attached Image */}
                  {msg.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-[#2b3145]">
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
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1f2433] bg-[#10121a]/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Quick Action Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setInputText('Descreva minha carteira na Genial')}
                className="bg-[#161a26] hover:bg-[#1f2538] text-blue-300 border border-blue-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-blue-400" /> Ver Custódia Genial
              </button>

              <button
                onClick={() => setInputText('Simular Trava de Baixa com PUT')}
                className="bg-[#161a26] hover:bg-[#1f2538] text-amber-300 border border-amber-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Trava com PUT
              </button>

              <button
                onClick={() => setInputText('Comprar Straddle em BOVA11')}
                className="bg-[#161a26] hover:bg-[#1f2538] text-emerald-300 border border-emerald-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Layers className="w-3 h-3 text-emerald-400" /> Straddle Volatilidade
              </button>

              <button
                onClick={() => setInputText('Pausar robôs no Profit Pro')}
                className="bg-[#161a26] hover:bg-[#1f2538] text-amber-300 border border-amber-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Sliders className="w-3 h-3 text-amber-400" /> Pausar Robôs
              </button>
            </div>

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="flex items-center gap-2 bg-[#1a1e2b] p-2 rounded-lg border border-[#2b3145] text-xs text-blue-300">
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
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pergunte sobre sua carteira Genial, opções ou robôs..."
                className="w-full bg-[#151824] border border-[#262c3e] focus:border-blue-500 rounded-2xl py-3.5 pl-4 pr-24 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              />

              <div className="absolute right-2 flex items-center gap-1">
                <button
                  onClick={handleSimulatePrintUpload}
                  title="Anexar print do Profit Pro ou TradingView"
                  className="p-2 text-gray-400 hover:text-blue-400 rounded-xl hover:bg-[#1f2435] transition-all"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() && !selectedImage}
                  className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
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
