import { RedactionState } from './types';

export const getPendingRedactionsCount = (s: RedactionState) =>
  Object.values(s.pending).reduce((sum, list) => sum + (list?.length ?? 0), 0);

export const hasPendingRedactions = (s: RedactionState) =>
  Object.values(s.pending).some((list) => (list?.length ?? 0) > 0);
