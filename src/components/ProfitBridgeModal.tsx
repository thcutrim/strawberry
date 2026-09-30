import React from 'react';
import type { ProfitRobotStatus } from '../types';
import { X, Cpu, CheckCircle2, ShieldCheck, Activity, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  robots: ProfitRobotStatus[];
}

export const ProfitBridgeModal: React.FC<Props> = ({ isOpen, onClose, robots }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141722] border border-[#272d3f] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl glow-purple text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#272d3f] bg-[#1a1e2b]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white text-base">Status do Profit Pro Bridge</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Connection Status Card */}
          <div className="bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-300 block">Nelogica Profit DLL Conectada</span>
                <span className="text-gray-400">Ponte Local Active | Host: 127.0.0.1:8080 (WSS Encrypted)</span>
              </div>
            </div>
            <span className="bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded font-mono text-[10px]">
              0.4ms Latência
            </span>
          </div>

          {/* User Auth Token Info */}
          <div className="bg-[#1c202d] p-3 rounded-xl border border-[#2d3448] text-xs font-mono">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span>TOKEN DE CUSTÓDIA DO USUÁRIO</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-purple-300 truncate">
              usr_token_b3_8f9a2b...4d1e9 (HMAC Signed via Google OAuth)
            </div>
          </div>

          {/* Robots List */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 font-semibold uppercase">
              <span>Robôs de Automação Ativos ({robots.length})</span>
              <button className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-[11px]">
                <RefreshCw className="w-3 h-3" /> Atualizar
              </button>
            </div>

            <div className="space-y-2">
              {robots.map((robot) => (
                <div key={robot.id} className="bg-[#1a1e2b] border border-[#272d3f] p-3 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-white">{robot.name}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        robot.status === 'RUNNING'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                      }`}
                    >
                      {robot.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#262c3d] text-center font-mono text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[9px]">PNL HOJE</span>
                      <span className={robot.todayPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {robot.todayPnl >= 0 ? `+R$ ${robot.todayPnl.toFixed(2)}` : `-R$ ${Math.abs(robot.todayPnl).toFixed(2)}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">OPERAÇÕES</span>
                      <span className="text-white">{robot.totalTrades} trades</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px]">WIN RATE</span>
                      <span className="text-purple-300">{robot.winRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#272d3f] bg-[#1a1e2b] text-right">
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition-all"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
