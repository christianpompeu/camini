import type { WizardFormData } from "@/types/nutre";

export const NUTRE_DRAFT_STORAGE_KEY = "nutre:demo-registration:draft";
export const NUTRE_PATIENT_STORAGE_PREFIX = "nutre:demo-patient:";

export const DEMO_WIZARD_FIXTURE: WizardFormData = {
  fullName: "Paciente de Demonstração",
  preferredName: "Paciente Demo",
  birthDate: "1995-05-14",
  biologicalSex: "Feminino",
  cpf: "000.000.000-00",
  phone: "(00) 00000-0000",
  email: "paciente.demo@example.invalid",
  responsibleName: "",
  responsibleCpf: "",
  primaryGoal: "Organização da rotina alimentar",
  associatedTreatment: "Acompanhamento nutricional demonstrativo",
  treatmentStatus: "Proposta demonstrativa",
  tags: ["Primeiro atendimento", "Demonstração"],
  reportedConditions: "Nenhuma condição informada neste cadastro demonstrativo.",
  attendanceLocation: "Unidade demonstrativa",
  cep: "00000-000",
  street: "Rua de Demonstração",
  number: "100",
  complement: "Sala demonstrativa",
  neighborhood: "Bairro exemplo",
  city: "Cidade exemplo",
  state: "SP",
  photoName: "",
  adminNotes: "Observação cadastral fictícia, sem conteúdo clínico.",
  preferredChannels: ["E-mail"],
  appointmentReminders: true,
  optionalServices: ["Retorno estendido"],
  optionalPackages: [],
};

export interface StoredDemoPatient {
  id: string;
  createdAt: string;
  temporary: true;
  data: WizardFormData;
}

export function demoPatientStorageKey(id: string) {
  return `${NUTRE_PATIENT_STORAGE_PREFIX}${id}`;
}
