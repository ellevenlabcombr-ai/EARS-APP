'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.athletes': 'Atletas',
    'sidebar.calendar': 'Calendário',
    'sidebar.reports': 'Relatórios',
    'sidebar.settings': 'Configurações',
    
    // TopNavigation
    'nav.search': 'Buscar atleta...',
    'nav.notifications': 'Notificações',
    'nav.profile': 'Perfil',

    // Dashboard
    'dashboard.welcome': 'Bem-vindo ao EARS',
    'dashboard.overview': 'Visão Geral',

    // AthleteList
    'athletes.title': 'Gestão de Atletas',
    'athletes.subtitle': 'Gerencie o elenco e monitore o status de cada atleta.',
    'athletes.new': 'Novo Atleta',
    'athletes.search': 'Buscar atleta...',
    'athletes.filter.all': 'Todos os Status',
    'athletes.filter.active': 'Ativo',
    'athletes.filter.medical': 'Departamento Médico',
    'athletes.filter.transition': 'Transição',
    'athletes.table.athlete': 'Atleta',
    'athletes.table.category': 'Categoria',
    'athletes.table.status': 'Status',
    'athletes.table.readiness': 'Prontidão',
    'athletes.table.actions': 'Ações',
    'athletes.viewProfile': 'Ver Perfil',

    // AthleteRegistration
    'reg.title.new': 'Novo Atleta',
    'reg.title.edit': 'Editar Atleta',
    'reg.subtitle': 'Preencha os dados para cadastrar um novo atleta no sistema.',
    'reg.save': 'Salvar Atleta',
    'reg.cancel': 'Cancelar',
    'reg.delete': 'Excluir Atleta',
    'reg.personal': 'Dados Pessoais',
    'reg.sports': 'Dados Esportivos',
    'reg.address': 'Endereço',
    'reg.medical': 'Informações Médicas',
    'reg.emergency': 'Contato de Emergência',
    'reg.name': 'Nome Completo',
    'reg.nickname': 'Apelido',
    'reg.dob': 'Data de Nascimento',
    'reg.rg': 'RG',
    'reg.gender': 'Sexo',
    'reg.gender.m': 'Masculino',
    'reg.gender.f': 'Feminino',
    'reg.gender.o': 'Outro',
    'reg.phone': 'Contato / Celular',
    'reg.email': 'Email',
    'reg.sport': 'Modalidade',
    'reg.club': 'Clube Atual',
    'reg.category': 'Categoria',
    'reg.position': 'Posição',
    'reg.weight': 'Peso (kg)',
    'reg.height': 'Altura (cm)',
    'reg.dominantSide': 'Lado Dominante',
    'reg.dominantSide.right': 'Destro',
    'reg.dominantSide.left': 'Canhoto',
    'reg.dominantSide.ambidextrous': 'Ambidestro',
    'reg.cep': 'CEP',
    'reg.street': 'Logradouro',
    'reg.number': 'Número',
    'reg.complement': 'Complemento',
    'reg.neighborhood': 'Bairro',
    'reg.city': 'Cidade',
    'reg.state': 'Estado',
    'reg.healthPlan': 'Convênio Médico',
    'reg.healthPlanCard': 'Carteirinha',
    'reg.hospital': 'Hospital de Preferência',
    'reg.hasAllergy': 'Possui Alergia?',
    'reg.allergyDesc': 'Qual alergia?',
    'reg.medication': 'Medicação Contínua',
    'reg.guardianName': 'Nome do Responsável',
    'reg.guardianCpf': 'CPF do Responsável',
    'reg.guardianPhone': 'Telefone do Responsável',
    'reg.guardianEmail': 'Email do Responsável',
    'reg.changePhoto': 'Mudar Foto',
    'reg.fullName': 'Nome Completo',
    'reg.select': 'Selecione',
    'reg.portalAccess': 'Acesso ao Portal da Atleta',
    'reg.password': 'Senha Gerada',
    'reg.generatePass': 'Gerar nova senha',
    'reg.cityState': 'Cidade / UF',
    'reg.health': 'Saúde e Convênio',
    'reg.insurance': 'Convênio Médico',
    'reg.insuranceNumber': 'Número da Carteirinha',
    'reg.allergies': 'Possui Alergias?',
    'reg.yes': 'Sim',
    'reg.no': 'Não',
    'reg.status': 'Status Clínico',
    'reg.right': 'Destro',
    'reg.left': 'Canhoto',
    'reg.guardian': 'Dados do Responsável',

    // AthleteHealthProfile
    'profile.back': 'Voltar para Lista',
    'profile.edit': 'Editar Ficha',
    'profile.tab.overview': 'Visão Geral',
    'profile.tab.ficha': 'Ficha Cadastral',
    'profile.tab.clinical': 'Avaliações & Testes',
    'profile.tab.prontuario': 'Prontuário',
    'profile.tab.history': 'Histórico',
    
    // Biomechanical Assessment
    'bio.title': 'Avaliação Biomecânica',
    
    // Physical Assessment
    'phys.title': 'Avaliação Física',
    'phys.desc': 'Composição corporal, força e potência.',
    
    // Technical Performance
    // Postural Analysis
    'postural.title': 'Análise Postural',
    'postural.desc': 'Avaliação de simetria e desvios posturais.',
    'postural.view.photos': 'Ver Fotos',
    'postural.view.technical': 'Avaliação Técnica',
    'postural.grid.show': 'Mostrar Grade',
    'postural.grid.hide': 'Ocultar Grade',
    'postural.segments.title': 'Segmentos Corporais',
    'postural.segments.head': 'Cabeça / Cervical',
    'postural.segments.shoulders': 'Ombros / Escápulas',
    'postural.segments.pelvis': 'Pelve / Quadril',
    'postural.segments.knees': 'Joelhos',
    'postural.segments.feet': 'Pés / Tornozelos',
    'postural.notes': 'Observações Clínicas',
    'func.title': 'Triagem Funcional',
    'func.desc': 'Protocolo FMS - Mecanismo de Precisão',
    'func.score.total': 'Pontuação FMS',
    'func.score.possible': 'de 21 possíveis',
    'func.risk.analysis': 'Análise de Risco',
    'func.risk.high': 'Risco Elevado',
    'func.risk.moderate': 'Risco Moderado',
    'func.risk.low': 'Baixo Risco',
    'func.focus': 'Foco Corretivo',
    'func.focus.mobility': 'Mobilidade',
    'func.focus.stability': 'Estabilidade Dinâmica',
    'func.focus.control': 'Controle Motor / Core',
    'func.alerts': 'Alertas Clínicos',
    'func.alert.pain': 'Presença de Dor (Override)',
    'func.alert.asymmetry': 'Assimetria Significativa',
    'func.alert.dysfunction': 'Disfunção Severa (Score 0)',
    'func.suggestion': 'Sugestão Clínica',
    'func.suggestion.high': 'Prioridade total em mobilidade e controle motor básico. Evitar exercícios de alta intensidade ou impacto até que os padrões fundamentais sejam restaurados.',
    'func.suggestion.moderate': 'Trabalhar assimetrias específicas identificadas nos testes unilaterais. Integrar exercícios corretivos no aquecimento.',
    'func.suggestion.low': 'Padrões de movimento sólidos. Focar em estabilidade reativa e potência específica da modalidade.',
    'func.test.deep_squat': 'Agachamento Profundo',
    'func.test.hurdle_step': 'Passo sobre Barreira',
    'func.test.inline_lunge': 'Avanço em Linha',
    'func.test.shoulder_mobility': 'Mobilidade de Ombro',
    'func.test.active_straight_leg_raise': 'Elevação de Perna Estendida',
    'func.test.trunk_stability_push_up': 'Estabilidade de Tronco',
    'func.test.rotary_stability': 'Estabilidade Rotacional',
    'func.side.left': 'Esquerda',
    'func.side.right': 'Direita',
    'func.clearing.pain': 'Teste de Dor (Clearing)',
    'func.clearing.no_pain': 'Sem Dor',
    'func.clearing.has_pain': 'Com Dor',
    'func.compensations': 'Compensações Observadas',
    'func.save': 'Finalizar Triagem',
    'func.notes.placeholder': 'Notas clínicas adicionais...',
    'dyna.title': 'Dinamometria (K-Force)',
    'dyna.desc': 'Avaliação de força isométrica e simetria.',
  },
  en: {
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.athletes': 'Athletes',
    'sidebar.calendar': 'Calendar',
    'sidebar.reports': 'Reports',
    'sidebar.settings': 'Settings',

    // TopNavigation
    'nav.search': 'Search athlete...',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',

    // Dashboard
    'dashboard.welcome': 'Welcome to EARS',
    'dashboard.overview': 'Overview',

    // AthleteList
    'athletes.title': 'Athlete Management',
    'athletes.subtitle': 'Manage the roster and monitor the status of each athlete.',
    'athletes.new': 'New Athlete',
    'athletes.search': 'Search athlete...',
    'athletes.filter.all': 'All Statuses',
    'athletes.filter.active': 'Active',
    'athletes.filter.medical': 'Medical Dept',
    'athletes.filter.transition': 'Transition',
    'athletes.table.athlete': 'Athlete',
    'athletes.table.category': 'Category',
    'athletes.table.status': 'Status',
    'athletes.table.readiness': 'Readiness',
    'athletes.table.actions': 'Actions',
    'athletes.viewProfile': 'View Profile',

    // AthleteRegistration
    'reg.title.new': 'New Athlete',
    'reg.title.edit': 'Edit Athlete',
    'reg.subtitle': 'Fill in the details to register a new athlete in the system.',
    'reg.save': 'Save Athlete',
    'reg.cancel': 'Cancel',
    'reg.delete': 'Delete Athlete',
    'reg.personal': 'Personal Details',
    'reg.sports': 'Sports Details',
    'reg.address': 'Address',
    'reg.medical': 'Medical Information',
    'reg.emergency': 'Emergency Contact',
    'reg.name': 'Full Name',
    'reg.nickname': 'Nickname',
    'reg.dob': 'Date of Birth',
    'reg.rg': 'ID (RG)',
    'reg.gender': 'Gender',
    'reg.gender.m': 'Male',
    'reg.gender.f': 'Female',
    'reg.gender.o': 'Other',
    'reg.phone': 'Phone / Mobile',
    'reg.email': 'Email',
    'reg.sport': 'Sport',
    'reg.club': 'Current Club',
    'reg.category': 'Category',
    'reg.position': 'Position',
    'reg.weight': 'Weight (kg)',
    'reg.height': 'Height (cm)',
    'reg.dominantSide': 'Dominant Side',
    'reg.dominantSide.right': 'Right-handed',
    'reg.dominantSide.left': 'Left-handed',
    'reg.dominantSide.ambidextrous': 'Ambidextrous',
    'reg.cep': 'Zip Code',
    'reg.street': 'Street',
    'reg.number': 'Number',
    'reg.complement': 'Complement',
    'reg.neighborhood': 'Neighborhood',
    'reg.city': 'City',
    'reg.state': 'State',
    'reg.healthPlan': 'Health Insurance',
    'reg.healthPlanCard': 'Insurance Card',
    'reg.hospital': 'Preferred Hospital',
    'reg.hasAllergy': 'Has Allergies?',
    'reg.allergyDesc': 'Which allergy?',
    'reg.medication': 'Continuous Medication',
    'reg.guardianName': 'Guardian Name',
    'reg.guardianCpf': 'Guardian ID (CPF)',
    'reg.guardianPhone': 'Guardian Phone',
    'reg.guardianEmail': 'Guardian Email',
    'reg.changePhoto': 'Change Photo',
    'reg.fullName': 'Full Name',
    'reg.select': 'Select',
    'reg.portalAccess': 'Athlete Portal Access',
    'reg.password': 'Generated Password',
    'reg.generatePass': 'Generate new password',
    'reg.cityState': 'City / State',
    'reg.health': 'Health and Insurance',
    'reg.insurance': 'Health Insurance',
    'reg.insuranceNumber': 'Insurance Card Number',
    'reg.allergies': 'Has Allergies?',
    'reg.yes': 'Yes',
    'reg.no': 'No',
    'reg.status': 'Clinical Status',
    'reg.right': 'Right-handed',
    'reg.left': 'Left-handed',
    'reg.guardian': 'Guardian Details',

    // AthleteHealthProfile
    'profile.back': 'Back to List',
    'profile.edit': 'Edit Profile',
    'profile.tab.overview': 'Overview',
    'profile.tab.ficha': 'Registration Form',
    'profile.tab.clinical': 'Assessments & Tests',
    'profile.tab.prontuario': 'Medical Record',
    'profile.tab.history': 'History',

    // Biomechanical Assessment
    'bio.title': 'Biomechanical Assessment',

    // Physical Assessment
    'phys.title': 'Physical Assessment',
    'phys.desc': 'Body composition, strength and power.',
    
    // Technical Performance
    // Postural Analysis
    'postural.title': 'Postural Analysis',
    'postural.desc': 'Symmetry and postural deviation assessment.',
    'postural.view.photos': 'View Photos',
    'postural.view.technical': 'Technical Evaluation',
    'postural.grid.show': 'Show Grid',
    'postural.grid.hide': 'Hide Grid',
    'postural.segments.title': 'Body Segments',
    'postural.segments.head': 'Head / Cervical',
    'postural.segments.shoulders': 'Shoulders / Scapulae',
    'postural.segments.pelvis': 'Pelvis / Hip',
    'postural.segments.knees': 'Knees',
    'postural.segments.feet': 'Feet / Ankles',
    'postural.notes': 'Clinical Notes',
    'func.title': 'Functional Screening',
    'func.desc': 'FMS Protocol - Precision Mechanism',
    'func.score.total': 'FMS Score',
    'func.score.possible': 'out of 21 possible',
    'func.risk.analysis': 'Risk Analysis',
    'func.risk.high': 'High Risk',
    'func.risk.moderate': 'Moderate Risk',
    'func.risk.low': 'Low Risk',
    'func.focus': 'Corrective Focus',
    'func.focus.mobility': 'Mobility',
    'func.focus.stability': 'Dynamic Stability',
    'func.focus.control': 'Motor Control / Core',
    'func.alerts': 'Clinical Alerts',
    'func.alert.pain': 'Presence of Pain (Override)',
    'func.alert.asymmetry': 'Significant Asymmetry',
    'func.alert.dysfunction': 'Severe Dysfunction (Score 0)',
    'func.suggestion': 'Clinical Suggestion',
    'func.suggestion.high': 'Total priority on mobility and basic motor control. Avoid high-intensity or impact exercises until fundamental patterns are restored.',
    'func.suggestion.moderate': 'Work on specific asymmetries identified in unilateral tests. Integrate corrective exercises into warm-up.',
    'func.suggestion.low': 'Solid movement patterns. Focus on reactive stability and sport-specific power.',
    'func.test.deep_squat': 'Deep Squat',
    'func.test.hurdle_step': 'Hurdle Step',
    'func.test.inline_lunge': 'Inline Lunge',
    'func.test.shoulder_mobility': 'Shoulder Mobility',
    'func.test.active_straight_leg_raise': 'Active Straight Leg Raise',
    'func.test.trunk_stability_push_up': 'Trunk Stability Push Up',
    'func.test.rotary_stability': 'Rotary Stability',
    'func.side.left': 'Left',
    'func.side.right': 'Right',
    'func.clearing.pain': 'Pain Test (Clearing)',
    'func.clearing.no_pain': 'No Pain',
    'func.clearing.has_pain': 'With Pain',
    'func.compensations': 'Observed Compensations',
    'func.save': 'Finish Screening',
    'func.notes.placeholder': 'Additional clinical notes...',
    'dyna.title': 'Dynamometry (K-Force)',
    'dyna.desc': 'Isometric strength and symmetry assessment.',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'pt' || savedLang === 'en')) {
        return savedLang;
      }
    }
    return 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
