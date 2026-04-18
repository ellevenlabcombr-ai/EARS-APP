/**
 * Data Safety Layer for EARS System
 * Provides utilities to normalize and validate data from backend
 */

export const DataSafety = {
  /**
   * Safely gets a string from an object, with a fallback
   */
  getString(value: any, fallback = ''): string {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return fallback;
    return String(value);
  },

  /**
   * Safely gets a number from an object, with a fallback
   */
  getNumber(value: any, fallback = 0): number {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  },

  /**
   * Safely gets an array from an object
   */
  getArray<T>(value: any): T[] {
    return Array.isArray(value) ? value : [];
  },

  /**
   * Normalizes an athlete object from Supabase
   */
  normalizeAthlete(athlete: any): any {
    if (!athlete) return null;
    return {
      ...athlete,
      id: this.getString(athlete.id),
      name: this.getString(athlete.name, 'Atleta Sem Nome'),
      status: this.getString(athlete.status, 'Inativo'),
      category: this.getString(athlete.category, 'Geral'),
      readiness_score: this.getNumber(athlete.readiness_score, 0),
      risk_level: this.getString(athlete.risk_level, 'Baixo'),
    };
  },

  /**
   * Normalizes wellness records
   */
  normalizeWellness(record: any): any {
    if (!record) return null;
    return {
      ...record,
      id: this.getString(record.id),
      athlete_id: this.getString(record.athlete_id),
      readiness_score: this.getNumber(record.readiness_score, 0),
      fatigue_level: this.getNumber(record.fatigue_level, 3),
      sleep_quality: this.getNumber(record.sleep_quality, 3),
      muscle_soreness: this.getNumber(record.muscle_soreness, 0),
      stress_level: this.getNumber(record.stress_level, 3),
      record_date: this.getString(record.record_date),
    };
  }
};
