// Interfaces
export interface Check {
  cardId: string;
  checkDate: string;
}

export interface PendingFile {
  pendingChecks: Check[];
}
