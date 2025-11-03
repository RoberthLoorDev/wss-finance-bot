export interface ExtractedTransactionInfo {
     amount: number | null;
     description: string | null;
     date: string | null;
}

export interface ExtractedTransactionUpdateSlots {
     targetTransactionId: string | null;
     newCategoryName: string | null;
}
