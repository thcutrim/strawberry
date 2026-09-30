import { useState } from 'react';
import type { Message, ProfitRobotStatus, OptionStrategyData, OrderTicketData } from './types';
import { OptionsPayoffChart } from './components/OptionsPayoffChart';
import { OrderTicketWidget } from './components/OrderTicketWidget';
import { ProfitBridgeModal } from './components/ProfitBridgeModal';
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
  BarChart2
} from 'lucide-react';

export function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      timestamp: '19:30',
      text: 'Olá! Sou o assistente Strawberry AI especializado em Opções e Derivativos. Posso analisar suas estratégias, calcular Gregas, ler prints do Profit Pro e enviar boletas de CALL e PUT direto para sua custódia. Como posso te ajudar agora?'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleSendMessage = () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText,
      imageUrl: selectedImage || undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);

    // AI Response Simulation based on prompt keywords
    setTimeout(() => {
      const lower = userMsg.text.toLowerCase();

      let assistantText = 'Analisei sua solicitação com base nos dados em tempo real do mercado de Opções e B3.';
      let payoffData: OptionStrategyData | undefined = undefined;
      let ticketData: OrderTicketData | undefined = undefined;

      if (lower.includes('trava') || lower.includes('petr4') || lower.includes('opção')) {
        assistantText =
          ' Montei uma simulação de **Trava de Alta com CALL** em PETR4. As Gregas estão favoráveis com Delta positivo de +0.42 e Theta controlado.';
        payoffData = {
          title: 'Trava de Alta com CALL (PETR4)',
          underlyingAsset: 'PETR4',
          spotPrice: 38.5,
          legs: [
            { type: 'CALL', action: 'BUY', strike: 38.0, premium: 1.2, quantity: 100 },
            { type: 'CALL', action: 'SELL', strike: 40.0, premium: 0.45, quantity: 100 }
          ],
          greeks: { delta: 0.42, gamma: 0.08, theta: -0.15, vega: 0.22 },
          maxProfit: '75.00',
          maxLoss: '45.00',
          breakeven: [38.75]
        };

        ticketData = {
          id: 'ticket-' + Date.now(),
          symbol: 'PETR4 CALL (38.0/40.0)',
          optionType: 'CALL',
          action: 'BUY',
          strike: 38.0,
          quantity: 100,
          estimatedCost: 75.0,
          status: 'PENDING'
        };
      } else if (lower.includes('robô') || lower.includes('profit') || lower.includes('win')) {
        assistantText =
          ' O robô `ROBO_WIN_22_IRONFLOW_WAVETREND` está operando normalmente no Profit Pro. PNL acumulado no dia: **+R$ 973,00** em 124 operações.';
        ticketData = {
          id: 'ticket-robot-' + Date.now(),
          symbol: 'WINV26 (Mini-Índice)',
          optionType: 'ROBOT',
          action: 'START_ROBOT',
          robotName: 'ROBO_WIN_22_IRONFLOW_WAVETREND',
          quantity: 1,
          estimatedCost: 0.0,
          status: 'PENDING'
        };
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: assistantText,
        payoffWidget: payoffData,
        orderTicketWidget: ticketData
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
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

  return (
    <div className="flex h-screen bg-[#0a0b0e] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar Left */}
      <aside className="w-72 bg-[#10121a] border-r border-[#1f2433] flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2 py-3 mb-4 border-b border-[#1f2433]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              🍓
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-none">Strawberry AI</h1>
              <span className="text-[10px] text-purple-400 font-mono">Options & Derivatives</span>
            </div>
          </div>

          {/* New Chat Button */}
          <button className="w-full bg-[#181b26] hover:bg-[#202535] text-purple-300 border border-[#2b3145] rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold transition-all mb-6">
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Nova Análise de Opções</span>
          </button>

          {/* Quick Prompts */}
          <div className="space-y-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
              Ações Rápidas DE TRADING
            </span>

            <div className="space-y-1.5 text-xs">
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

              <button
                onClick={() => setInputText('Calcular Gregas de BOVA11')}
                className="w-full text-left p-2.5 rounded-lg bg-[#141620] hover:bg-[#1c202e] border border-[#222736] text-gray-300 flex items-center gap-2 transition-all"
              >
                <BarChart2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">Calcular Gregas de BOVA11</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profit Pro Sync Indicator */}
        <div className="bg-[#141722] border border-[#23293a] p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Profit Pro Bridge
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full text-center text-purple-400 hover:text-purple-300 text-xs font-mono font-medium underline"
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
            <span className="text-xs text-gray-400 font-mono hidden sm:inline">
              User Token Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1a1e2b] hover:bg-[#23283a] text-purple-300 border border-purple-800/40 text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Profit Pro Bridge</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-600/50 flex items-center justify-center text-xs font-bold text-purple-200">
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-900/40 border border-purple-700/50 text-purple-100 rounded-tr-none'
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

                {/* Embedded Payoff Chart Widget */}
                {msg.payoffWidget && <OptionsPayoffChart data={msg.payoffWidget} />}

                {/* Embedded Order Ticket Widget */}
                {msg.orderTicketWidget && (
                  <OrderTicketWidget data={msg.orderTicketWidget} onConfirm={handleTicketConfirm} />
                )}

                <span className="text-[10px] text-gray-500 font-mono px-1 block">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1f2433] bg-[#10121a]/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Quick Action Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setInputText('Simular Trava de Baixa com PUT')}
                className="bg-[#181b28] hover:bg-[#202538] text-purple-300 border border-purple-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3 text-purple-400" /> Trava com PUT
              </button>

              <button
                onClick={() => setInputText('Comprar Straddle em BOVA11')}
                className="bg-[#181b28] hover:bg-[#202538] text-emerald-300 border border-emerald-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Layers className="w-3 h-3 text-emerald-400" /> Straddle Volatilidade
              </button>

              <button
                onClick={() => setInputText('Pausar robôs no Profit Pro')}
                className="bg-[#181b28] hover:bg-[#202538] text-amber-300 border border-amber-800/40 px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1 transition-all"
              >
                <Sliders className="w-3 h-3 text-amber-400" /> Pausar Robôs
              </button>
            </div>

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="flex items-center gap-2 bg-[#1a1e2b] p-2 rounded-lg border border-[#2b3145] text-xs text-purple-300">
                <ImageIcon className="w-4 h-4 text-purple-400" />
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
                placeholder="Pergunte sobre opções, peça uma trava ou acione uma boleta..."
                className="w-full bg-[#151824] border border-[#262c3e] focus:border-purple-500 rounded-2xl py-3.5 pl-4 pr-24 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
              />

              <div className="absolute right-2 flex items-center gap-1">
                <button
                  onClick={handleSimulatePrintUpload}
                  title="Anexar print do Profit Pro ou TradingView"
                  className="p-2 text-gray-400 hover:text-purple-400 rounded-xl hover:bg-[#1f2435] transition-all"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() && !selectedImage}
                  className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
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
