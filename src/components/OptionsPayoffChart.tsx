import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import type { OptionStrategyData } from '../types';
import { TrendingUp, Activity, ShieldAlert } from 'lucide-react';

interface Props {
  data: OptionStrategyData;
}

export const OptionsPayoffChart: React.FC<Props> = ({ data }) => {
  // Generate curve data points around spot price
  const generateCurveData = () => {
    const minPrice = Math.floor(data.spotPrice * 0.85);
    const maxPrice = Math.ceil(data.spotPrice * 1.15);
    const step = (maxPrice - minPrice) / 30;
    const points = [];

    for (let p = minPrice; p <= maxPrice; p += step) {
      let pnl = 0;
      data.legs.forEach((leg) => {
        let legPayoff = 0;
        if (leg.type === 'CALL') {
          legPayoff = Math.max(0, p - leg.strike) - leg.premium;
        } else {
          legPayoff = Math.max(0, leg.strike - p) - leg.premium;
        }
        if (leg.action === 'SELL') {
          legPayoff = -legPayoff;
        }
        pnl += legPayoff * leg.quantity;
      });

      points.push({
        price: parseFloat(p.toFixed(2)),
        pnl: parseFloat(pnl.toFixed(2)),
      });
    }
    return points;
  };

  const chartPoints = generateCurveData();

  return (
    <div className="bg-[#141720] border border-[#262b3a] rounded-xl p-4 my-3 text-gray-200 glow-purple">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#262b3a]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h4 className="font-semibold text-sm text-white">{data.title}</h4>
          <span className="text-xs bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded-full font-mono">
            {data.underlyingAsset} @ R$ {data.spotPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
          <Activity className="w-4 h-4" />
          <span>Vol. Implícita: 28.4%</span>
        </div>
      </div>

      {/* Recharts Curve */}
      <div className="h-48 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <XAxis dataKey="price" stroke="#6b7280" fontSize={11} tickFormatter={(val) => `R$${val}`} />
            <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(val) => `R$${val}`} />
            <Tooltip
              contentStyle={{ background: '#1c202d', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
              formatter={(value: any) => [`R$ ${value}`, 'Lucro/Prejuízo']}
              labelFormatter={(label) => `Preço Ativo: R$ ${label}`}
            />
            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
            <ReferenceLine x={data.spotPrice} stroke="#8b5cf6" label={{ value: 'Spot', fill: '#a78bfa', fontSize: 10 }} />
            <Area type="monotone" dataKey="pnl" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#pnlGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Greeks Grid */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#262b3a] text-center text-xs font-mono">
        <div className="bg-[#1c202c] p-2 rounded-lg">
          <span className="text-gray-400 block text-[10px]">DELTA (Δ)</span>
          <span className="font-semibold text-purple-300">{data.greeks.delta > 0 ? `+${data.greeks.delta}` : data.greeks.delta}</span>
        </div>
        <div className="bg-[#1c202c] p-2 rounded-lg">
          <span className="text-gray-400 block text-[10px]">GAMMA (Γ)</span>
          <span className="font-semibold text-blue-300">+{data.greeks.gamma}</span>
        </div>
        <div className="bg-[#1c202c] p-2 rounded-lg">
          <span className="text-gray-400 block text-[10px]">THETA (Θ)</span>
          <span className="font-semibold text-red-400">{data.greeks.theta} R$/dia</span>
        </div>
        <div className="bg-[#1c202c] p-2 rounded-lg">
          <span className="text-gray-400 block text-[10px]">VEGA (ν)</span>
          <span className="font-semibold text-emerald-400">+{data.greeks.vega}</span>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1.5 text-amber-400">
          <ShieldAlert className="w-4 h-4" />
          <span>Lucro Máx: <strong className="text-emerald-400">R$ {data.maxProfit}</strong> | Perda Máx: <strong className="text-red-400">R$ {data.maxLoss}</strong></span>
        </div>
        <span>Breakeven: <strong className="text-white">R$ {data.breakeven.join(' / R$ ')}</strong></span>
      </div>
    </div>
  );
};
