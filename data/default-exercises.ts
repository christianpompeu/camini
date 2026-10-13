/**
 * CAMINI FORÇA — F2.1: Dados Iniciais do Catálogo de Exercícios
 * 
 * Exercícios canônicos importados da estrutura A–E existente.
 * Origem: "imported"
 * Revisão: "pending"
 * Status: "published" (disponíveis para consulta e uso, sinalizados como pendentes de conciliação)
 */

import { CatalogExercise } from "@/types/exercise";

export const DEFAULT_CATALOG_EXERCISES: CatalogExercise[] = [
  {
    id: "agachamento_goblet",
    name: "Agachamento Goblet",
    alternativeNames: ["Goblet Squat", "Agachamento com Halter no Peito"],
    description: "Agachamento frontal segurando um halter ou kettlebell junto ao peito. Excelente para controle motor e profundidade.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "squat",
    laterality: "bilateral",
    primaryMuscles: ["Quadríceps", "Glúteos"],
    secondaryMuscles: ["Core", "Panturrilhas"],
    equipment: ["dumbbell", "kettlebell"],
    measurementType: "reps",
    loadConvention: "total",
    allowedLoadConventions: ["total"],
    instructions: [
      "Segure o halter na vertical junto ao tórax, com os cotovelos apontando para baixo.",
      "Posicione os pés na largura dos ombros com as pontas levemente para fora.",
      "Inicie o movimento descendo com o quadril entre as pernas, mantendo a coluna alinhada.",
      "Desça até as coxas ficarem paralelas ao chão ou um pouco abaixo.",
      "Empurre o chão com os calcanhares e retorne à posição em pé estendendo os joelhos e quadril."
    ],
    commonErrors: [
      "Permitir que os cotovelos colidam com os joelhos travando o movimento.",
      "Curvar as costas (perda da neutralidade lombar).",
      "Deixar os calcanhares saírem do chão."
    ],
    cues: [
      "Peito aberto e cotovelos recolhidos.",
      "Joelhos acompanham a linha dos pés.",
      "Pressão firme nos calcanhares."
    ],
    media: [
      {
        id: "goblet-1",
        role: "execution_start",
        url: "/media-reference/agachamento_goblet/1.png",
        label: "Posição inicial (modelo masculino)",
        modelVariant: "male",
        availability: "available",
        orderIndex: 1,
      },
      {
        id: "goblet-2",
        role: "execution_end",
        url: "/media-reference/agachamento_goblet/2.png",
        label: "Posição final no fundo (modelo masculino)",
        modelVariant: "male",
        availability: "available",
        orderIndex: 2,
      },
      {
        id: "goblet-3",
        role: "execution_start_female",
        url: "/media-reference/agachamento_goblet/3.png",
        label: "Posição inicial (modelo feminino)",
        modelVariant: "female",
        availability: "available",
        orderIndex: 3,
      },
      {
        id: "goblet-4",
        role: "execution_end_female",
        url: "/media-reference/agachamento_goblet/4.png",
        label: "Posição final no fundo (modelo feminino)",
        modelVariant: "female",
        availability: "available",
        orderIndex: 4,
      },
      {
        id: "goblet-5",
        role: "muscle_map_female",
        url: "/media-reference/agachamento_goblet/5.png",
        label: "Mapa muscular ativo (feminino)",
        modelVariant: "female",
        availability: "available",
        orderIndex: 5,
      },
      {
        id: "goblet-6",
        role: "muscle_map",
        url: "/media-reference/agachamento_goblet/6.png",
        label: "Mapa muscular ativo (masculino)",
        modelVariant: "male",
        availability: "available",
        orderIndex: 6,
      },
      {
        id: "goblet-7",
        role: "instruction_card",
        url: "/media-reference/agachamento_goblet/7.png",
        label: "Cartão de instruções visuais",
        modelVariant: "male",
        availability: "available",
        orderIndex: 7,
      },
      {
        id: "goblet-8",
        role: "instruction_card_female",
        url: "/media-reference/agachamento_goblet/8.png",
        label: "Cartão de instruções visuais (feminino)",
        modelVariant: "female",
        availability: "available",
        orderIndex: 8,
      },
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Quadríceps, Glúteos",
  },
  {
    id: "stiff_levantamento_romeno_com_barra",
    name: "Stiff / Levantamento Romeno com barra",
    alternativeNames: ["RDL", "Romanian Deadlift", "Stiff com Barra"],
    description: "Movimento de dobradiça de quadril enfatizando o alongamento sob tensão e força da cadeia posterior.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "hinge",
    laterality: "bilateral",
    primaryMuscles: ["Posteriores de Coxa", "Glúteos"],
    secondaryMuscles: ["Lombar", "Antebraço"],
    equipment: ["barbell", "plate"],
    measurementType: "reps",
    loadConvention: "total",
    allowedLoadConventions: ["total"],
    instructions: [
      "Fique em pé segurando a barra na largura dos ombros com pegada pronada.",
      "Destrave levemente os joelhos (mantenha esse ângulo fixo durante o exercício).",
      "Empurre o quadril para trás enquanto desliza a barra rente às coxas.",
      "Desça até sentir forte tensão nos posteriores da coxa, sem arredondar as costas.",
      "Contraia os glúteos para trazer o quadril de volta para a frente."
    ],
    commonErrors: [
      "Flexionar os joelhos excessivamente transformando em agachamento.",
      "Afastar a barra das pernas sobrecarregando a lombar.",
      "Hiperestender as costas no topo do movimento."
    ],
    cues: [
      "Barra colada no corpo.",
      "Quadril empurrando a parede atrás de você.",
      "Coluna neutra do início ao fim."
    ],
    media: [
      {
        id: "stiff-1",
        role: "execution_start",
        label: "Execução RDL com barra",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Posteriores da Coxa, Glúteos",
  },
  {
    id: "avanco_reverso",
    name: "Avanço reverso",
    alternativeNames: ["Reverse Lunge", "Passada Ré", "Afundo Reverso"],
    description: "Variação unilateral de afundo dando o passo para trás, reduzindo cisalhamento anterior no joelho.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "lunge",
    laterality: "unilateral",
    primaryMuscles: ["Quadríceps", "Glúteos"],
    secondaryMuscles: ["Posteriores de Coxa", "Core"],
    equipment: ["dumbbell", "bodyweight"],
    measurementType: "reps",
    loadConvention: "total",
    allowedLoadConventions: ["total", "per_implement", "bodyweight"],
    instructions: [
      "Em pé com os pés alinhados, dê um passo amplo para trás com uma das pernas.",
      "Desça o joelho de trás em direção ao solo até formar ângulo de aproximadamente 90 graus nas duas pernas.",
      "Mantenha o tronco firme e levemente inclinado à frente para maior ativação de glúteo.",
      "Empurre com o calcanhar da perna dianteira para retornar à posição inicial."
    ],
    commonErrors: [
      "Passo curto demais causando elevação do calcanhar frontal.",
      "Bater o joelho de trás com força no chão.",
      "Desalinhamento do joelho da frente caindo para dentro (valgo dinâmico)."
    ],
    cues: [
      "Passo firme para trás.",
      "Peso distribuído no calcanhar dianteiro.",
      "Tronco sólido."
    ],
    media: [
      {
        id: "avanco-1",
        role: "execution_start",
        label: "Execução Avanço Reverso",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Quadríceps e Glúteos",
  },
  {
    id: "panturrilha_em_pe",
    name: "Panturrilha em pé",
    alternativeNames: ["Elevação de Panturrilha", "Standing Calf Raise"],
    description: "Extensão de tornozelo em pé com joelhos estendidos para recrutar principalmente o gastrocnêmio.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "isolation",
    laterality: "bilateral",
    primaryMuscles: ["Panturrilhas"],
    secondaryMuscles: [],
    equipment: ["dumbbell", "bodyweight", "plate"],
    measurementType: "reps",
    loadConvention: "total",
    allowedLoadConventions: ["total", "bodyweight"],
    instructions: [
      "Apoie as pontas dos pés em uma elevação estável.",
      "Mantenha os joelhos estendidos sem travá-los totalmente.",
      "Desça os calcanhares lentamente sentindo o alongamento da panturrilha.",
      "Empurre o solo com a base dos dedos até a contração máxima e segure por 1 segundo no topo."
    ],
    commonErrors: [
      "Fazer movimentos curtos e balançados sem amplitude completa.",
      "Dobrar os joelhos durante a subida."
    ],
    cues: [
      "Pausa de 1 segundo no alongamento e na contração máxima.",
      "Movimento controlado."
    ],
    media: [
      {
        id: "panturrilha-1",
        role: "execution_start",
        label: "Elevação de Panturrilha em Pé",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Panturrilhas",
  },
  {
    id: "prancha",
    name: "Prancha isométrica",
    alternativeNames: ["Plank", "Prancha no Solo", "Prancha Frontal"],
    description: "Exercício isométrico fundamental de antiextensão lombar e estabilidade de todo o core.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "core",
    laterality: "bilateral",
    primaryMuscles: ["Core", "Abdômen"],
    secondaryMuscles: ["Glúteos", "Deltoides"],
    equipment: ["bodyweight"],
    measurementType: "duration",
    loadConvention: "bodyweight",
    allowedLoadConventions: ["bodyweight", "additional"],
    instructions: [
      "Apoie os antebraços no solo alinhados com a largura dos ombros.",
      "Estenda as pernas para trás apoiando-se na ponta dos pés.",
      "Mantenha o corpo em uma linha reta da cabeça aos calcanhares.",
      "Contraia o abdômen e os glúteos ativamente evitando que o quadril caia.",
      "Sustente a posição respirando de forma controlada."
    ],
    commonErrors: [
      "Deixar o quadril ceder em direção ao solo (hiperlordose lombar).",
      "Elevar o quadril excessivamente em formato de triângulo.",
      "Prender a respiração durante a sustentação."
    ],
    cues: [
      "Abdômen rígido como se fosse levar um soco.",
      "Glúteos travados.",
      "Empurre o chão com os antebraços."
    ],
    media: [
      {
        id: "prancha-1",
        role: "execution_start",
        label: "Prancha Frontal Isométrica",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Core",
  },
  {
    id: "supino_no_chao_com_halteres",
    name: "Supino no chão com halteres",
    alternativeNames: ["Floor Press", "Supino de Chão", "Dumbbell Floor Press"],
    description: "Supino realizado deitado no chão, limitando a amplitude na extensão do cotovelo e protegendo a articulação glenoumeral.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "horizontal_push",
    laterality: "bilateral",
    primaryMuscles: ["Peitoral", "Tríceps"],
    secondaryMuscles: ["Deltoide Anterior"],
    equipment: ["dumbbell"],
    measurementType: "reps",
    loadConvention: "per_implement",
    allowedLoadConventions: ["per_implement", "total"],
    instructions: [
      "Deite-se no chão de costas com os joelhos flexionados e os pés apoiados no solo.",
      "Segure os halteres acima do peito com os braços estendidos.",
      "Desça os halteres de forma controlada até a parte de trás dos braços tocar suavemente o solo.",
      "Faça uma pausa breve (sem relaxar o peso) e empurre os halteres de volta para a posição inicial."
    ],
    commonErrors: [
      "Bater os cotovelos com força no chão.",
      "Abrir os cotovelos em 90 graus (deve manter cerca de 45 a 75 graus em relação ao tronco)."
    ],
    cues: [
      "Cotovelos em seta (45-60 graus).",
      "Toque suave no solo e explosão para subir.",
      "Escápulas firmes no chão."
    ],
    media: [
      {
        id: "floor-press-1",
        role: "execution_start",
        label: "Supino no Chão com Halteres",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Peitoral",
  },
  {
    id: "desenvolvimento_militar_com_barra",
    name: "Desenvolvimento militar em pé com barra",
    alternativeNames: ["Overhead Press", "OHP", "Militar com Barra"],
    description: "Desenvolvimento vertical estrito em pé, desenvolvendo força máxima de ombros, tríceps e estabilidade de tronco.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "vertical_push",
    laterality: "bilateral",
    primaryMuscles: ["Deltoides", "Deltoide Anterior"],
    secondaryMuscles: ["Tríceps", "Trapézio", "Core"],
    equipment: ["barbell", "plate"],
    measurementType: "reps",
    loadConvention: "total",
    allowedLoadConventions: ["total"],
    instructions: [
      "Posicione a barra sobre a parte superior do tórax/clavículas com pegada logo além da largura dos ombros.",
      "Pés na largura dos ombros, glúteos e abdômen fortemente contraídos.",
      "Incline a cabeça levemente para trás para a barra passar e empurre verticalmente.",
      "Ao passar a cabeça, traga a cabeça para a posição neutra e estenda totalmente os braços no topo."
    ],
    commonErrors: [
      "Hiperestender a lombar jogando o tronco excessivamente para trás.",
      "Usar impulso das pernas (transformando em Push Press).",
      "Empurrar a barra para a frente em vez de para cima."
    ],
    cues: [
      "Glúteos de pedra.",
      "Barra passa rente ao nariz.",
      "Bloqueie os cotovelos com segurança no topo."
    ],
    media: [
      {
        id: "ohp-1",
        role: "execution_start",
        label: "Desenvolvimento Militar em Pé",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Ombros",
  },
  {
    id: "flexao_de_bracos",
    name: "Flexão de braços",
    alternativeNames: ["Push-up", "Apoio no Solo"],
    description: "Empurrar horizontal com peso corporal, integrando peitoral, tríceps e estabilidade de prancha.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "horizontal_push",
    laterality: "bilateral",
    primaryMuscles: ["Peitoral", "Tríceps"],
    secondaryMuscles: ["Deltoide Anterior", "Core"],
    equipment: ["bodyweight"],
    measurementType: "reps",
    loadConvention: "bodyweight",
    allowedLoadConventions: ["bodyweight", "additional"],
    instructions: [
      "Mãos no solo ligeiramente mais largas que a largura dos ombros.",
      "Corpo reto em posição de prancha alta.",
      "Desça o peitoral até quase tocar o solo, mantendo cotovelos a 45 graus.",
      "Empurre o chão até a extensão completa dos cotovelos."
    ],
    commonErrors: [
      "Quadril caído ou muito elevado.",
      "Amplitude incompleta (não descer até o fim).",
      "Cotovelos excessivamente abertos em 90 graus."
    ],
    cues: [
      "Corpo como uma tábua rígida.",
      "Peito lidera a descida.",
      "Empurre o chão para longe."
    ],
    media: [
      {
        id: "pushup-1",
        role: "execution_start",
        label: "Flexão de Braços no Solo",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Peitoral e Tríceps",
  },
  {
    id: "elevacao_lateral_com_halteres",
    name: "Elevação lateral com halteres",
    alternativeNames: ["Lateral Raise", "Elevação Lateral"],
    description: "Isolamento do deltoide lateral para desenvolvimento de largura dos ombros.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "isolation",
    laterality: "bilateral",
    primaryMuscles: ["Deltoide Lateral"],
    secondaryMuscles: ["Trapézio"],
    equipment: ["dumbbell"],
    measurementType: "reps",
    loadConvention: "per_implement",
    allowedLoadConventions: ["per_implement"],
    instructions: [
      "Em pé com halteres ao lado do corpo e leve inclinação anterior do tronco.",
      "Cotovelos com microflexão fixa.",
      "Eleve os halteres no plano escapular até a altura dos ombros.",
      "Desça de forma controlada resistindo à gravidade."
    ],
    commonErrors: [
      "Usar impulso do tronco/lombar para subir o peso.",
      "Elevar os halteres muito acima da linha dos ombros.",
      "Girar os polegares para cima."
    ],
    cues: [
      "Pense em afastar os pesos para os lados, não apenas para cima.",
      "Cotovelos lideram a subida.",
      "Controle total na descida."
    ],
    media: [
      {
        id: "lateral-raise-1",
        role: "execution_start",
        label: "Elevação Lateral com Halteres",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Deltoide Lateral",
  },
  {
    id: "levantamento_terra_com_barra",
    name: "Levantamento terra com barra",
    alternativeNames: ["Deadlift", "Terra Convencional"],
    description: "Exercício fundamental de puxada do solo para cadeia posterior e força de corpo inteiro.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "hinge",
    laterality: "bilateral",
    primaryMuscles: ["Costas", "Posteriores de Coxa", "Glúteos"],
    secondaryMuscles: ["Trapézio", "Antebraço", "Core"],
    equipment: ["barbell", "plate"],
    measurementType: "reps",
    loadConvention: "total",
    allowedLoadConventions: ["total"],
    instructions: [
      "Barra posicionada sobre o meio dos pés, pés na largura do quadril.",
      "Incline o quadril e segure a barra logo por fora das pernas.",
      "Abaixe o quadril até as canelas tocarem a barra e ative os dorsais.",
      "Empurre o chão com os pés mantendo a barra colada ao corpo.",
      "Fique em pé ereto sem hiperestender a coluna lombar."
    ],
    commonErrors: [
      "Arredondar a coluna lombar ao retirar o peso do chão.",
      "Deixar a barra se afastar das canelas/coxas.",
      "Iniciar o movimento com o quadril muito alto ou muito baixo."
    ],
    cues: [
      "Tire a folga da barra antes de puxar.",
      "Empurre o chão como num leg press.",
      "Barra colada no corpo."
    ],
    media: [
      {
        id: "deadlift-1",
        role: "execution_start",
        label: "Levantamento Terra com Barra",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Costas e Posteriores",
  },
  {
    id: "remada_curvada_com_barra",
    name: "Remada curvada com barra",
    alternativeNames: ["Barbell Row", "Remada Curvada Pronada"],
    description: "Puxada horizontal com tronco inclinado desenvolvendo densidade de dorsais, romboides e eretores da espinha.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "horizontal_pull",
    laterality: "bilateral",
    primaryMuscles: ["Dorsais", "Costas"],
    secondaryMuscles: ["Bíceps", "Deltoide Posterior", "Lombar"],
    equipment: ["barbell", "plate"],
    measurementType: "reps",
    loadConvention: "total",
    allowedLoadConventions: ["total"],
    instructions: [
      "Segure a barra com pegada pronada na largura dos ombros.",
      "Incline o tronco à frente a aproximadamente 45 graus com coluna neutra.",
      "Puxe a barra em direção ao abdômen inferior liderando pelos cotovelos.",
      "Aperte as escápulas no topo e desça a barra de forma controlada."
    ],
    commonErrors: [
      "Balançar o tronco excessivamente para gerar impulso.",
      "Arredondar a coluna lombar.",
      "Puxar com as mãos em vez de liderar pelos cotovelos."
    ],
    cues: [
      "Puxe os cotovelos para trás e para cima.",
      "Tronco estável e fixo.",
      "Esmague as escápulas no topo."
    ],
    media: [
      {
        id: "barbell-row-1",
        role: "execution_start",
        label: "Remada Curvada com Barra",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Dorsais",
  },
  {
    id: "remada_unilateral_com_halter",
    name: "Remada unilateral com halter",
    alternativeNames: ["One-Arm Row", "Serrote", "Remada Serrote"],
    description: "Puxada horizontal unilateral com apoio, permitindo maior amplitude e foco em cada dorsal isoladamente.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "horizontal_pull",
    laterality: "unilateral",
    primaryMuscles: ["Dorsais", "Costas"],
    secondaryMuscles: ["Bíceps", "Deltoide Posterior", "Core"],
    equipment: ["dumbbell", "bench"],
    measurementType: "reps",
    loadConvention: "per_implement",
    allowedLoadConventions: ["per_implement"],
    instructions: [
      "Apoie o joelho e a mão do mesmo lado em um banco plano.",
      "Mantenha a outra perna firme no chão e coluna neutra paralela ao solo.",
      "Segure o halter com o braço estendido e puxe o cotovelo para cima e para trás rumo ao quadril.",
      "Faça pausa breve no topo e desça sentindo o alongamento da dorsal."
    ],
    commonErrors: [
      "Girar o tronco excessivamente no topo para subir mais peso.",
      "Puxar em direção ao peito em vez de em direção ao quadril.",
      "Deixar o ombro ceder e relaxar totalmente na descida."
    ],
    cues: [
      "Trajetória em arco até o bolso da calça.",
      "Tronco reto e travado.",
      "Alongue a dorsal na descida."
    ],
    media: [
      {
        id: "unilateral-row-7",
        role: "instruction_card",
        url: "/media-reference/remada_unilateral_com_halter/7.png",
        label: "Cartão visual de instruções",
        availability: "available",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Dorsais",
  },
  {
    id: "crucifixo_inverso_inclinado_com_halteres",
    name: "Crucifixo inverso inclinado com halteres",
    alternativeNames: ["Rear Delt Fly", "Crucifixo Invertido"],
    description: "Abdução horizontal de ombros com tronco inclinado para atingir o deltoide posterior e romboides.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "isolation",
    laterality: "bilateral",
    primaryMuscles: ["Deltoide Posterior"],
    secondaryMuscles: ["Trapézio", "Romboides"],
    equipment: ["dumbbell", "bench"],
    measurementType: "reps",
    loadConvention: "per_implement",
    allowedLoadConventions: ["per_implement"],
    instructions: [
      "Incline o tronco à frente ou deite-se com o peito apoiado em um banco inclinado.",
      "Segure os halteres sob o peito com palmas voltadas uma para a outra.",
      "Com cotovelos levemente flexionados, abra os braços para os lados até a linha dos ombros.",
      "Retorne lentamente controlando a descida."
    ],
    commonErrors: [
      "Usar excesso de carga e balançar o corpo.",
      "Dobrar excessivamente os cotovelos transformando em remada."
    ],
    cues: [
      "Abra os braços como asas.",
      "Concentre o esforço na parte de trás dos ombros.",
      "Descida lenta."
    ],
    media: [
      {
        id: "rear-delt-1",
        role: "execution_start",
        label: "Crucifixo Inverso com Halteres",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Deltoide Posterior",
  },
  {
    id: "rosca_direta_com_barra",
    name: "Rosca direta com barra",
    alternativeNames: ["Barbell Curl", "Rosca Bíceps com Barra"],
    description: "Flexão de cotovelos em pé com barra, clássico construtor de massa e força nos bíceps.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "isolation",
    laterality: "bilateral",
    primaryMuscles: ["Bíceps"],
    secondaryMuscles: ["Antebraço"],
    equipment: ["barbell", "plate"],
    measurementType: "reps",
    loadConvention: "total",
    allowedLoadConventions: ["total"],
    instructions: [
      "Em pé com a barra segurada na largura dos ombros com pegada supinada.",
      "Cotovelos colados junto ao tronco.",
      "Flexione os cotovelos trazendo a barra até o topo do peitoral.",
      "Desça de forma estritamente controlada até a extensão total."
    ],
    commonErrors: [
      "Jogar os cotovelos para frente tirando a tensão do bíceps.",
      "Balançar o tronco para trás (roubo lombar).",
      "Não estender o cotovelo totalmente no ponto inferior."
    ],
    cues: [
      "Cotovelos fixos no lugar.",
      "Aperte o bíceps no topo.",
      "Controle a descida."
    ],
    media: [
      {
        id: "bicep-curl-1",
        role: "execution_start",
        label: "Rosca Direta com Barra",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Bíceps",
  },
  {
    id: "desenvolvimento_com_halteres",
    name: "Desenvolvimento com halteres",
    alternativeNames: ["Dumbbell Shoulder Press", "Desenvolvimento Sentado"],
    description: "Empurrar vertical com halteres, permitindo rotação natural do punho e trabalho independente dos ombros.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "vertical_push",
    laterality: "bilateral",
    primaryMuscles: ["Deltoides", "Deltoide Anterior"],
    secondaryMuscles: ["Tríceps", "Trapézio"],
    equipment: ["dumbbell", "bench"],
    measurementType: "reps",
    loadConvention: "per_implement",
    allowedLoadConventions: ["per_implement", "total"],
    instructions: [
      "Sentado ou em pé, segure os halteres na altura das orelhas com cotovelos a 60 graus.",
      "Empurre os halteres para cima até quase se tocarem no topo.",
      "Desça com controle até a altura dos ombros/orelhas."
    ],
    commonErrors: [
      "Bater os halteres com força no topo.",
      "Arredondar a lombar.",
      "Abrir os cotovelos totalmente a 90 graus."
    ],
    cues: [
      "Suba em linha reta convergindo suavemente no topo.",
      "Controle na descida."
    ],
    media: [
      {
        id: "db-press-1",
        role: "execution_start",
        label: "Desenvolvimento com Halteres",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Ombros",
  },
  {
    id: "farmers_walk",
    name: "Farmer's Walk",
    alternativeNames: ["Caminhada do Fazendeiro", "Farmer Walk"],
    description: "Transporte de carga com halteres ou implementos pesados por distância ou tempo, excelente para pegada e core.",
    status: "published",
    version: 1,
    createdAt: 1775520000000,
    updatedAt: 1775520000000,
    movementPattern: "carry",
    laterality: "bilateral",
    primaryMuscles: ["Core", "Antebraço", "Trapézio"],
    secondaryMuscles: ["Pernas", "Glúteos"],
    equipment: ["dumbbell", "kettlebell"],
    measurementType: "distance",
    loadConvention: "per_implement",
    allowedLoadConventions: ["per_implement", "total"],
    instructions: [
      "Fique em pé com um halter pesado em cada mão ao lado do corpo.",
      "Mantenha postura ereta, peito aberto e escápulas ativas.",
      "Caminhe com passos curtos e ritmados mantendo o tronco firme e estável.",
      "Não deixe os pesos balançarem."
    ],
    commonErrors: [
      "Dar passos muito longos perdendo o equilíbrio.",
      "Deixar os ombros caírem e relaxarem para a frente.",
      "Pendular o tronco de um lado para o outro."
    ],
    cues: [
      "Postura altiva.",
      "Pegada firme e esmagadora.",
      "Passos curtos e controlados."
    ],
    media: [
      {
        id: "farmer-1",
        role: "execution_start",
        label: "Farmer's Walk com Halteres",
        availability: "pending_download",
        orderIndex: 1,
      }
    ],
    contentOrigin: "imported",
    reviewStatus: "pending",
    targetMuscles: "Core e Pegada",
  },
];
