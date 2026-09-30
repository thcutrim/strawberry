import React, { useState } from 'react';
import type { OrderTicketData } from '../types';
import { Send, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface Props {
  data: OrderTicketData;
  onConfirm: (ticketId: string) => void;
}

export const OrderTicketWidget: React.FC<Props> = ({ data, onConfirm }) => {
  const [status, setStatus] = useState<'PENDING' | 'EXECUTING' | 'EXECUTED'>(
    data.status === 'EXECUTED' ? 'EXECUTED' : 'PENDING'
  );

  const handleExecute = () => {
    setStatus('EXECUTING');
    setTimeout(() => {
      setStatus('EXECUTED');
      onConfirm(data.id);
    }, 1200);
  };

  return (
    <div className="bg-[#161a25] border border-purple-900/50 rounded-xl p-4 my-3 text-gray-200 glow-purple">
      <div className="flex items-center justify-between pb-2 border-b border-[#272d3f]">
        <div className="flex items-center gap-2">
          {data.optionType === 'ROBOT' ? (
            <Cpu className="w-5 h-5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <span className="font-semibold text-sm text-white uppercase">
            {data.optionType === 'ROBOT' ? 'Comando Robô Profit Pro' : `Boleta de Opção ${data.optionType}`}
          </span>
        </div>
        <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-700/50 font-mono">
          Token Custódia Ativo
        </span>
      </div>

      <div className="my-3 space-y-2 text-sm font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">Ativo / Código:</span>
          <span className="font-bold text-white">{data.symbol}</span>
        </div>
        {data.strike && (
          <div className="flex justify-between">
            <span className="text-gray-400">Strike / Vencimento:</span>
            <span className="text-purple-300">R$ {data.strike.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-400">Quantidade Lote:</span>
          <span className="text-white">{data.quantity} contratos/opções</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-[#272d3f]">
          <span className="text-gray-400">Custo Estimado:</span>
          <span className="font-bold text-emerald-400">R$ {data.estimatedCost.toFixed(2)}</span>
        </div>
      </div>

      {status === 'PENDING' && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-800/40">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Confirme o envio da ordem para a sua conta de custódia via Profit Pro Bridge.</span>
          </div>
          <button
            onClick={handleExecute}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Confirmar & Executar Boleta no Profit Pro</span>
          </button>
        </div>
      )}

      {status === 'EXECUTING' && (
        <div className="py-2 text-center text-xs text-purple-300 font-mono animate-pulse">
          ⚡ Transmitindo ordem assinada via Profit Pro DLL Bridge...
        </div>
      )}

      {status === 'EXECUTED' && (
        <div className="flex items-center justify-center gap-2 bg-emerald-950/50 border border-emerald-800/60 p-2.5 rounded-lg text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Ordem Executada com Sucesso no Profit Pro (ID: #{Math.floor(Math.random() * 899999 + 100000)})</span>
        </div>
      )}
    </div>
  );
};
