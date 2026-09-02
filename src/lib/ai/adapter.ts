export interface AiSuggestionItem {
  suggestionId: string;
  type: 'CALIBRATION_DIMENSION' | 'GHOST_WALL_LINE' | 'OPENING_DETECTION';
  sourceDocumentId?: string;
  pageNumber?: number;
  confidence: number; // 0.0 - 1.0
  explanation: string;
  suggestedPoints?: Array<{ x: number; y: number }>;
  suggestedValue?: number;
  status: 'proposed' | 'accepted' | 'rejected';
}

export interface AiAnalyzeRequest {
  documentId?: string;
  fileUrl?: string;
  pageNumber?: number;
}

export interface AIProviderAdapter {
  analyzeDrawingSheet(req: AiAnalyzeRequest): Promise<AiSuggestionItem[]>;
}

export class GeminiAIAdapter implements AIProviderAdapter {
  private modelName: string;

  constructor(modelName: string = process.env.AI_MODEL || 'gemini-1.5-pro') {
    this.modelName = modelName;
  }

  async analyzeDrawingSheet(req: AiAnalyzeRequest): Promise<AiSuggestionItem[]> {
    // Non-binding AI proposal generation
    // Does NOT alter geometry without user explicit acceptance
    return [
      {
        suggestionId: `sug-${Date.now()}-1`,
        type: 'CALIBRATION_DIMENSION',
        confidence: 0.92,
        explanation: 'Detekována hlavní kótovací čára spodní fasády: 10.50 m',
        suggestedPoints: [
          { x: 50, y: 400 },
          { x: 750, y: 400 },
        ],
        suggestedValue: 10.5,
        status: 'proposed',
      },
      {
        suggestionId: `sug-${Date.now()}-2`,
        type: 'GHOST_WALL_LINE',
        confidence: 0.88,
        explanation: 'Detekován obvodový stěnový panel OS_VF_01 na severní straně',
        suggestedPoints: [
          { x: 50, y: 50 },
          { x: 750, y: 50 },
        ],
        status: 'proposed',
      },
    ];
  }
}

export function getAiAdapter(): AIProviderAdapter {
  return new GeminiAIAdapter();
}
