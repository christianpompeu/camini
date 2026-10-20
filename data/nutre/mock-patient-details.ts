import { PatientDetail } from "@/types/nutre";
import { MOCK_PATIENTS } from "./mock-patients";

export const MOCK_PATIENT_DETAILS: Record<string, PatientDetail> = {
  "beatriz-nogueira": {
    ...MOCK_PATIENTS[0],
    executiveSummary: {
      lastConductDate: "14/09/2024",
      practitioner: "Profissional de demonstração",
      summaryText:
        "Paciente demonstrou excelente aceitação da rotina alimentar proposta, sem queixas gástricas recentes. Ajuste calórico gradual orientado focado no suporte ao treinamento físico habitual, com incentivo à manutenção de alimentos in natura e fracionamento regular de refeições.",
      agreedSteps: [
        {
          title: "Rotina Pós-Treino",
          desc: "Manter fonte proteica prática até 45 minutos após a atividade física.",
        },
        {
          title: "Meta de Hidratação",
          desc: "Distribuir ingestão de líquidos de forma contínua ao longo do dia (2.8L).",
        },
        {
          title: "Registro no App",
          desc: "Fotografar ou registrar refeições livres durante os finais de semana.",
        },
        {
          title: "Próximo Retorno",
          desc: "Reavaliação geral sugerida para a segunda quinzena de novembro.",
        },
      ],
    },
    nextAppointment: {
      date: "Hoje, 24 de Outubro",
      time: "11:00",
      mode: "Presencial",
      room: "Sala 02",
      statusText: "Beatriz confirmou presença via notificação do app Nutre.",
    },
    metrics: {
      diaryAdherence: "78% (Boa adesão)",
      hydrationGoal: "2.6 L / 2.8 L",
      completedSessions: "3 sessões",
    },
    consultationHistory: [
      {
        id: "c-3",
        title: "Consulta 03 (Revisão & Ajustes)",
        dateTime: "14/09/2024 às 14:30",
        mode: "Presencial (Sala 02)",
        practitioner: "Profissional de demonstração",
        status: "Finalizada",
      },
      {
        id: "c-2",
        title: "Consulta 02 (Acompanhamento Mensal)",
        dateTime: "18/07/2024 às 15:00",
        mode: "Teleconsulta",
        practitioner: "Profissional de demonstração",
        status: "Finalizada",
      },
      {
        id: "c-1",
        title: "Consulta 01 (Anamnese Inicial)",
        dateTime: "12/05/2024 às 10:00",
        mode: "Presencial (Sala 01)",
        practitioner: "Profissional de demonstração",
        status: "Finalizada",
      },
    ],
    mealPlan: [
      {
        id: "m-1",
        number: "01",
        time: "07:30",
        title: "Desjejum Matinal (Demonstrativo)",
        description:
          "Exemplo conceitual: Ovos mexidos com azeite extravirgem, pão de fermentação natural e mamão papaya com sementes de chia.",
        mealTag: "Refeição 1",
      },
      {
        id: "m-2",
        number: "02",
        time: "12:30",
        title: "Almoço Principal (Demonstrativo)",
        description:
          "Exemplo conceitual: Peito de frango grelhado ou tilápia, arroz integral, feijão carioca, salada verde abundante com folhas escuras e azeite.",
        mealTag: "Refeição 2",
      },
      {
        id: "m-3",
        number: "03",
        time: "16:30",
        title: "Lanche Intermediário & Pré-Treino (Demonstrativo)",
        description:
          "Exemplo conceitual: Iogurte natural desnatado, mix de castanhas do Pará e amêndoas, e banana prata com canela.",
        mealTag: "Refeição 3",
      },
      {
        id: "m-4",
        number: "04",
        time: "20:30",
        title: "Jantar & Recuperação Noturna (Demonstrativo)",
        description:
          "Exemplo conceitual: Omelete de legumes com espinafre e tomate, purê de abóbora cabotiá e chá de camomila ou melissa.",
        mealTag: "Refeição 4",
      },
    ],
    diaryEngagement: {
      weeklyFrequency: "5 de 7 dias",
      hydrationRate: "2.6 Litros/dia (92% da meta)",
      pendingDoubts: 1,
      recentMessage:
        "Olá, consigo manter os mesmos horários no final de semana ou devo revisar a rotina no próximo atendimento?",
    },
  },
};

export function getPatientDetail(id: string): PatientDetail | undefined {
  if (MOCK_PATIENT_DETAILS[id]) {
    return MOCK_PATIENT_DETAILS[id];
  }

  const patient = MOCK_PATIENTS.find((p) => p.id === id);

  if (!patient) return undefined;

  return {
    ...patient,
    executiveSummary: {
      lastConductDate: patient.lastConsultation,
      practitioner: "Profissional de demonstração",
      summaryText: `Paciente ${patient.name} com objetivo em ${patient.clinicalGoal}. Acompanhamento regular e boa resposta clínica às condutas propostas.`,
      agreedSteps: [
        {
          title: "Manutenção do Plano",
          desc: "Seguir fracionamento habitual com foco na qualidade dos alimentos.",
        },
        {
          title: "Hidratação Adequada",
          desc: "Meta mínima calculada em 35ml/kg ao longo do dia.",
        },
        {
          title: "Monitoramento no App",
          desc: "Registros regulares para ajuste na próxima consulta.",
        },
      ],
    },
    nextAppointment: {
      date: "24/10/2024",
      time: "14:30",
      mode: patient.attendanceMode,
      room: "Sala 02",
      statusText: "Agendamento confirmado no sistema.",
    },
    metrics: {
      diaryAdherence: `${patient.adherence}%`,
      hydrationGoal: "2.5 L / 2.8 L",
      completedSessions: "2 sessões",
    },
    consultationHistory: [
      {
        id: "c-101",
        title: "Consulta de Retorno",
        dateTime: `${patient.lastConsultation} às 10:00`,
        mode: patient.attendanceMode,
        practitioner: "Profissional de demonstração",
        status: "Finalizada",
      },
    ],
    mealPlan: [
      {
        id: "m-101",
        number: "01",
        time: "07:30",
        title: "Café da Manhã",
        description: "Opções equilibradas de macronutrientes conforme rotina matinal.",
        mealTag: "Refeição 1",
      },
      {
        id: "m-102",
        number: "02",
        time: "12:30",
        title: "Almoço Completo",
        description: "Composição variada com foco no objetivo clínico selecionado.",
        mealTag: "Refeição 2",
      },
    ],
    diaryEngagement: {
      weeklyFrequency: "4 de 7 dias",
      hydrationRate: "2.4 Litros/dia",
      pendingDoubts: 0,
      recentMessage: "Tudo certo com o plano alimentar desta semana!",
    },
  };
}
