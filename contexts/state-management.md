# State Management Strategy

## Store Type
Custom Signal-based Store

Structure:
- transactions signal
- computed: summaryBreakdown
- computed: failureRate
- action: addTransaction
- action: reconcileTransaction

---

## Idempotency Layer

Before inserting:
- Check unique transactionId
- Maintain processedTransactionSet
- Ignore duplicates

Prevents:
- Double submission
- WebSocket replay duplication
- Retry duplication

---

## Optimistic UI

1. Insert transaction with status "Pending"
2. Render immediately
3. After 3 seconds:
   - Success → mark Completed
   - Failure → rollback or mark Failed

Reconciliation logic must not trigger full UI refresh.
