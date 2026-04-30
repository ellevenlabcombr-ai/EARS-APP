export const translateKey = (key: string, lang: string): string => {
  const normalizedKey = key.toLowerCase();
  
  const ptDict: Record<string, string> = {
    // common
    pms: 'TPM',
    flow: 'Fluxo',
    pain: 'Dor',
    regularity: 'Regularidade',
    'cycle length': 'Duração do Ciclo',
    'menarche age': 'Idade da Menarca',
    'missed periods': 'Menstruações Atrasadas',
    // Sleep
    duration: 'Duração',
    bedtime: 'Hora de Dormir',
    waketime: 'Hora de Acordar',
    quality: 'Qualidade',
    feltrested: 'Sentiu-se Descansado',
    difficultyfallingasleep: 'Dificuldade para Dormir',
    wokeupduringnight: 'Acordou Durante a Noite',
    earlyawakening: 'Acordou Muito Cedo',
    daytimesleepiness: 'Sonolência Diurna',
    sleepenvironment: 'Ambiente de Sono',
    caffeinelate: 'Cafeína Tarde',
    screentime: 'Tempo de Tela',
    stresslevel: 'Nível de Estresse',
    
    // Orthopedic
    painlevel: 'Nível de Dor',
    painlocation: 'Local da Dor',
    functionalimpact: 'Impacto Funcional',
    training: 'Treino',
    competition: 'Competição',
    dailyactivities: 'Atividades Diárias',
    functionaltests: 'Testes Funcionais',
    squat: 'Agachamento',
    jump: 'Salto',
    balance: 'Equilíbrio',
    
    // Biomechanical
    kneealignment: 'Alinhamento do Joelho',
    hipcontrol: 'Controle do Quadril',
    trunkcontrol: 'Controle do Tronco',
    depth: 'Profundidade',
    landingstability: 'Estabilidade na Aterrissagem',
    shockabsorption: 'Absorção de Impacto',
    stability: 'Estabilidade',
    control: 'Controle',
    valgus: 'Valgo',
    present: 'Presente',
    severity: 'Severidade',
    asymmetry: 'Assimetria',
    
    // Physical
    trainingload: 'Carga de Treino',
    rpe: 'PSE',
    fatigue: 'Fadiga',
    recovery: 'Recuperação',
    
    // Common
    score: 'Pontuação',
    risklevel: 'Nível de Risco',
    date: 'Data',
    notes: 'Observações',
    classification: 'Classificação',
    alerts: 'Alertas',
    
    // Neurological
    reactiontime: 'Tempo de Reação',
    coordination: 'Coordenação',
    dizziness: 'Tontura',
    
    // Psychological
    stress: 'Estresse',
    anxiety: 'Ansiedade',
    motivation: 'Motivação',
    focus: 'Foco',
    
    // Nutritional
    mealsperday: 'Refeições por Dia',
    hydrationliters: 'Hidratação (Litros)',
    supplements: 'Suplementos',
    appetite: 'Apetite',
    
    // RED-S
    energyavailability: 'Disponibilidade de Energia',
    menstrualstatus: 'Status Menstrual',
    bonehealth: 'Saúde Óssea',
    eatinghabits: 'Hábitos Alimentares',
    
    // Anthropometric
    weight: 'Peso',
    height: 'Altura',
    bodyfat: 'Gordura Corporal (%)',
    musclemass: 'Massa Muscular',
    skinfolds: 'Dobras Cutâneas',
    measurements: 'Medidas',
    chest: 'Peitoral',
    thigh: 'Coxa',
    abdomen: 'Abdômen',
    triceps: 'Tríceps',
    axillary: 'Axilar Médio',
    suprailiac: 'Suprailíaca',
    subscapular: 'Subescapular',
    hip: 'Quadril',
    neck: 'Pescoço',
    waist: 'Cintura',
    leftcalf: 'Panturrilha Esq.',
    leftthigh: 'Coxa Esq.',
    rightcalf: 'Panturrilha Dir.',
    rightthigh: 'Coxa Dir.',
    leftforearm: 'Antebraço Esq.',
    rightforearm: 'Antebraço Dir.',
    shoulders: 'Ombros',
    leftarmflexed: 'Braço Esq. Contraído',
    leftarmrelaxed: 'Braço Esq. Relaxado',
    rightarmflexed: 'Braço Dir. Contraído',
    rightarmrelaxed: 'Braço Dir. Relaxado',
    
    // Maturation
    tannerstage: 'Estágio de Tanner',
    phv: 'Pico Vel. Crescimento',
    growthvelocity: 'Velocidade Crescimento',
    
    // Menstrual
    cyclelength: 'Duração do Ciclo',
    flowduration: 'Duração do Fluxo',
    painintensity: 'Intensidade da Dor',
    symptoms: 'Sintomas',
    
    // Hydration
    urinecolor: 'Cor da Urina',
    thirstlevel: 'Nível de Sede',
    weightlossduringexercise: 'Perda de Peso',
    
    // Functional
    fmsscore: 'Score FMS',
    ybalance: 'Y-Balance Test',
    hoptest: 'Hop Test',
    
    // Dynamometry
    gripstrength: 'Força de Preensão',
    quadricepsstrength: 'Força de Quadríceps',
    hamstringstrength: 'Força de Isquiotibiais',
    
    // Postural
    headalignment: 'Alinhamento da Cabeça',
    shouldersymmetry: 'Simetria dos Ombros',
    pelvisalignment: 'Alinhamento da Pelve',
    footarch: 'Arco do Pé',
  };

  const ptVal = ptDict[normalizedKey] || ptDict[normalizedKey.replace(/\s+/g, '')];
  if (lang === "pt" && ptVal) {
    return ptVal;
  }
  
  if (lang === "en") {
    const enDict: Record<string, string> = { 
      trainingload: "Training Load", rpe: "RPE", fatigue: "Fatigue", recovery: "Recovery", score: "Score", risklevel: "Risk Level", date: "Date", notes: "Notes", classification: "Classification", alerts: "Alerts", skinfolds: "Skinfolds", measurements: "Measurements", chest: "Chest", thigh: "Thigh", abdomen: "Abdomen", triceps: "Triceps", axillary: "Axillary", suprailiac: "Suprailiac", subscapular: "Subscapular", hip: "Hip", neck: "Neck", waist: "Waist", 'left calf': "Left Calf", 'left thigh': "Left Thigh", 'right calf': "Right Calf", 'right thigh': "Right Thigh", 'left forearm': "Left Forearm", 'right forearm': "Right Forearm", shoulders: "Shoulders", pms: "PMS", flow: "Flow", pain: "Pain", regularity: "Regularity", 'cycle length': "Cycle Length", 'menarche age': "Menarche Age", 'missed periods': "Missed Periods", duration: "Duration"
    };
    const enVal = enDict[normalizedKey] || enDict[normalizedKey.replace(/\s+/g, '')];
    if (enVal) return enVal;
  }

  // Convert camelCase or snake_case to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, str => str.toUpperCase());
};

export const translateValue = (value: any, lang: string): string => {
  if (typeof value === 'boolean') return value ? (lang === 'pt' ? 'Sim' : 'Yes') : (lang === 'pt' ? 'Não' : 'No');
  if (value === null || value === undefined) return 'N/A';
  if (Array.isArray(value)) return value.map(v => translateValue(v, lang)).join(', ');
  if (typeof value === 'string') {
    if (lang !== 'pt') return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    const dict: Record<string, string> = {
      'low': 'Baixo', 'medium': 'Médio', 'high': 'Alto', 'normal': 'Normal', 'abnormal': 'Anormal', 'positive': 'Positivo', 'negative': 'Negativo', 'yes': 'Sim', 'no': 'Não', 'true': 'Sim', 'false': 'Não', 'left': 'Esquerda', 'right': 'Direita', 'bilateral': 'Bilateral', 'mild': 'Leve', 'moderate': 'Moderado', 'severe': 'Severo', 'regular': 'Regular', 'irregular': 'Irregular'
    };
    return dict[value.toLowerCase()] || (String(value).charAt(0).toUpperCase() + String(value).slice(1));
  }
  return String(value);
};
