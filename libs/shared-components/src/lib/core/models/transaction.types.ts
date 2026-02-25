export type TransactionType = 'ACH' | 'Card' | 'Wire';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface TransactionTypeBreakdown {
  count: number;
  volume: number;
  percentage: number;
}

export interface TransactionBreakdown {
  ach: TransactionTypeBreakdown;
  card: TransactionTypeBreakdown;
  wire: TransactionTypeBreakdown;
}

export interface SummaryBreakdown {
  totalTransactions: number;
  totalAmount: number;
  failureRate: number;
  breakdown: TransactionBreakdown;
}