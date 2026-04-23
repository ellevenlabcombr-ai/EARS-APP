
export type TrendStatus = "improving" | "stable" | "worsening";

export interface TrendAnalysis {
  painTrend: TrendStatus;
  sleepTrend: TrendStatus;
  readinessTrend: TrendStatus;
  loadTrend: TrendStatus;
  trendScore: number; // -1 (very bad) to +1 (very good)
}

export const TrendEngine = {
  /**
   * Calculates the slope of a series using basic linear regression (least squares).
   * Positive slope = Increasing.
   */
  calculateSlope: (values: number[]): number => {
    const n = values.length;
    if (n < 2) return 0;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
        const x = i;
        const y = values[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    }

    const denom = (n * sumX2 - sumX * sumX);
    if (denom === 0) return 0;

    return (n * sumXY - sumX * sumY) / denom;
  },

  classifyTrend: (slope: number, threshold: number = 0.1, inverted: boolean = false): TrendStatus => {
    const effectiveSlope = inverted ? -slope : slope;
    if (effectiveSlope > threshold) return "improving";
    if (effectiveSlope < -threshold) return "worsening";
    return "stable";
  },

  analyze: (history: any[]): TrendAnalysis => {
    const painValues = history.map(h => {
        if (h.pain_map) return Math.max(...h.pain_map.map((p: any) => p.level), 0);
        return h.muscle_soreness || 0;
    });
    const sleepValues = history.map(h => h.sleep_hours || 8);
    const loadValues = history.map(h => h.session_load || 0);
    const readinessValues = history.map(h => h.readiness_score || 0);

    const painSlope = TrendEngine.calculateSlope(painValues);
    const sleepSlope = TrendEngine.calculateSlope(sleepValues);
    const loadSlope = TrendEngine.calculateSlope(loadValues);
    const readinessSlope = TrendEngine.calculateSlope(readinessValues);

    // Classification (Note: Higher pain is worsening, so inverted=true)
    const painStatus = TrendEngine.classifyTrend(painSlope, 0.2, true); 
    const sleepStatus = TrendEngine.classifyTrend(sleepSlope, 0.2, false);
    const loadStatus = TrendEngine.classifyTrend(loadSlope, 50, false); // Load usually has larger numbers
    const readinessStatus = TrendEngine.classifyTrend(readinessSlope, 1, false);

    // Calculate aggregated trend score (-1 to 1)
    let totalScore = 0;
    const weights = { pain: 0.4, sleep: 0.2, load: 0.1, readiness: 0.3 };

    const statusToScore = (status: TrendStatus) => {
        if (status === "improving") return 1;
        if (status === "worsening") return -1;
        return 0;
    };

    totalScore += statusToScore(painStatus) * weights.pain;
    totalScore += statusToScore(sleepStatus) * weights.sleep;
    totalScore += statusToScore(readinessStatus) * weights.readiness;
    
    // Load is tricky: improving load might be "increasing" but "worsening" risk.
    // Let's assume improving = stable or slightly up. Worsening = heavy spike.
    totalScore += (loadSlope > 100 ? -1 : 0) * weights.load;

    return {
      painTrend: painStatus,
      sleepTrend: sleepStatus,
      readinessTrend: readinessStatus,
      loadTrend: loadSlope > 100 ? "worsening" : (loadSlope < -100 ? "improving" : "stable"),
      trendScore: Math.max(-1, Math.min(1, totalScore))
    };
  }
};
