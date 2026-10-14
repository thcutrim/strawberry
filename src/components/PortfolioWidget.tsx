import React from 'react';
import type { PortfolioData } from '../types';
import { Wallet, ShieldCheck, ArrowUpRight, ArrowDownRight, RefreshCw, PieChart } from 'lucide-react';

interface Props {
  data: PortfolioData;
}

export const PortfolioWidget: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[#141724] border border-blue-900/40 rounded-xl p-4 my-3 text-gray-200 glow-blue">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232a3d]">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-400" />
          <div>
            <h4 className="font-semibold text-sm text-white">Posição de Custódia — {data.broker}</h4>
            <span className="text-[11px] text-gray-400 font-mono">Conta: #{data.accountNumber}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-full text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Genial API Sincronizada</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 text-xs font-mono">
        <div className="bg-[#1b202e] p-2.5 rounded-lg border border-[#273044]">
          <span className="text-gray-400 block text-[10px]">PATRIMÔNIO TOTAL</span>
          <span className="font-bold text-white text-sm">R$ {data.totalPatrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#1b202e] p-2.5 rounded-lg border border-[#273044]">
          <span className="text-gray-400 block text-[10px]">SALDO EM CONTA</span>
          <span className="font-bold text-emerald-400 text-sm">R$ {data.cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#1b202e] p-2.5 rounded-lg border border-[#273044]">
          <span className="text-gray-400 block text-[10px]">GARANTIA ALOCADA</span>
          <span className="font-bold text-amber-300 text-sm">R$ {data.allocatedMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#1b202e] p-2.5 rounded-lg border border-[#273044]">
          <span className="text-gray-400 block text-[10px]">RESULTADO HOJE</span>
          <span className={`font-bold text-sm flex items-center gap-0.5 ${data.todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data.todayPnl >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            R$ {data.todayPnl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Assets Table */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-semibold">
          <span className="flex items-center gap-1">
            <PieChart className="w-3.5 h-3.5 text-blue-400" /> Ativos em Custódia ({data.items.length})
          </span>
          <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-amber-400" /> Cotações em Tempo Real
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#1a1e2c] text-gray-400 border-b border-[#282f42]">
                <th className="p-2">Ativo</th>
                <th className="p-2">Tipo</th>
                <th className="p-2 text-right">Qtd</th>
                <th className="p-2 text-right">Preço MPE</th>
                <th className="p-2 text-right">Atual</th>
                <th className="p-2 text-right">Lucro/Prejuízo</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-b border-[#232839] hover:bg-[#1f2435] transition-all">
                  <td className="p-2 font-bold text-white">{item.symbol}</td>
                  <td className="p-2">
                    <span className="bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] px-1.5 py-0.5 rounded">
                      {item.assetType}
                    </span>
                  </td>
                  <td className="p-2 text-right text-gray-200">{item.quantity}</td>
                  <td className="p-2 text-right text-gray-400">R$ {item.avgPrice.toFixed(2)}</td>
                  <td className="p-2 text-right text-blue-300">R$ {item.currentPrice.toFixed(2)}</td>
                  <td className={`p-2 text-right font-bold ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.pnl >= 0 ? `+R$ ${item.pnl.toFixed(2)}` : `-R$ ${Math.abs(item.pnl).toFixed(2)}`} ({item.pnlPercent > 0 ? `+${item.pnlPercent}%` : `${item.pnlPercent}%`})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
