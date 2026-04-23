
export interface DecayedMetrics {
  weightedPain: number;
  weightedSleep: number;
  weightedLoad: number;
  weightedReadiness: number;
}

export const DecayEngine = {
  /**
   * Applies exponential-like decay to a series of values.
   * Higher index = more recent.
   * Formula: weight = e^(-lambda * days_ago)
   */
  calculateWeightedValue: (values: number[], lambda: number = 0.5): number => {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];

    let totalWeight = 0;
    let weightedSum = 0;

    // We assume the last element is the most recent (Today)
    const reversed = [...values].reverse(); // Today, Yesterday, Day Before...

    reversed.forEach((val, index) => {
      const weight = Math.exp(-lambda * index);
      weightedSum += val * weight;
      totalWeight += weight;
    });

    return weightedSum / totalWeight;
  },

  /**
   * Processes a history of records to provide weighted averages for core metrics.
   */
  processHistory: (history: any[]): DecayedMetrics => {
    const painValues = history.map(h => {
        if (h.pain_map && Array.isArray(h.pain_map)) {
            return Math.max(...h.pain_map.map((p: any) => p.level), 0);
        }
        return h.muscle_soreness || 0;
    });
    const sleepValues = history.map(h => h.sleep_hours || 8);
    const loadValues = history.map(h => h.session_load || 0);
    const readinessValues = history.map(h => h.readiness_score || 100);

    return {
      weightedPain: DecayEngine.calculateWeightedValue(painValues),
      weightedSleep: DecayEngine.calculateWeightedValue(sleepValues),
      weightedLoad: DecayEngine.calculateWeightedValue(loadValues),
      weightedReadiness: DecayEngine.calculateWeightedValue(readinessValues)
    };
  }
};
