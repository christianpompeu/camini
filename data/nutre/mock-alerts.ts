import { ClinicalAlert } from "@/types/nutre";

export const MOCK_CLINICAL_ALERTS: ClinicalAlert[] = [
  {
    id: "alert-1",
    patientName: "Mariana Guimarães",
    time: "10:14",
    message: "Registrou todas as 5 refeições prescritas hoje e atingiu 100% da meta hídrica (2.8L).",
    type: "meta",
    tag: "Meta Registrada",
  },
  {
    id: "alert-2",
    patientName: "Lucas Silveira",
    time: "09:12",
    message: "Enviou foto do pré-treino solicitando confirmação de substituição de frutas.",
    type: "duvida",
    tag: "Dúvida com Foto",
  },
  {
    id: "alert-3",
    patientName: "Thiago Mendonça",
    time: "08:05",
    message: "Anexou laudo de Perfil Lipídico antes da consulta agendada para 14:00.",
    type: "exame",
    tag: "Exames Anexados",
  },
];
