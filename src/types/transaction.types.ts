export interface ExtractedTransactionInfo {
     amount: number | null;
     description: string | null;
     date: string | null;
}

export interface ExtractedTransactionUpdateSlots {
     targetTransactionId: string | null;
     newCategoryName: string | null;
}

export interface ExtractedTransactionFilters {
     categoryName: string | null;
     typeName: string | null;
     dateQuery: string | null;
}

export interface ParsedDateQuery {
     type: "range" | "discrete";
     ranges: {
          start: string;
          end: string;
     }[];
}
