export type PatientStatus = "ativo" | "pausado" | "alta" | "inativo";

export type PlanStatus = "Vigente" | "Ajuste pendente" | "Sem plano ativo";

export type ClinicalGoal =
  | "Emagrecimento"
  | "Hipertrofia & Rendimento"
  | "Clínica Geral"
  | "SOP & Hormonal"
  | "Gestantes"
  | "Longevidade"
  | "Saúde Intestinal";

export type AttendanceMode = "Presencial no Consultório" | "Teleconsulta / Online";

export interface PatientAddress {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Patient {
  id: string;
  code: string;
  name: string;
  preferredName?: string;
  birthDate: string;
  age: number;
  gender: "Feminino" | "Masculino" | "Outro";
  cpf: string;
  occupation: string;
  maritalStatus: string;
  phone: string;
  email: string;
  address: PatientAddress;
  clinicalGoal: ClinicalGoal;
  status: PatientStatus;
  planStatus: PlanStatus;
  attendanceMode: AttendanceMode;
  lastConsultation: string;
  lastConsultationRelative?: string;
  adherence: number;
  tags?: string[];
  avatarInitials: string;
  whatsappAuto: boolean;
  patientApp: boolean;
  referralSource?: string;
  adminNotes?: string;
}

export type AppointmentStatus = "concluida" | "em_espera" | "confirmado" | "agendado";

export interface Appointment {
  id: string;
  time: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  status: AppointmentStatus;
  type: string;
  subtitle: string;
  actionLabel?: string;
  actionIcon?: string;
  actionHref?: string;
  room?: string;
  waitTime?: string;
  isNextInLine?: boolean;
}

export interface ClinicalAlert {
  id: string;
  patientName: string;
  time: string;
  message: string;
  type: "meta" | "duvida" | "exame";
  tag: string;
}

export interface ConsultationHistoryItem {
  id: string;
  title: string;
  dateTime: string;
  mode: string;
  practitioner: string;
  status: string;
}

export interface MealPlanItem {
  id: string;
  number: string;
  time: string;
  title: string;
  description: string;
  mealTag: string;
}

export interface PatientDetail extends Patient {
  executiveSummary: {
    lastConductDate: string;
    practitioner: string;
    summaryText: string;
    agreedSteps: Array<{
      title: string;
      desc: string;
    }>;
  };
  nextAppointment?: {
    date: string;
    time: string;
    mode: string;
    room: string;
    statusText: string;
  };
  metrics: {
    diaryAdherence: string;
    hydrationGoal: string;
    completedSessions: string;
  };
  consultationHistory: ConsultationHistoryItem[];
  mealPlan: MealPlanItem[];
  diaryEngagement: {
    weeklyFrequency: string;
    hydrationRate: string;
    pendingDoubts: number;
    recentMessage: string;
  };
}

export interface WizardFormData {
  fullName: string;
  preferredName: string;
  birthDate: string;
  biologicalSex: "Feminino" | "Masculino" | "Outro";
  cpf: string;
  occupation: string;
  maritalStatus: string;
  phone: string;
  whatsappAuto: boolean;
  email: string;
  patientApp: boolean;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  attendanceMode: AttendanceMode;
  primaryGoal: string;
  referralSource: string;
  adminNotes: string;
}
