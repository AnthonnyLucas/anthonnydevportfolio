export const skills = [
  { label: 'Java', cat:'linguagens', icon:'☕' }, { label:'Python',cat:'linguagens',icon:'⌘' }, { label:'C',cat:'linguagens',icon:'{ }' },
  { label:'C++',cat:'linguagens',icon:'C+' }, { label:'C#',cat:'linguagens',icon:'C♯' },{ label:'JavaScript',cat:'linguagens',icon:'JS' },
  { label:'PHP',cat:'linguagens',icon:'PHP' },{ label:'Ruby',cat:'linguagens',icon:'Rb' },{ label:'HTML & CSS',cat:'linguagens',icon:'</>' },
  { label:'React',cat:'frameworks',icon:'⚛' },{ label:'Angular',cat:'frameworks',icon:'A' },{ label:'Node.js',cat:'frameworks',icon:'⬡' },
  { label:'Spring Boot',cat:'frameworks',icon:'♨' },{ label:'Django',cat:'frameworks',icon:'dj' },
  { label:'Docker',cat:'infra',icon:'▣' },{ label:'Kubernetes',cat:'infra',icon:'⎈' },{ label:'Git',cat:'infra',icon:'◇' },
  { label:'DevOps',cat:'infra',icon:'∞' },{ label:'Cloud',cat:'infra',icon:'☁' },
  { label:'MQTT',cat:'iot',icon:'⌁' },{ label:'LoRa',cat:'iot',icon:'◉' },{ label:'LoRaWAN',cat:'iot',icon:'◉' },
  { label:'MySQL',cat:'iot',icon:'▤' },{ label:'SQL Server',cat:'iot',icon:'▤' },{ label:'Power BI',cat:'iot',icon:'▥' },
];
export const certificateCategories = [
  'Todas', 'Inteligência Artificial', 'Desenvolvimento', 'IoT & Indústria',
  'Gestão & Agile', 'Dados & BI', 'Nuvem & Segurança', 'Inovação', 'Educação & Idiomas'
];

// Imagens reais foram incluídas somente para documentos enviados e sem marcação de uso restrito.
// Os documentos do Startup Way têm marcação Confidencial/Informação Interna: não serão exibidos publicamente.
// Outras imagens podem ser cadastradas no painel sem alterar o código.
export const certificates = [
  {id:'cert-facti-visao',name:'Inteligência Artificial aplicada à Visão Computacional',org:'Facti · Programa MCTI Futuro',hours:'240 horas',type:'Curso concluído',group:'Inteligência Artificial',description:'Formação em inteligência artificial e processamento de informações visuais, voltada ao desenvolvimento de soluções tecnológicas.',image:''},
  {id:'cert-virtus-algoritmos',name:'Estruturas de Dados e Algoritmos para o Desenvolvimento de Hardware',org:'VIRTUS',hours:'30 horas',type:'Capacitação',group:'Desenvolvimento',description:'Estudo de algoritmos, análise de complexidade e estruturas de dados aplicadas a soluções computacionais.',image:''},
  {id:'cert-enap-iot',name:'Internet das Coisas (IoT) aplicada para resolução de desafios',org:'Enap',hours:'25 horas',type:'Curso concluído',group:'IoT & Indústria',description:'Conceitos de conectividade, IoT, segurança e uso de sistemas conectados na resolução de problemas.',image:''},
  {id:'cert-virtus-sensores',name:'Fundamentos das Plataformas de Sensoriamento Inteligente para Indústria',org:'VIRTUS',hours:'20 horas',type:'Capacitação',group:'IoT & Indústria',description:'Fundamentos de sensores, protocolos de comunicação, dados e segurança em plataformas industriais.',image:''},
  {id:'cert-enap-cloud',name:'Administration of Government Cloud Services',org:'Enap',hours:'30 horas',type:'Curso concluído',group:'Nuvem & Segurança',description:'Fundamentos de computação em nuvem, infraestrutura, segurança e gestão de serviços digitais.',image:''},
  {id:'cert-enap-scrum',name:'Scrum in the Context of the Public Sector',org:'Enap',hours:'30 horas',type:'Curso concluído',group:'Gestão & Agile',description:'Princípios do Scrum, responsabilidades, planejamento e colaboração na organização do trabalho.',image:''},
  {id:'cert-sebrae-catalisa',name:'Early Stage – 2ª Etapa Catalisa ICT Jr.',org:'Sebrae Pernambuco',hours:'70 horas',type:'Participação em programa',group:'Inovação',description:'Participação em iniciativa de empreendedorismo, pesquisa e desenvolvimento de soluções inovadoras.',image:'/assets/certificates/catalisa-ict.webp'},
  {id:'cert-sebrae-startup-way',name:'Startup Way – 4ª etapa Early Stage',org:'Sebrae Pernambuco',hours:'30 horas',type:'Participação em workshop',group:'Inovação',description:'Workshop com atividades de planejamento de inovação, prototipação e mentoria.',image:''},
  {id:'cert-enap-agile',name:'Agile in the Context of the Public Sector',org:'Enap',hours:'15 horas',type:'Curso concluído',group:'Gestão & Agile',description:'Fundamentos do movimento ágil e sua aplicação a processos e projetos colaborativos.',image:''},
  {id:'cert-enap-lideranca',name:'Personal Management – Basis of Leadership',org:'Enap',hours:'50 horas',type:'Curso concluído',group:'Gestão & Agile',description:'Gestão pessoal, desenvolvimento comportamental e fundamentos de liderança.',image:''},
  {id:'cert-wiseup-ingles',name:'Formação em Língua Inglesa',org:'Wise Up Online',hours:'Pelo menos 250 horas',type:'40 módulos concluídos',group:'Educação & Idiomas',description:'Estudos de língua inglesa relevantes para comunicação e acesso a conteúdos profissionais e técnicos.',image:''},
  {id:'cert-tetra-powerbi',name:'Dashboards no Power BI',org:'Tetra Educação',hours:'8 horas',type:'Participação em curso',group:'Dados & BI',description:'Introdução à organização e visualização de dados por meio de dashboards no Power BI.',image:''},
  {id:'cert-empowerdata-bi',name:'Acelerador de Carreira com Power BI',org:'Empowerdata',hours:'8 horas',type:'Participação em evento',group:'Dados & BI',description:'Contato com análise de dados, inteligência de negócios e possibilidades profissionais da área.',image:''},
  {id:'cert-tetra-ia',name:'Imersão IA Revolution',org:'Tetra Educação',hours:'8 horas',type:'Participação em imersão',group:'Inteligência Artificial',description:'Atividade de imersão em temas e aplicações de inteligência artificial.',image:''},
  {id:'cert-enap-metodologias',name:'Metodologias Ativas',org:'Enap',hours:'25 horas',type:'Curso concluído',group:'Educação & Idiomas',description:'Conceitos e planejamento de práticas de aprendizagem ativa em contextos educacionais.',image:''},
  {id:'cert-evento-html',name:'Introdução ao Desenvolvimento Web com HTML e CSS',org:'22ª Semana Nacional de Ciência e Tecnologia',hours:'3h30',type:'Oficina',group:'Desenvolvimento',description:'Oficina introdutória sobre tecnologias fundamentais para criação de páginas web.',image:'/assets/certificates/html-css.webp'},
  {id:'cert-evento-fibras',name:'Fibras Ópticas: Aplicações em Sistemas de Comunicação e Sensoriamento',org:'22ª Semana Nacional de Ciência e Tecnologia',hours:'4 horas',type:'Oficina',group:'IoT & Indústria',description:'Workshop sobre tecnologias ópticas aplicadas à comunicação de dados e ao sensoriamento.',image:'/assets/certificates/fibra-optica.webp'},
  {id:'cert-evento-wazuh',name:'Wazuh: Segurança Digital de Alta Performance com Baixo Custo',org:'22ª Semana Nacional de Ciência e Tecnologia',hours:'1 hora',type:'Palestra',group:'Nuvem & Segurança',description:'Palestra sobre proteção e monitoramento de ambientes computacionais com Wazuh.',image:'/assets/certificates/wazuh.webp'}
];

// Estudos e trabalhos já abordados no planejamento do portfólio.
// Textos descritivos: sem resultados, clientes, links ou tecnologias não confirmadas.
// Estes itens são editáveis no painel depois que a Netlify Blobs estiver ativa.
export const showcaseProjects = [
  {
    id:'seed-smart-solar-home', title:'Smart Solar Home', category:'IoT',
    description:'Proposta de automação residencial com sensores IoT para monitoramento de ambientes, controle de dispositivos e melhor aproveitamento da geração de energia solar.',
    tags:['Internet das Coisas','Automação residencial','Energia solar'],
    image:'/assets/project-solar.svg', repository:'', demo:'', featured:true
  },
  {
    id:'seed-aqua', title:'Projeto AQUA', category:'IoT',
    description:'Iniciativa acadêmica relacionada à aplicação de tecnologia em contextos de tratamento e monitoramento de água, aproximando computação e desafios reais de infraestrutura.',
    tags:['Tecnologia aplicada','Monitoramento','Água'],
    image:'/assets/project-aqua.svg', repository:'', demo:'', featured:false
  },
  {
    id:'seed-certificates', title:'Automação de Certificados', category:'Dados',
    description:'Solução em Python para utilizar dados de planilhas na criação de certificados personalizados e apoiar a automação do envio por e-mail.',
    tags:['Python','Pandas','Pillow','Automação'],
    image:'/assets/project-certificates.svg', repository:'', demo:'', featured:false
  },
  {
    id:'seed-curves', title:'Explorador de Curvas Paramétricas', category:'Dados',
    description:'Interface de visualização matemática com curvas em 2D e 3D, controles de animação e ajustes de velocidade para experiências interativas.',
    tags:['Python','Visualização 2D/3D','Interface interativa'],
    image:'/assets/project-curves.svg', repository:'', demo:'', featured:false
  }
];
