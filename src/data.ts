import { Exercise, WorkoutSession } from './types';

export const EXERCISE_DATABASE: Exercise[] = [
  // Warm-ups (Duration 45-60s)
  {
    id: 'w1',
    name: 'Retração & Rotação Articular de Ombros',
    category: 'mobility',
    duration: 60,
    description: 'Mobilização escapular e circundução de ombros simulando o agarre na barra fixa para lubrificar as cápsulas articulares.',
    formTip: 'Mova os ombros em amplitude lenta e expire de forma controlada a cada rotação.',
    adaptedFor: 'Liberação sinovial e preparação dos ombros para suportar o peso na barra ou halteres.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr89Zu8O5-HjiM7xY29vFRivzJwRyb6szVG9fx6kvKZ5nlCQoVaFraEUsfXG0jyr7JoD8f1DjU0eiuLy2ciK0GmnVdmHiVg8voZU4wypG3XNFIxGNR6t5rQHzJ_Vwyg5XagqIcxevxAXQ4_Qm1SGWxlxkkwYY-mqi89D6WsELHQJ_OAGTA7IfCtzSb94VBV_VphmZ3jfY5oQQ8MQi7I5GrabJ9pGC85mndQJ8aXrbK_aogCsMxz_OYHGDBMGRwMO_0FQhksiTfZFiG',
    steps: [
      'Fique em pé com os pés afastados na largura dos ombros.',
      'Estenda os braços à frente horizontalmente e feche as mãos de forma leve.',
      'Faça movimentos circulares amplos para trás, sentindo o deslizamento das escápulas.',
      'Complete 30 segundos rotacionando para trás e inverta o sentido para frente nos 30 segundos finais.'
    ],
    donts: [
      'Evite projetar ou forçar o pescoço excessivamente para a frente (mantenha cervical neutra).',
      'Não movimente o tronco ou a pélvis; estabilize o core e mobilize apenas a articulação do ombro.'
    ],
    targetJoints: ['Ombros (Manguito Rotador)', 'Região Escapular'],
    schematicId: 'shoulders',
    videoUrl: 'https://www.youtube.com/watch?v=D6D7J637T0U'
  },
  {
    id: 'w2',
    name: 'Alongamento Spiderman com Toque no Peito',
    category: 'mobility',
    duration: 60,
    description: 'Avanço de perna com rotação do tronco, apoiando uma das mãos e abrindo o peito no solo ou cadeira.',
    formTip: 'Não force os joelhos além do limite da dor. Use uma mesa ou assento de cadeira como apoio se preferir.',
    adaptedFor: 'Abertura de quadril e descompressão da musculatura lombar protetiva.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVDLd9bCho2TyXCugMmd-L4w1_RXUC08D15GiXRBJdwHruxi5x4RSE0_fZI7RqV0F4ME3VaVvt60EWzxXNNVFpvt158I1paFS_eJ5Zje7XGxKIh69YKbm7SFEhLTtqiShD-Az2L7g_MtxpdqJEdzJOpOGxJ7fgF_MBlYIGBNAhv95GuwjQE6Jdv-ur1LAV9nh_fQn8esZRMXhea2r980wdku3XXTAr4OJ9kUuzp-5Rmx5roeeSp4mM3W3rhmnKSlkQ91YXft5k--X6',
    steps: [
      'Inicie na posição de prancha alta (ou com as mãos apoiadas em uma plataforma elevada).',
      'Dê um grande passo à frente com o pé direito, posicionando-o ao lado de fora da sua mão direita.',
      'Gire lentamente o braço direito em direção ao teto, acompanhando o movimento com o olhar.',
      'Retorne à prancha inicial e repita ritmicamente o movimento alternando os lados.'
    ],
    donts: [
      'Não permita que a coluna lombar curve-se excessivamente de maneira corcunda (arredondamento).',
      'Evite desabar o peso do joelho traseiro no solo de forma abrupta caso faça sem apoio.'
    ],
    targetJoints: ['Quadril (Flesores e Adutores)', 'Coluna Torácica'],
    schematicId: 'spiderman',
    videoUrl: 'https://www.youtube.com/watch?v=Vk_HVtEJ5sA'
  },
  {
    id: 'w3',
    name: 'Ativação do Core em Isometria Canoa (Hollow Body)',
    category: 'mobility',
    duration: 60,
    description: 'Deitado de costas no colchonete, levante levemente os ombros e pernas, mantendo a lombar 100% colada ao chão.',
    formTip: 'Mantenha o queixo próximo ao pescoço. Se estiver difícil, dobre as pernas a 90 graus.',
    adaptedFor: 'Estabilização de glúteos e ativação do abdômen profundo contra dores dorsais.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYyPUhOTW1KZlly9KFrUWH2EEevQ97G42ueIhm8F4684kMaQC8f63HZlV7KgR_bVwY-JxA9nj2l6ro3K_1UXB6iYCEMpvsSz4I2x0-bAVVCdS64qpm46RKF1Hpej1X2RNkE3ojhx7wji164KRvLhythgFurZCGGKx7H1bPTEjIHchh_zO9GoMJhyDTvHl_u4PafweVu6LofLuWI6N6-cOMLBkd4-UEHUHIDAtLyVIbmfmo4N0x6nggqYvATydYzLsnw5_Xew9dirGG',
    steps: [
      'Deite-se de barriga para cima de maneira relaxada nas costas.',
      'Pressione sua coluna lombar firmemente contra o chão para remover todo espaço vazio.',
      'Retraia o abdômen e levante os ombros e as pernas de 10 a 20 centímetros do colchonete.',
      'Estenda os braços ao longo do tronco ou atrás da cabeça, respirando curto mantendo o vácuo abdominal.'
    ],
    donts: [
      'Jamais permita que a lombar perca o contato com o chão criando um túnel/ponte (risco severo de compressão vertebral).',
      'Não puxe a nuca com as mãos para evitar forçar e tensionar a cervical.'
    ],
    targetJoints: ['Coluna Lombar (Blindagem Ativa)', 'Core Transverso'],
    schematicId: 'hollow',
    videoUrl: 'https://www.youtube.com/watch?v=YA6y5Y8Uu7Y'
  },
  // Strength & Calisthenics (Safe ranges for 40+)
  {
    id: 's1',
    name: 'Agachamento Cálice (Goblet Squat) com Halter de Casa',
    category: 'strength',
    duration: 45,
    description: 'Agachamento básico segurando firmemente um halter, kettlebell ou um galão de água à frente do peito.',
    formTip: 'Empurre os joelhos para fora na descida e transfira o vetor de força primária para os calcanhares.',
    adaptedFor: 'Fortalecimento de quadríceps com reduzida força de cisalhamento na lombar.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4NaJxVYZHHKwLhJTICsGasqL3FqnTQeh9P5c2ubMW3SsgrPIOouxsV1hyyxgMosUiKguGXVPGXZa3Si7FuEQLUW0ur-GANmE-J-UMJh5YHFOOjl0vA_mZbKffN8wP9v0PeHn3PIf_K7jzJe2_e8i7XB47i83cVLun7m1S_Ts8CZ0FkPWiqGXEhbVmJzezzCT6F24HkgEUnDFfWPilVJJ3m6WcUMIG7wAMwOUXEzwjCuutlXfdo8_YICc4NCAjDqIfFjXS6qlfGgK5',
    steps: [
      'Segure o halter ou carga contra o peito com ambas as mãos, pés um pouco além da largura dos ombros.',
      'Inicie o movimento empurrando o quadril para trás, como se fosse sentar em um banco baixo.',
      'Desça de maneira controlada, mantendo o peito vertical e os cotovelos passando por dentro dos joelhos.',
      'Empurre o chão firmemente pelos calcanhares e suba contraindo glúteos e pernas.'
    ],
    donts: [
      'Não deixe os joelhos fecharem para dentro durante o esforço (valgo dinâmico, causa instabilidade patelar).',
      'Não relaxe ou arredonde a parte baixa das costas na descida máxima.'
    ],
    targetJoints: ['Joelhos (Articulação Fêmoro-Patelar)', 'Quadril'],
    schematicId: 'squat',
    videoUrl: 'https://www.youtube.com/watch?v=mGf8G7x8fEU'
  },
  {
    id: 's2',
    name: 'Flexão de Braço sob Controle Escapular (no Solo ou Sofá)',
    category: 'strength',
    duration: 45,
    description: 'Flexão clássica de calistenia no chão ou com as mãos elevadas no sofá/parede para controle do impacto lombar.',
    formTip: 'Mantenha os cotovelos apontando 45 graus para trás para blindar os ombros de dores articulares.',
    adaptedFor: 'Construção de peitorais e tríceps em casa, ajustando o ângulo conforme cansaço do praticante.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnQL-mGqzhV5dPr1e4NYcDZH_6vDFbMFrU2MI-bDRg3hbuJi4VK9FbnTL3aMb5bo-l0ORQySjrLUw-SpwFXP1H2ARYLajPVjjmwqPm_BubC-bYEoUeyHkWM25FC_ZD1mUDoo0QKCUdy0q1YPKoNsrnCV267lHc7Ks6d42jXaXdS75BKbmks-L5ymVux5x84yaa8PNnR2PfXi2ekwXcOSx72emJXpx3THwQm2A60tU4DHX0cG_N9wOrBYzjDY7e3H2EFuYIUd-jf61w',
    steps: [
      'Apoie as mãos a uma largura ligeiramente superior à dos ombros (em prancha ou joelhos no chão).',
      'Desça o peito em direção ao ponto de apoio mantendo os braços angulados em seta (não em formato de "T").',
      'Ative as escápulas afastando-as no topo do movimento por meio de um empurrão sólido pró-escapular.',
      'Sincronize a respiração: expire no esforço de subida, inspire na descida controlada.'
    ],
    donts: [
      'Não abra os cotovelos a 90 graus em relação ao corpo (causa impacto nocivo no manguito rotador).',
      'Não desabe a gordura abdominal, perdendo a linha neutra da espinha (espinha curvada).'
    ],
    targetJoints: ['Cotovelos e Ombros', 'Esqueleto Axial Lumbar'],
    schematicId: 'pushup',
    videoUrl: 'https://www.youtube.com/watch?v=wHStJdYtBzo'
  },
  {
    id: 's3',
    name: 'Remada Unilateral com Halter ou Carga Manual',
    category: 'strength',
    duration: 45,
    description: 'Apoiado em um banco ou sofá com uma das pernas dobradas, puxe o halter lateralmente em direção ao quadril.',
    formTip: 'Mantenha as costas retas e paralelas ao solo, contraindo o músculo grande dorsal no topo por 1s.',
    adaptedFor: 'Postura ereta e proteção ativa para a região torácica.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYq0AfbEEcU-lYQbYjXk65mNCVOyVH4OhRDp_KudByVvj8wegP-239nS39yc01TRo6nR7-OkYWRPE4bZml8SNVI_umiiJycJQ7r0jTU-gMBRz0pcYwycLke2gQtF9uWyMIJcDohlxFd59oIsXw_o7ZW40laD1n8una10LAwdTRr3uC7sxwJ9L_y748UxhQFWGVWqDTU3dxEDThiy8HicYREZf11UCAiJeWMF6T-6C6u-vLrapvaZkECnqwTopRlbsjj6JaB9Q15rPP',
    steps: [
      'Apoie o joelho esquerdo e a mão esquerda em um banco firme ou sofá resistente.',
      'Com o braço direito estendido segurando o peso, mantenha a coluna totalmente reta.',
      'Puxe o peso conduzindo o cotovelo para trás e para cima, rente ao corpo, visando o bolso do quadril.',
      'Desça o peso lentamente alongando completamente as costas sem rotacionar o tronco.'
    ],
    donts: [
      'Não puxe o halter em direção ao peito com o cotovelo projetado demais (força mais o bíceps e menos a dorsal).',
      'Não gire o ombro nem torça a coluna na fase de subida máxima buscando compensar a carga.'
    ],
    targetJoints: ['Coluna Vertebral Estabilizada', 'Grande Dorsal'],
    schematicId: 'row',
    videoUrl: 'https://www.youtube.com/watch?v=f7Bf5iL3V0g'
  },
  {
    id: 's4',
    name: 'Ativação Escapular na Barra Fixa',
    category: 'strength',
    duration: 45,
    description: 'Pendurado na barra fixa, execute pequenos pulsos puxando apenas as escápulas para baixo, sem dobrar os braços.',
    formTip: 'Mantenha os cotovelos totalmente estendidos; o foco é reeducar a articulação do ombro e fortalecer a pegada.',
    adaptedFor: 'Ação preventiva definitiva contra dores nos ombros e melhora da descompressão vertebral.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr89Zu8O5-HjiM7xY29vFRivzJwRyb6szVG9fx6kvKZ5nlCQoVaFraEUsfXG0jyr7JoD8f1DjU0eiuLy2ciK0GmnVdmHiVg8voZU4wypG3XNFIxGNR6t5rQHzJ_Vwyg5XagqIcxevxAXQ4_Qm1SGWxlxkkwYY-mqi89D6WsELHQJ_OAGTA7IfCtzSb94VBV_VphmZ3jfY5oQQ8MQi7I5GrabJ9pGC85mndQJ8aXrbK_aogCsMxz_OYHGDBMGRwMO_0FQhksiTfZFiG',
    steps: [
      'Segure com firmeza a barra fixa usando uma pegada na largura dos ombros.',
      'Deixe o corpo pendurado de maneira passiva, descomprimindo a lombar.',
      'Apenas deprima os ombros, contraindo as escápulas para baixo sem flexionar os cotovelos.',
      'Sustente a contração ativa no topo por 1.5 segundo e retorne lentamente para a suspensão.'
    ],
    donts: [
      'Não dobre nem alivie o esforço estendendo e recolhendo os braços (o esforço deve ser 100% escapular).',
      'Não balance as pernas para obter impulso mecânico no movimento pendular.'
    ],
    targetJoints: ['Cintura Escapular', 'Pegada Flexora (Punhos)'],
    schematicId: 'scapular_pull',
    videoUrl: 'https://www.youtube.com/watch?v=H74S36SgT44'
  },
  {
    id: 's5',
    name: 'Remada Australiana Calistênica (Mesa ou Barra Baixa)',
    category: 'strength',
    duration: 45,
    description: 'Posicione-se embaixo de uma mesa resistente ou barra de porta colocada em altura baixa, e puxe o tronco superior.',
    formTip: 'Mantenha os calcanhares no chão e o tronco reto como uma tábua rígida durante todo o movimento.',
    adaptedFor: 'Variação espetacular de puxada horizontal para quem está destreinado na barra fixa.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnQL-mGqzhV5dPr1e4NYcDZH_6vDFbMFrU2MI-bDRg3hbuJi4VK9FbnTL3aMb5bo-l0ORQySjrLUw-SpwFXP1H2ARYLajPVjjmwqPm_BubC-bYEoUeyHkWM25FC_ZD1mUDoo0QKCUdy0q1YPKoNsrnCV267lHc7Ks6d42jXaXdS75BKbmks-L5ymVux5x84yaa8PNnR2PfXi2ekwXcOSx72emJXpx3THwQm2A60tU4DHX0cG_N9wOrBYzjDY7e3H2EFuYIUd-jf61w',
    steps: [
      'Deite-se abaixo de uma barra horizontal baixa ou uma mesa estável e firme.',
      'Segure a barra/borda com os braços estendidos, apoiando apenas os calcanhares no chão.',
      'Puxe o peito na direção da barra contraindo dorsal e trapézio secundário.',
      'Desça sob estrito plano excêntrico de velocidade, evitando relaxar o quadril.'
    ],
    donts: [
      'Não deixe o quadril desabar em uma curva côncava durante a puxada.',
      'Não puxe com o pescoço curvado tentando encontrar a barra com o queixo (risco de tensão na cervical).'
    ],
    targetJoints: ['Punho e Cotovelos', 'Dorsal e Bíceps'],
    schematicId: 'australian_row',
    videoUrl: 'https://www.youtube.com/watch?v=oV8_q9o_U2Q'
  },
  {
    id: 's6',
    name: 'Desenvolvimento de Ombros com Halteres (Sentado)',
    category: 'strength',
    duration: 45,
    description: 'Sentado em uma cadeira com as costas bem empostadas, empurre os halteres para cima de maneira controlada.',
    formTip: 'Não empurre os pesos totalmente acima da cabeça se sentir dor nos tendões dos ombros. Mantenha os cotovelos levemente à frente.',
    adaptedFor: 'Preenchimento de massa muscular segura no deltoide sem forçar a lombar.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYq0AfbEEcU-lYQbYjXk65mNCVOyVH4OhRDp_KudByVvj8wegP-239nS39yc01TRo6nR7-OkYWRPE4bZml8SNVI_umiiJycJQ7r0jTU-gMBRz0pcYwycLke2gQtF9uWyMIJcDohlxFd59oIsXw_o7ZW40laD1n8una10LAwdTRr3uC7sxwJ9L_y748UxhQFWGVWqDTU3dxEDThiy8HicYREZf11UCAiJeWMF6T-6C6u-vLrapvaZkECnqwTopRlbsjj6JaB9Q15rPP',
    steps: [
      'Sente-se com boa integridade de postura e o peito erguido contra o encosto da cadeira.',
      'Mantenha os cotovelos angulados levemente para dentro (no plano escapular, aproximadamente 30 graus).',
      'Inicie a prensa controlada estendendo os braços sem esticar ao ponto de travar os cotovelos.',
      'Retorne de forma excêntrica até a altura média do queixo e repita.'
    ],
    donts: [
      'Não arqueie ou afaste a coluna lombar de forma a criar um túnel exagerado contra o encosto.',
      'Não colida os halteres no pico central do movimento (causa desequilíbrio reflexo nos ombros).'
    ],
    targetJoints: ['Deltoide Anterior e Lateral', 'Estabilidade Torácica'],
    schematicId: 'overhead_press',
    videoUrl: 'https://www.youtube.com/watch?v=XdfA6_BvV_0'
  },
  // Cardio / High Intensity (Safe home conditioning)
  {
    id: 'c1',
    name: 'Cardio Swing com Halter ou Sacola Pesada de Casa',
    category: 'cardio',
    duration: 45,
    description: 'Movimento pendular de quadril segurando um halter ou mala de viagem segura à frente do corpo com ambas as mãos.',
    formTip: 'Dobre apenas o quadril para trás, as pernas ficam quase retas. Contraia os glúteos de forma explosiva no topo.',
    adaptedFor: 'Alta ativação metabólica e queima mitocondrial sem impacto saltador nos tornozelos.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5rAO1rA18rFeHIkg_vxO-KigU1s1CtsxvgnRby-xS49qm_kMRa4UV1dr4pK5JftkMxfuXGut94snQ_iICV3merZYImtk2_jBlcE1TPqCCtV9n5D_8aJry0VkHEoGcNiRdoh-07lATwapY0aYc4APFTDlz0w8isorwGSf3WSa8B0gZELbQskGyrwFGFuMr4vUWaw8waioL_ac96YMQTii_tSzamVyq5u1NPZzenKM-auomL_LkduiCEqamYfywAeQlvRe1IKyVozL3',
    steps: [
      'Fique de pé com as pernas abertas de forma ligeiramente superior ao quadril.',
      'Pegue o peso à frente, incline o tronco jogando o quadril para trás com a coluna ereta.',
      'Faça a extensão do quadril de maneira explosiva impulsionando o peso adiante.',
      'Os braços servem apenas como cabos estabilizadores, o motor primário são os glúteos.'
    ],
    donts: [
      'Não dobre excessivamente os joelhos simulando um agachamento clássico.',
      'Não arqueie nem flexione a coluna lombar no ponto mais baixo das repetições.'
    ],
    targetJoints: ['Articulação Sacroilíaca', 'Quadril Posterior'],
    schematicId: 'swing',
    videoUrl: 'https://www.youtube.com/watch?v=j9yXm06j_N4'
  },
  {
    id: 'c2',
    name: 'Corrida Estacionária Adaptada (Passos Rápidos)',
    category: 'cardio',
    duration: 45,
    description: 'Eleve os joelhos de forma alternada simulando uma corrida no lugar, mas sem saltar do chão.',
    formTip: 'Mantenha o peito alto e respire pelo nariz. Balance os braços na lateral ritmicamente.',
    adaptedFor: 'Melhora da eficiência de VO2 Max ideal para ambientes fechados ou apartamentos.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCfiGQLCgvAFP1_Ej9tyF3p6mPJXI3mquLtBnVifIfBOz7VTOzOEUrg6antLDWOKXJ0WEACRUN9aVOAyWb7dL08JrGwp9m-WNt8PyifU5cmrqRvqUw9vzFxcuzD1SrReze9pI6ORCH-_NtVwGLm3EL88sO35wwIdEiG35VIJeJ76jtfZWH3bKDWyVVOW_KcsA7xXurbkvfW-EvmLMpgNQXnwCcnoc4g3teNMDJqqvBDZ64sjl2B7i3I-0uB2E7tICTyrRsZRgtrjMb',
    steps: [
      'Mantenha-se ereto e balance os braços alternadamente para trás e para a frente.',
      'Comece a pedalar os calcanhares ritmicamente simulando uma corrida ágil.',
      'Eleve levemente as pernas mantendo sempre um ponto de contato firme com o solo por vez.',
      'Aumente a cadência progressivamente à medida que os batimentos sobem.'
    ],
    donts: [
      'Não aterrisse os calcanhares de forma pesada ou barulhenta.',
      'Não olhe para os seus pés inclinando perigosamente a postura.'
    ],
    targetJoints: ['Tornozelos', 'Joelhos sem impacto saltador'],
    schematicId: 'running',
    videoUrl: 'https://www.youtube.com/watch?v=0jI-f6jQ5Sg'
  },
  {
    id: 'c3',
    name: 'Alpinista Adaptado Apoiado na Cadeira',
    category: 'cardio',
    duration: 45,
    description: 'Com as mãos firmly apoiadas no assento de uma cadeira resistente encostada na parede, puxe os joelhos em direção ao peito alternadamente.',
    formTip: 'Trave os glúteos e abdômen para que o quadril não oscile para cima e para baixo.',
    adaptedFor: 'Aceleração de batimentos cardíacos com excelente descompressão lombar.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmE64Jp52Ouos9lbuSlP024Unzf9e8xQhRY4Xm1hjehynZRW9uX6kfWsQAgcRYtxyMnDp14uKujCcUu--okQnfgOum0YUaaPdRBsMd6EwEPE4ujC7N_dPXDM4bDLZaGoCTrQ0UEpzCCSDp4hXn0KeSuYmCGQBTmWU5MIEWpw50J_WtyEQBe-ScSLNSXdv97FzXC7PwcE5vrQ-QWUrWJmlKysDeOfQ_JRicFb7EjUuex6IYvy9XZdmXZp5VN1qH1jFh-8zbxcjx2tLr',
    steps: [
      'Garantindo que a cadeira esteja travada na parede, posicione as mãos no assento.',
      'Forme uma diagonal firme dos calcanhares ao topo da cabeça, mantendo o abdômen rígido.',
      'Puxe o joelho direito em direção ao peito com controle coordenado e fluido.',
      'Estenda a perna direita de volta e repita o ciclo com a perna esquerda, aumentando a cadência de forma controlada.'
    ],
    donts: [
      'Não permita que a mesa ou cadeira deslize (certifique-se do atrito ou travamento na parede).',
      'Não desabe o quadril para baixo (manter rigidez absoluta da ponte abdominal).'
    ],
    targetJoints: ['Punhos de Apoio Estabilizados', 'Integração Lombopélvica'],
    schematicId: 'climber',
    videoUrl: 'https://www.youtube.com/watch?v=x7E2vB-C7f8'
  },
  // Longevity / Breath / Recovery (Cool down 1-2min)
  {
    id: 'l1',
    name: 'Box Breathing Diafragmático de Descompressão',
    category: 'longevity',
    duration: 120,
    description: 'Deitado ou sentado, inspire pelo nariz por 4s, segure o ar por 4s, expire pela boca por 4s, mantenha os pulmões vazios por 4s.',
    formTip: 'Coloque uma das mãos na barriga e certifique-se de que ela sobe antes do peito (respiração diafragmática).',
    adaptedFor: 'Desestressamento vago-simpático completo imediato póstreino, baixando cortisol livre no sangue.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoDPxP_goy5S9tZlS9X7A6xkfww8zMfkmkvfJTKX0P9ELaCpkakwjaeqUmOVyu8TTvTzLOC2nB4KSHf3pondvZb8AY7RSXT_xJ7y1vsx9vuHPYhbei5gf3JZ0aLWogetY4I2sKuSYIjGQEhoxe7Cniv_VyTTU1CaoGEvaHHgvTup7wGLYSAWxj_cP9d7NGb6bw3gFT2YdCe-4ZX_MgnKv_yIlZI_v-ZHCeCMG3TckRQsnz5uQVanpnicLHz2mZs12BNaQoW4Dz5zDD',
    steps: [
      'Adote uma postura confortável apoiando bem as costas ou deitando-se no chão.',
      'Sincronize a inspiração pelo nariz projetando o abdômen para fora por 4 segundos.',
      'Bloqueie a glote retendo o ar de forma calma por mais 4 segundos.',
      'Esfregue o canal de expiração expirando pela boca de maneira prolongada por 4 segundos.',
      'Fique sem oxigênio residual algum por 4 segundos na pausa antes do próximo ciclo.'
    ],
    donts: [
      'Não faça respiração curta ou torácica onde os ombros sobem e descem ritmicamente.',
      'Não tencione o maxilar ou pescoço durante os períodos de retenção de oxigênio.'
    ],
    targetJoints: ['Sistema Nervoso Autônomo', 'Pulmões / Caixa Torácica de Suplementação'],
    schematicId: 'breathing',
    videoUrl: 'https://www.youtube.com/watch?v=n-Pbe9b6m64'
  }
];

export const PRESET_WORKOUTS: WorkoutSession[] = [
  {
    id: 'p1',
    title: 'Calistenia Integrada & Barras (20 min)',
    description: 'Sessão totalmente corporal focada em flexões, ativações de ombro na barra e força do core sem depender de aparelhos.',
    category: 'strength',
    totalDuration: 20,
    exercises: [
      EXERCISE_DATABASE[0], // Ombros
      EXERCISE_DATABASE[2], // Canoa
      EXERCISE_DATABASE[4], // Flexões
      EXERCISE_DATABASE[6], // Retração Barra Fixa
      EXERCISE_DATABASE[7], // Remada Australiana
      EXERCISE_DATABASE[10] // Box breathing
    ],
    estimatedCalories: 150
  },
  {
    id: 'p2',
    title: 'Halteres & Força em Casa (30 min)',
    description: 'Uso de cargas livres para ter em casa ajustadas para a estabilização muscular e preservação de miócitos rápidos.',
    category: 'strength',
    totalDuration: 30,
    exercises: [
      EXERCISE_DATABASE[0], // Ombros
      EXERCISE_DATABASE[1], // Spiderman
      EXERCISE_DATABASE[3], // Agachamento cálice halter
      EXERCISE_DATABASE[5], // Remada unilateral halter
      EXERCISE_DATABASE[8], // Desenvolvimento ombros halter
      EXERCISE_DATABASE[3], // Agachamento cálice redondo 2
      EXERCISE_DATABASE[10] // Box breathing
    ],
    estimatedCalories: 220
  },
  {
    id: 'p3',
    title: 'Queima Mitocondrial Calistênica Rápida (15 min)',
    description: 'Circuito aeróbico anaeróbico lático com baixo estresse de junta patelar para acelerar o metabolismo basal.',
    category: 'cardio',
    totalDuration: 15,
    exercises: [
      EXERCISE_DATABASE[1], // Mobilidade Spiderman
      EXERCISE_DATABASE[2], // Ativação Canoa
      EXERCISE_DATABASE[9], // Alpinista na Cadeira
      EXERCISE_DATABASE[7], // Remada Australiana
      EXERCISE_DATABASE[9], // Alpinista redondo 2
      EXERCISE_DATABASE[10] // Box breathing
    ],
    estimatedCalories: 160
  }
];

export const ARTICLES = [
  {
    id: 'art1',
    title: 'Calistenia e Barras após os 40: A Solução de Peso Corporal',
    category: 'Calistenia & Barras',
    ageLevel: 'Nível: Intermediário 40+',
    summary: 'A força relativa ao peso corporal desenvolvida na calistenia protege as articulações axiais e melhora a densidade mineral sem as compressões dos grandes pesos.',
    content: 'Manipular o próprio corpo no espaço através de suspensões em barras fixas e apoios escapulares recruta os estabilizadores profundos que as máquinas de academia costumam isolar. A suspensão vertical (barra suspensa passiva) descomprime as vértebras desgastadas pelo envelhecimento, atuando como um poderoso preventivo de hérnias discais.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCfiGQLCgvAFP1_Ej9tyF3p6mPJXI3mquLtBnVifIfBOz7VTOzOEUrg6antLDWOKXJ0WEACRUN9aVOAyWb7dL08JrGwp9m-WNt8PyifU5cmrqRvqUw9vzFxcuzD1SrReze9pI6ORCH-_NtVwGLm3EL88sO35wwIdEiG35VIJeJ76jtfZWH3bKDWyVVOW_KcsA7xXurbkvfW-EvmLMpgNQXnwCcnoc4g3teNMDJqqvBDZ64sjl2B7i3I-0uB2E7tICTyrRsZRgtrjMb'
  },
  {
    id: 'art2',
    title: 'Treinar com Halteres em Casa: Eficiência de Carga Funcional',
    category: 'Pesos Livres',
    ageLevel: 'Nível: Geral 40+',
    summary: 'Ter um par de halteres montáveis em casa permite que o praticante recrute o mesmo perfil hipertrófico do que uma academia lotada - desde que haja foco nos tempos de tensão.',
    content: 'Estudos clínicos do esporte demonstram que realizar movimentos como o Goblet Squat (agachamento cálice com halter) ou a Remada unilateral atinge um recrutamento neuromuscular de 93% em paralelo à barra olímpica clássica. A vantagem em casa é o tempo poupado, a consistência e o autoatendimento sem interrupções.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVvjExgtVN4S-OcVQrD_J9O98S2HkBMyHqBTdlY2H_w6i-yXBkDwBG00haxgStO9G_hclemlzwakHXsP6A1pS9HdGGaYUN88epK4yLEqgl6bVNEf0nmdqc5ZFBQHQOQPCEFwQCN2ZOaSe4cmwzcc5mBm1wObOabde5pfSgA7gCiUZshckja-DtIW2k0ezqhWJ7T1qWv8KwQNLtCO0C8QTFG7wP4Hk8r-Fv-flOvLitz4yCz88C8X6bI61hhGrMiOpluMb_2Wqe9Dzi'
  },
  {
    id: 'art3',
    title: 'Modulação do Cortisol pós-HIIT: Treinos Rápidos de 15 a 30 Minutos',
    category: 'Hormonal',
    ageLevel: 'Nível: Iniciante/Avançado',
    summary: 'Sessões extenuantes de mais de 1 hora podem disparar o cortisol e inibir a testosterona. Entenda a janela áurea do treino curto.',
    content: 'Estudos hormonais sugerem que após 45 minutos de treino vigoroso contínuo, a proporção de testosterona/cortisol cai vertiginosamente. Exercícios rápidos, explosivos e controlados de no máximo 30 minutos em regime intervalado geram forte estímulo hipertrófico e secreção de GH, mantendo o estresse oxidativo geral em taxas ótimas.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsUoSz4y5nwIPZkbvhuU_dZlBjTsQ9tBIInieoFSB6gMz_tTO--KKrzI_HUHOWqhSN8t1T2yDUHa9qEVFlLJ2OMu7b2ySZ4i0M9X8vb5mDpM6R566AdgSLZnbkvrBUGrDGqhlrYuHVQVu0nY0TlK-e5_wSR-GWe3jra1n_BCrJpcXGF1u2uMA08HBKMx3j5PM0Y-1vlNMnYWShw9ZjFlytMccUSDVSG5nJ_GDXjS9OvtU22rO_iSBnDxLO_QHQWYs8K2urLxPgArps'
  }
];
