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

