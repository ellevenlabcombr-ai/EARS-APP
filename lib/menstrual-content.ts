
export interface PhaseAdvice {
  title: string;
  description: string;
  whatHappens: string;
  nutrition: string[];
  hydration: string;
  training: string;
  intensity: 'low' | 'moderate' | 'high' | 'peak';
  color: string;
  emoji: string;
}

export const CYCLE_PHASES: Record<string, PhaseAdvice> = {
  menstrual: {
    title: "Fase Menstrual",
    description: "Início do seu ciclo (Dias 1-5)",
    whatHappens: "O revestimento do útero está sendo descartado. Os níveis de estrogênio e progesterona estão nos pontos mais baixos. Você pode se sentir mais cansada e com cólicas.",
    nutrition: [
      "Alimentos ricos em Ferro (carnes vermelhas, espinafre, feijão)",
      "Vitamina C para absorção de ferro",
      "Magnésio para reduzir cólicas (cacau, sementes)"
    ],
    hydration: "Beba água morna ou chás (gengibre ou camomila) para relaxar a musculatura uterina.",
    training: "Foco em recuperação ativa, alongamento e mobilidade. Evite treinos de altíssima intensidade se houver dor.",
    intensity: 'low',
    color: "rose",
    emoji: "🩸"
  },
  follicular: {
    title: "Fase Folicular",
    description: "Preparação e Energia (Dias 6-13)",
    whatHappens: "Os níveis de estrogênio começam a subir. Seu corpo está preparando um óvulo. Sua energia e humor costumam melhorar significativamente.",
    nutrition: [
      "Proteínas magras para construção muscular",
      "Carboidratos complexos (aveia, batata doce)",
      "Alimentos fermentados (iogurte, kefir)"
    ],
    hydration: "Hidratação padrão focada na reposição de eletrólitos conforme o volume de treino.",
    training: "Ótima fase para ganho de força e treinos de alta intensidade. Sua resistência está em alta.",
    intensity: 'high',
    color: "emerald",
    emoji: "🌱"
  },
  ovulatory: {
    title: "Fase Ovulatória",
    description: "Pico de Performance (Dias 14-16)",
    whatHappens: "Pico de estrogênio e liberação do óvulo. Você está no seu ápice de força, mas os ligamentos podem estar mais relaxados (maior risco de lesão articular).",
    nutrition: [
      "Fibras e vegetais crucíferos (brócolis, couve)",
      "Gorduras boas (abacate, nozes)",
      "Antioxidantes (frutas vermelhas)"
    ],
    hydration: "Aumente ligeiramente o consumo de água, pois a temperatura corporal começa a subir.",
    training: "Picos de potência e velocidade. Atenção redobrada à estabilidade e técnica para proteger os ligamentos.",
    intensity: 'peak',
    color: "amber",
    emoji: "✨"
  },
  luteal: {
    title: "Fase Lútea",
    description: "Manutenção e Atenção (Dias 17-28)",
    whatHappens: "A progesterona domina. A temperatura corporal sobe e o metabolismo acelera. Pode haver retenção de líquido e flutuações de humor (TPM).",
    nutrition: [
      "Complexo B (ovos, grãos integrais)",
      "Evite excesso de sal para reduzir retenção",
      "Alimentos ricos em triptofano (banana, aveia) para o humor"
    ],
    hydration: "Aumente a ingestão hídrica em 500ml/dia. O corpo está retendo mais e a temperatura média é maior.",
    training: "Treinos de endurance/resistência são bem aceitos. Evite recordes de carga. O corpo demora mais para resfriar.",
    intensity: 'moderate',
    color: "indigo",
    emoji: "🌙"
  }
};
