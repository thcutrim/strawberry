export interface OptionLeg {
  type: 'CALL' | 'PUT';
  action: 'BUY' | 'SELL';
  strike: number;
  premium: number;
  quantity: number;
}

export interface OptionStrategyData {
  title: string;
  underlyingAsset: string;
  spotPrice: number;
  legs: OptionLeg[];
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
  maxProfit: number | string;
  maxLoss: number | string;
  breakeven: number[];
}

export interface OrderTicketData {
  id: string;
  symbol: string;
  optionType: 'CALL' | 'PUT' | 'ROBOT';
  action: 'BUY' | 'SELL' | 'START_ROBOT' | 'STOP_ROBOT';
  strike?: number;
  quantity: number;
  estimatedCost: number;
  robotName?: string;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  imageUrl?: string;
  payoffWidget?: OptionStrategyData;
  orderTicketWidget?: OrderTicketData;
}

export interface ProfitRobotStatus {
  id: string;
  name: string;
  asset: string;
  status: 'RUNNING' | 'STOPPED' | 'PAUSED';
  todayPnl: number;
  totalTrades: number;
  winRate: number;
}
