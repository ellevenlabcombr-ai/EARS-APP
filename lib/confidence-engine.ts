
export interface ConfidenceResult {
  confidenceScore: number; // 0-1
  confidenceLevel: "low" | "moderate" | "high";
  reasons: string[];
}

export const ConfidenceEngine = {
  calculate: (history: any[], currentCheckin: any): ConfidenceResult => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Data Completeness (Last 7 days)
    const idealCount = 7;
    const actualCount = history.length;
    const completeness = Math.min(1, actualCount / idealCount);
    score += completeness * 0.4;
    if (actualCount < 3) reasons.push("Volume histórico insuficiente (< 3 dias)");

    // 2. Variance Stability (Consistency)
    // Check if readiness varies wildly. High variance = lower confidence in trend.
    if (actualCount >= 3) {
        const readinessValues = history.map(h => h.readiness_score || 0);
        const mean = readinessValues.reduce((a, b) => a + b, 0) / actualCount;
        const variance = readinessValues.reduce((a, b) => a + (b - mean) ** 2, 0) / actualCount;
        const stdDev = Math.sqrt(variance);
        
        // If stdDev > 20, suspicious volatility
        const stability = Math.max(0, 1 - (stdDev / 30));
        score += stability * 0.3;
        if (stdDev > 15) reasons.push("Alta variabilidade nos dados recentes");
    } else {
        score += 0.15; // default moderate
    }

    // 3. Recency
    // If last checkin is more than 48h ago, confidence drops
    const lastDate = history.length > 0 ? new Date(history[history.length - 1].date || history[history.length-1].created_at) : new Date(0);
    const hoursSinceLast = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
    
    let recencyScore = 1;
    if (hoursSinceLast > 72) recencyScore = 0.2;
    else if (hoursSinceLast > 36) recencyScore = 0.6;
    
    score += recencyScore * 0.3;
    if (hoursSinceLast > 48) reasons.push("Dados históricos desatualizados");

    // Final Level
    let level: "low" | "moderate" | "high" = "moderate";
    if (score > 0.8) level = "high";
    else if (score < 0.4) level = "low";

    return {
      confidenceScore: Math.max(0, Math.min(1, score)),
      confidenceLevel: level,
      reasons
    };
  }
};
