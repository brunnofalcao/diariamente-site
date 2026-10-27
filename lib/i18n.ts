export type Lang = "pt" | "es";

export const TEASER: Record<Lang, string[]> = {
  pt: [
    "O que você está adiando que, no fundo, já sabe que precisa decidir?",
    "Se hoje fosse a única chance de começar, você começaria, ou esperaria estar pronto?",
    "O que você faria diferente se ninguém estivesse olhando o resultado?",
    "Qual conversa você está evitando que mudaria o seu próximo ano?",
    "O que te trouxe até aqui é o mesmo que vai te levar adiante?",
    "Onde você está confundindo conforto com segurança?",
    "O que você constrói quando ninguém te cobra nada?",
  ],
  es: [
    "¿Qué estás postergando que, en el fondo, ya sabes que necesitas decidir?",
    "Si hoy fuera la única oportunidad de empezar, ¿empezarías o esperarías a estar listo?",
    "¿Qué harías diferente si nadie estuviera mirando el resultado?",
    "¿Qué conversación estás evitando que cambiaría tu próximo año?",
    "¿Lo que te trajo hasta aquí es lo mismo que te va a llevar adelante?",
    "¿Dónde estás confundiendo comodidad con seguridad?",
    "¿Qué construyes cuando nadie te exige nada?",
  ],
};

export const I18N = {
  pt: {
    locale: "pt-BR",
    navHow: "Como funciona", navApp: "O app", navScience: "Base científica", navPrice: "Preço",
    cta: "Quero meu acesso", cta2: "Ver como funciona",
    new: "NOVO", badge: "Disponível na App Store e no Google Play",
    h1: "Três minutos por dia. Um ano inteiro de volta.",
    lead: "Uma provocação por dia que termina numa ação possível ainda hoje. Quando você faltar, o Diariamente não cobra: ele te espera. Porque interromper não significa abandonar.",
    proof: "+5.000 pessoas já começaram · Garantia de 7 dias",
    phoneAlt: "Tela Hoje do app Diariamente",
    cardEyebrow: "Provocação do dia", cardSub: "Sua vez. O que você vai fazer com isso?",
    share: "Compartilhar", copied: "Link copiado!", dayOf: "Dia {n} de 365",
    s1: "pessoas já começaram", s2: "provocações, uma por dia", s3: "é o que o ritual pede",
    s4n: "7 dias", s4: "de garantia, sem letra miúda",
    tr1: "Realização Science Play®", tr2: "Pagamento seguro via Hotmart", tr4: "Dados protegidos · LGPD",
    pEyebrow: "O ciclo que você conhece", pH2: "Você já começou. Mais de uma vez.",
    p1: "Baixou o app. Prometeu que dessa vez ia até o fim. Parou na segunda semana. E a vida engoliu o resto.",
    p2: "O problema nunca foi disciplina. É que ninguém te deu um sistema para continuar: só conteúdo. E conteúdo parado não muda ninguém.",
    p3: "O inimigo não é a falta de motivação. É o abandono silencioso. O Diariamente foi construído no ponto exato onde você costuma parar.",
    vEyebrow: "Agora imagine o contrário",
    vText: "Chegar ao fim do ano sem ter faltado com a pessoa mais importante: você. Um dia de cada vez, sem recomeçar do zero toda segunda.",
    photoAlt: "Mesa de um dia comum ao amanhecer, com caderno aberto e café",
    hH2: "O ritual diário em três movimentos.",
    hSub: "Sempre a mesma estrutura. O que muda é o texto, e o que você faz com ele.",
    steps: [
      ["Provocação", "Um texto curto que interrompe o automático. Todo dia, um só. Sem antecipar, sem acumular."],
      ["Reflexão", "Uma pergunta honesta, sem resposta pronta. Sua vez: o que você vai fazer com isso?"],
      ["Ação", "Uma decisão possível ainda hoje. Você registra, leva para o dia e volta amanhã."],
    ],
    cEyebrow: "Em volta do ritual: a volta", cNum: "37 voltas", cMeta: "desde 4 de agosto · 1 dia fora",
    cP: "O contador não conta dias seguidos: conta quantas vezes você voltou. Ele nunca zera. Faltar um dia não apaga o que você já construiu.",
    cL1: "ausência: fica visível, não apaga", cL2: "a volta depois dela", cL3: "hoje",
    aEyebrow: "O que tem dentro", aH2: "Construído para a volta, não para a perfeição.",
    t1t: "Hoje", t1d: "A provocação do dia, limpa. Nada compete pela sua atenção.",
    t2t: "Dias", t2d: "Os dias em que você veio. E os que não veio, sem alarme e sem culpa.",
    t3t: "Ações", t3d: "A reflexão vira tarefa concreta. Pensar vira fazer.",
    t4t: "Ritmo", t4d: "Suas voltas acumuladas e o lembrete diário no WhatsApp.",
    // Texto alternativo das telas da seção "O app" e do fim da página: as
    // artes da App Store (telasDo, mais abaixo). Primeiro a legenda que está
    // desenhada na arte, depois o texto alternativo da loja.
    t1alt: "Saúde mental todo dia. Três minutos para ler, refletir e agir. Tela Hoje do Diariamente com a data, o anel Seu dia e a provocação do dia.",
    t2alt: "Seu ano em leituras. Dias lidos, favoritos e dias para recuperar. Calendário Dias com os dias lidos, recuperados e os favoritos.",
    t3alt: "Da reflexão à ação. Escolha um passo possível para fazer ainda hoje. Cartão Sua vez com uma ação escrita, a opção Vou fazer marcada e o dia Hoje escolhido.",
    t4alt: "Constância sem culpa. Voltas que nunca zeram e uma meta que você escolhe. Tela Ritmo com voltas acumuladas, semanas em ritmo e a meta da semana.",
    finAlt: "Uma provocação por dia. Uma citação, uma pergunta e um texto curto para refletir. Leitura em modo foco com a citação, a pergunta do dia e o texto de reflexão.",
    oneH: "Um dia por vez. De propósito.",
    oneP1: "Quando dá para consumir tudo de uma vez, o domingo de empolgação come o ano inteiro e a segunda-feira fica sem nada. Aqui você tem o dia de hoje. Inteiro, sem pressa de terminar.",
    oneP2: "São 365 textos por ano, um para cada dia. No ano seguinte, na mesma data, um texto novo.",
    oneStrong: "O Diariamente é diário. Você não precisa ser.",
    scH2: "Construído a partir de princípios consistentes com a ciência do comportamento.",
    scP1: "O ritual segue o que a pesquisa sobre formação de hábitos e autorregulação descreve: repetir a mesma resposta num contexto recorrente pode favorecer que ela se torne automática, e transformar intenção em plano concreto pode aumentar a probabilidade de agir.",
    scP2: "As referências sustentam afirmações sobre o fenômeno, não sobre o produto. Não existe número mágico de dias, e ninguém pode prometer prazo. O Diariamente não trata, não diagnostica e não substitui acompanhamento profissional.",
    refs: [
      ["NÍVEL A · REVISÃO", "Hábito se forma repetindo a mesma resposta em um contexto recorrente.", "Wood & Rünger (2016). Psychology of Habit. Annual Review of Psychology, 67."],
      ["NÍVEL A · META-ANÁLISE", "Não existe número universal de dias para formar um hábito; a variação é ampla.", "Singh et al. (2024). Time to Form a Habit. Healthcare, 12(23). 20 estudos."],
      ["NÍVEL A · META-ANÁLISE", "Transformar intenção em plano concreto de quando, onde e como aumenta a probabilidade de agir.", "Gollwitzer & Sheeran (2006). Implementation intentions. Adv. Exp. Social Psychology, 38. 94 testes."],
    ],
    spT: "Realização Science Play®",
    spD: "Empresa de educação em saúde com clientes em mais de 95 países. Conteúdo autoral, assinado pela marca.",
    spLink: "Sobre o Diariamente →",
    belief: "Interromper não é abandonar. Perder um dia não é perder uma jornada. Constância não é nunca cair: é continuar voltando.",
    beliefP: "Ninguém aqui lê sozinho. O texto de hoje é o mesmo para todo mundo, no mesmo dia. Você não precisa alcançar ninguém. É só voltar.",
    yesL: "É pra você se",
    yes: ["Já tentou e largou outros apps de hábito ou journals", "Quer mudança real, mas precisa de um sistema que te segure", "Prefere constância a surto de motivação"],
    noL: "Não é pra você se",
    no: ["Procura solução mágica da noite pro dia", "Não está disposto a três minutos por dia", "Quer só mais um PDF pra estante digital"],
    prEyebrow: "Acesso anual", prH2: "Comece hoje. Volte amanhã.",
    prSub: "Menos que um café por semana, por um ano inteiro de prática.",
    vaEyebrow: "O que entra no seu acesso", vaH3: "Um sistema, não um arquivo que você baixa e esquece.",
    v1t: "Uma provocação por dia, os 365 dias do ano", v1d: "Sem antecipar e sem acumular. Três minutos e o dia está cumprido.",
    v2t: "Calendário de constância", v2d: "Os dias em que você veio ficam visíveis. Você para de achar e passa a saber.",
    v3t: "Menu Ações", v3d: "A provocação vira tarefa concreta, com prazo. Refletir sem agir não muda nada.",
    v4t: "Contador de voltas", v4d: "Cada dia que você volta conta. Faltou um dia? A contagem continua de onde parou.",
    v5t: "Lembrete diário no WhatsApp", v5d: "O app não espera você lembrar dele. Ele chega no horário que você escolher.",
    v6t: "Acesso imediato por e-mail", v6d: "Confirmou o pagamento, recebeu o acesso. Começa hoje, não amanhã.",
    gT: "Garantia de 7 dias",
    gD: "Você tem 7 dias para experimentar. Se sentir que o Diariamente não é pra você, devolvemos o seu investimento. Sem letra miúda.",
    stBadge: "Condição de estudante", stH: "Ainda está na graduação? O mesmo acesso de um ano por {preco}.",
    stHSemPreco: "Ainda está na graduação? O mesmo acesso de um ano, com condição de estudante.",
    stD: "Leva cerca de um minuto. O código chega no WhatsApp. Solicitar não gera compromisso.", stCta: "Ver minha condição",
    afEyebrow: "Sem mistério", afH2: "O que acontece depois",
    after: [
      ["Você recebe o e-mail de acesso", "Logo após a confirmação, com o passo a passo para abrir o app."],
      ["Faz a provocação do Dia 1", "Sua jornada começa quando você registra o primeiro dia."],
      ["O ritual te encontra todo dia", "Lembrete diário no WhatsApp. O contador mostra quantas vezes você voltou."],
    ],
    afStores: "O app está nas lojas oficiais. Seu acesso chega por e-mail após a confirmação.",
    fqH2: "O que as pessoas perguntam antes.", fqHelp: "Não achou a sua? Escreva para",
    faq: [
      ["Já baixei app de hábito antes. Parei na segunda semana.", "É o ponto exato onde o Diariamente foi construído. Ele não conta dias seguidos e não tem sequência para quebrar: conta quantas vezes você voltou, e esse número nunca zera."],
      ["E se eu perder um dia?", "O dia que você não veio fica visível, sem alarme e sem cobrança. Ele fica no meio da sua história, e a história continua depois dele."],
      ["Não tenho tempo.", "São três minutos: um texto curto, uma reflexão e uma ação pequena que cabe no dia que você já tem. Não pede rotina nova nem horário reservado."],
      ["Posso ler tudo de uma vez?", "Não. Um texto por dia, sem antecipar e sem acumular. A obrigação diária é do Diariamente, não sua: ele aparece todo dia, você volta quando puder."],
      ["Como recebo o acesso?", "Por e-mail, assim que o pagamento é confirmado. O app está disponível para iPhone e Android, com o mesmo acesso nos dois."],
      ["Isso é terapia ou tratamento?", "Não. O Diariamente é uma prática diária de hábitos e bem-estar. Não trata, não diagnostica e não substitui acompanhamento profissional."],
      ["E se não for pra mim?", "Você tem 7 dias para experimentar. Se sentir que o Diariamente não é pra você, devolvemos o seu investimento. Sem letra miúda."],
    ],
    fin: "A transformação não vai acontecer num dia. Vai acontecer diariamente.",
    finNote: "{preco} por um ano · Garantia de 7 dias",
    sign: "Volte amanhã.",
    ftTag: "Uma prática diária de hábitos e bem-estar. Não trata, não diagnostica e não substitui acompanhamento profissional.",
    ftInst: "Institucional", ftAbout: "Sobre o Diariamente", ftTerms: "Termos de uso", ftPriv: "Privacidade",
    ftTalk: "Falar com a gente", ftSupport: "Suporte", ftContact: "Contato", ftApp: "Baixar o app",
    stickyNote: "1 ano · 7 dias de garantia",
  },
  es: {
    locale: "es-ES",
    navHow: "Cómo funciona", navApp: "La app", navScience: "Base científica", navPrice: "Precio",
    cta: "Quiero mi acceso", cta2: "Ver cómo funciona",
    new: "NUEVO", badge: "Disponible en App Store y Google Play",
    h1: "Tres minutos al día. Un año entero de regreso.",
    lead: "Una provocación al día que termina en una acción posible hoy mismo. Cuando faltes, Diariamente no te cobra: te espera. Porque interrumpir no significa abandonar.",
    proof: "+5.000 personas ya empezaron · Garantía de 7 días",
    phoneAlt: "Pantalla Hoy de la app Diariamente",
    cardEyebrow: "Provocación del día", cardSub: "Tu turno. ¿Qué vas a hacer con esto?",
    share: "Compartir", copied: "¡Enlace copiado!", dayOf: "Día {n} de 365",
    s1: "personas ya empezaron", s2: "provocaciones, una por día", s3: "es lo que pide el ritual",
    s4n: "7 días", s4: "de garantía, sin letra pequeña",
    tr1: "Realización Science Play®", tr2: "Pago seguro vía Hotmart", tr4: "Datos protegidos · LGPD",
    pEyebrow: "El ciclo que ya conoces", pH2: "Ya empezaste. Más de una vez.",
    p1: "Descargaste la app. Prometiste que esta vez llegarías hasta el final. Paraste en la segunda semana. Y la vida se tragó el resto.",
    p2: "El problema nunca fue la disciplina. Es que nadie te dio un sistema para continuar: solo contenido. Y el contenido parado no cambia a nadie.",
    p3: "El enemigo no es la falta de motivación. Es el abandono silencioso. Diariamente fue construido en el punto exacto donde sueles parar.",
    vEyebrow: "Ahora imagina lo contrario",
    vText: "Llegar al final del año sin haberle fallado a la persona más importante: tú. Un día a la vez, sin volver a empezar de cero cada lunes.",
    photoAlt: "Mesa de un día común al amanecer, con cuaderno abierto y café",
    hH2: "El ritual diario en tres movimientos.",
    hSub: "Siempre la misma estructura. Lo que cambia es el texto, y lo que haces con él.",
    steps: [
      ["Provocación", "Un texto corto que interrumpe el automático. Cada día, uno solo. Sin anticipar, sin acumular."],
      ["Reflexión", "Una pregunta honesta, sin respuesta lista. Tu turno: ¿qué vas a hacer con esto?"],
      ["Acción", "Una decisión posible hoy mismo. La registras, la llevas al día y vuelves mañana."],
    ],
    cEyebrow: "Alrededor del ritual: el regreso", cNum: "37 regresos", cMeta: "desde el 4 de agosto · 1 día fuera",
    cP: "El contador no cuenta días seguidos: cuenta cuántas veces volviste. Nunca se pone en cero. Faltar un día no borra lo que ya construiste.",
    cL1: "ausencia: queda visible, no se borra", cL2: "el regreso después de ella", cL3: "hoy",
    aEyebrow: "Qué hay dentro", aH2: "Construida para el regreso, no para la perfección.",
    t1t: "Hoy", t1d: "La provocación del día, limpia. Nada compite por tu atención.",
    t2t: "Días", t2d: "Los días en que viniste. Y los que no, sin alarma y sin culpa.",
    t3t: "Acciones", t3d: "La reflexión se vuelve tarea concreta. Pensar se vuelve hacer.",
    t4t: "Ritmo", t4d: "Tus regresos acumulados y el recordatorio diario por WhatsApp.",
    t1alt: "Salud mental cada día. Tres minutos para leer, reflexionar y actuar. Pantalla Hoy de Diariamente con la fecha, el anillo Tu día y la provocación del día.",
    t2alt: "Tu año en lecturas. Días leídos, favoritos y días para recuperar. Calendario Días con los días leídos, recuperados y los favoritos.",
    t3alt: "De la decisión al hecho. Todo lo que salió de la lectura y se volvió decisión. Centro de acciones con las acciones pendientes, las hechas y los recordatorios.",
    t4alt: "Constancia sin culpa. Vueltas que nunca vuelven a cero y una meta a tu medida. Pantalla Ritmo con vueltas acumuladas, semanas en ritmo y la meta de la semana.",
    finAlt: "Una provocación al día. Una cita, una pregunta y un texto breve para reflexionar. Lectura en modo enfoque con la cita, la pregunta del día y el texto de reflexión.",
    oneH: "Un día a la vez. A propósito.",
    oneP1: "Cuando se puede consumir todo de una vez, el domingo de entusiasmo se come el año entero y el lunes queda vacío. Aquí tienes el día de hoy. Entero, sin prisa por terminar.",
    oneP2: "Son 365 textos al año, uno para cada día. Al año siguiente, en la misma fecha, un texto nuevo.",
    oneStrong: "Diariamente es diario. Tú no tienes que serlo.",
    scH2: "Construido a partir de principios consistentes con la ciencia del comportamiento.",
    scP1: "El ritual sigue lo que describe la investigación sobre formación de hábitos y autorregulación: repetir la misma respuesta en un contexto recurrente puede favorecer que se vuelva automática, y transformar la intención en un plan concreto puede aumentar la probabilidad de actuar.",
    scP2: "Las referencias sustentan afirmaciones sobre el fenómeno, no sobre el producto. No existe un número mágico de días, y nadie puede prometer plazos. Diariamente no trata, no diagnostica y no sustituye el acompañamiento profesional.",
    refs: [
      ["NIVEL A · REVISIÓN", "El hábito se forma repitiendo la misma respuesta en un contexto recurrente.", "Wood & Rünger (2016). Psychology of Habit. Annual Review of Psychology, 67."],
      ["NIVEL A · METAANÁLISIS", "No existe un número universal de días para formar un hábito; la variación es amplia.", "Singh et al. (2024). Time to Form a Habit. Healthcare, 12(23). 20 estudios."],
      ["NIVEL A · METAANÁLISIS", "Transformar la intención en un plan concreto de cuándo, dónde y cómo aumenta la probabilidad de actuar.", "Gollwitzer & Sheeran (2006). Implementation intentions. Adv. Exp. Social Psychology, 38. 94 pruebas."],
    ],
    spT: "Realización Science Play®",
    spD: "Empresa de educación en salud con clientes en más de 95 países. Contenido de autor, firmado por la marca.",
    spLink: "Sobre Diariamente →",
    belief: "Interrumpir no es abandonar. Perder un día no es perder un camino. Constancia no es nunca caer: es seguir volviendo.",
    beliefP: "Nadie aquí lee solo. El texto de hoy es el mismo para todos, el mismo día. No tienes que alcanzar a nadie. Solo volver.",
    yesL: "Es para ti si",
    yes: ["Ya probaste y dejaste otras apps de hábitos o diarios", "Quieres un cambio real, pero necesitas un sistema que te sostenga", "Prefieres constancia a un arranque de motivación"],
    noL: "No es para ti si",
    no: ["Buscas una solución mágica de la noche a la mañana", "No estás dispuesto a tres minutos al día", "Solo quieres otro PDF para la estantería digital"],
    prEyebrow: "Acceso anual", prH2: "Empieza hoy. Vuelve mañana.",
    prSub: "Menos que un café a la semana, por un año entero de práctica.",
    vaEyebrow: "Qué incluye tu acceso", vaH3: "Un sistema, no un archivo que descargas y olvidas.",
    v1t: "Una provocación al día, los 365 días del año", v1d: "Sin anticipar y sin acumular. Tres minutos y el día está cumplido.",
    v2t: "Calendario de constancia", v2d: "Los días en que viniste quedan visibles. Dejas de suponer y pasas a saber.",
    v3t: "Menú Acciones", v3d: "La provocación se vuelve tarea concreta, con plazo. Reflexionar sin actuar no cambia nada.",
    v4t: "Contador de regresos", v4d: "Cada día que vuelves cuenta. ¿Faltaste un día? La cuenta sigue donde se quedó.",
    v5t: "Recordatorio diario por WhatsApp", v5d: "La app no espera que te acuerdes de ella. Llega a la hora que elijas.",
    v6t: "Acceso inmediato por e-mail", v6d: "Confirmaste el pago, recibiste el acceso. Empiezas hoy, no mañana.",
    gT: "Garantía de 7 días",
    gD: "Tienes 7 días para probar. Si sientes que Diariamente no es para ti, te devolvemos tu inversión. Sin letra pequeña.",
    stBadge: "Condición de estudiante", stH: "¿Sigues en la universidad? El mismo acceso de un año por {preco}.",
    stHSemPreco: "¿Sigues en la universidad? El mismo acceso de un año, con condición de estudiante.",
    stD: "Toma cerca de un minuto. El código llega por WhatsApp. Solicitar no genera compromiso.", stCta: "Ver mi condición",
    afEyebrow: "Sin misterio", afH2: "Qué pasa después",
    after: [
      ["Recibes el e-mail de acceso", "Justo después de la confirmación, con el paso a paso para abrir la app."],
      ["Haces la provocación del Día 1", "Tu camino empieza cuando registras el primer día."],
      ["El ritual te encuentra cada día", "Recordatorio diario por WhatsApp. El contador muestra cuántas veces volviste."],
    ],
    afStores: "La app está en las tiendas oficiales. Tu acceso llega por e-mail tras la confirmación.",
    fqH2: "Lo que la gente pregunta antes.", fqHelp: "¿No encontraste la tuya? Escribe a",
    faq: [
      ["Ya descargué apps de hábitos antes. Paré en la segunda semana.", "Es el punto exacto donde se construyó Diariamente. No cuenta días seguidos ni tiene una racha que romper: cuenta cuántas veces volviste, y ese número nunca se pone en cero."],
      ["¿Y si pierdo un día?", "El día que no viniste queda visible, sin alarma y sin reproche. Queda en medio de tu historia, y la historia continúa después."],
      ["No tengo tiempo.", "Son tres minutos: un texto corto, una reflexión y una acción pequeña que cabe en el día que ya tienes. No pide una rutina nueva ni un horario reservado."],
      ["¿Puedo leer todo de una vez?", "No. Un texto al día, sin anticipar y sin acumular. La obligación diaria es de Diariamente, no tuya: aparece cada día, tú vuelves cuando puedas."],
      ["¿Cómo recibo el acceso?", "Por e-mail, en cuanto se confirma el pago. La app está disponible para iPhone y Android, con el mismo acceso en ambos."],
      ["¿Esto es terapia o tratamiento?", "No. Diariamente es una práctica diaria de hábitos y bienestar. No trata, no diagnostica y no sustituye el acompañamiento profesional."],
      ["¿Y si no es para mí?", "Tienes 7 días para probar. Si sientes que Diariamente no es para ti, te devolvemos tu inversión. Sin letra pequeña."],
    ],
    fin: "La transformación no va a ocurrir en un día. Va a ocurrir diariamente.",
    finNote: "{preco} por un año · Garantía de 7 días",
    sign: "Vuelve mañana.",
    ftTag: "Una práctica diaria de hábitos y bienestar. No trata, no diagnostica y no sustituye el acompañamiento profesional.",
    ftInst: "Institucional", ftAbout: "Sobre Diariamente", ftTerms: "Términos de uso", ftPriv: "Privacidad",
    ftTalk: "Habla con nosotros", ftSupport: "Soporte", ftContact: "Contacto", ftApp: "Descargar la app",
    stickyNote: "1 año · 7 días de garantía",
  },
} as const;

export type Dict = typeof I18N.pt;

/** Cloudinary com transformação (f_auto,q_auto,w_*) — corrige os 29 MB da home. */
export function cld(url: string, tx: string): string {
  return url.replace("/upload/", `/upload/${tx}/`);
}

/* =====================================================================
   ATIVOS POR IDIOMA
   ---------------------------------------------------------------------
   Cada idioma tem o SEU conjunto de imagens e links. Trocar a foto, a
   ficha da loja ou o checkout do site espanhol nao encosta no portugues.

   As telas do app ja tem a versao em espanhol (as mesmas das lojas). A
   foto de estilo de vida e o badge da Google Play ainda sao os do
   portugues: quando houver a versao em espanhol, basta trocar AQUI, no
   bloco `es`.

   ATENCAO nos links de loja:
     - `appStore` termina em /br/ no portugues. Para o espanhol, troque
       pelo mercado certo (/es/, /mx/, /ar/...), ou o usuario cai numa
       ficha em portugues.
     - `googlePlay` aceita &hl=es para a ficha sair traduzida.
     - checkout NAO mora aqui: o link de cada mercado (moeda, oferta e
       lancamento) esta em config/pricing.ts.
   ===================================================================== */

/* TELAS DO APP · as artes das lojas
   ---------------------------------------------------------------------
   As artes da App Store de iPhone 6,9" (1320 x 2868: fundo, legenda e o
   aparelho com a tela), as mesmas enviadas às lojas em 26/10/2026, uma
   pasta por idioma: public/telas/pt e public/telas/es. Portugal e o resto
   do mundo usam as pt; a América Latina e a Espanha, as es.

   Tela do site   arte da loja (pt)     arte da loja (es)
   hoje           01-hoje               01-hoje
   dias           07-dias               07-dias
   acoes          03-acao (Sua vez)     08-acoes (Centro de ações)
   ritmo          06-ritmo              06-ritmo
   leitura        02-leitura            02-leitura   (fim da página)

   Cada tela existe em WebP nas três larguras de TELA_LARGURAS e em JPEG na
   largura TELA_FALLBACK, para o navegador que não abre WebP (Safari 13 e
   anteriores): <base>-<largura>.webp e <base>-<TELA_FALLBACK>.jpg. Aqui
   fica só a base; o <picture> está em components/TelaDaLoja.tsx.
   Trocar uma tela: gerar os quatro arquivos com o mesmo nome. */
export const TELA_LARGURAS = [360, 560, 840] as const;
/** Largura do JPEG de reserva (navegador sem WebP). */
export const TELA_FALLBACK = 560;
/** Proporção das artes (largura e altura em pixels). */
export const TELA_PROPORCAO = { largura: 1320, altura: 2868 } as const;
const telasDo = (lang: Lang) => ({
  hoje: `/telas/${lang}/hoje`,
  dias: `/telas/${lang}/dias`,
  acoes: `/telas/${lang}/acoes`,
  ritmo: `/telas/${lang}/ritmo`,
  leitura: `/telas/${lang}/leitura`,
});

const IMG_PT = {
  ...telasDo("pt"),
  lifestyle: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1782699619/Lifestyle_Diariamente_yur3mm.png",
  appStore: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1783609634/Apple_Store_Branca_usar_no_fundo_escuro_tp7rgw.svg",
  googlePlay: "https://res.cloudinary.com/dlzrfhwin/image/upload/v1783609634/GetItOnGooglePlay_Badge_Web_color_Portuguese-Brazil_rl6hba.svg",
};

const LINKS_PT = {
  appStore: "https://apps.apple.com/br/app/diariamente/id6762151251",
  googlePlay: "https://play.google.com/store/apps/details?id=club.diariamente.app",
  instagram: "https://instagram.com/diariamente",
  suporte: "mailto:suporte@scienceplay.com",
  contato: "mailto:contato@scienceplay.com",
};

export const ATIVOS: Record<Lang, { img: typeof IMG_PT; links: typeof LINKS_PT }> = {
  pt: { img: IMG_PT, links: LINKS_PT },
  es: {
    img: {
      ...IMG_PT,
      // Artes das lojas em espanhol (interface e legenda em espanhol).
      ...telasDo("es"),
      // [TROCAR] badge da Google Play em espanhol
    },
    links: {
      ...LINKS_PT,
      // [TROCAR] mercado da App Store: /es/, /mx/, /ar/...
      // [TROCAR] &hl=es na Google Play
      // [TROCAR] oferta da Hotmart em moeda local
    },
  },
};

// Compatibilidade: qualquer import antigo continua funcionando em pt.
export const IMG = IMG_PT;
export const LINKS = LINKS_PT;

/* =====================================================================
   PORTUGUÊS DE PORTUGAL
   ---------------------------------------------------------------------
   Sobreposição parcial do dicionário pt. Só as chaves que mudam: o
   resto é herdado, e assim uma frase nova em pt não fica faltando aqui.

   DECISÕES DE REGISTO E VOCABULÁRIO

   Tratamento por TU. É o registo de app de consumo em Portugal, e é o
   que a marca pede: direta sem ser fria. Misturar "você" e "tu" na
   mesma página é pior que não traduzir, por isso a conversão é
   completa nas frases que falam com a pessoa.

   Vocabulário trocado:
     tela          -> ecrã
     compartilhar  -> partilhar
     contato       -> contacto
     baixar o app  -> transferir a app
     arquivo       -> ficheiro
     "pra"         -> "para"
     "com a gente" -> "connosco"

   E duas correções que não são de estilo, são de fato:
     LGPD -> RGPD. Portugal é União Europeia; citar a lei brasileira
       numa página portuguesa é informação errada.
     Pix e boleto saíram do meio de pagamento (ver confianca em
       config/pricing.ts): não existem em Portugal.
   ===================================================================== */
// Dict é inferido com os literais do dicionário pt, então um Partial<Dict>
// recusaria qualquer frase diferente. Tipagem larga aqui e uma conversão
// na função abaixo: as chaves continuam conferidas pelo uso no componente.
const PT_PT: Record<string, unknown> = {
  locale: "pt-PT",
  navApp: "A app",
  cta: "Quero o meu acesso", cta2: "Ver como funciona",
  badge: "Disponível na App Store e no Google Play",
  h1: "Três minutos por dia. Um ano inteiro de volta.",
  lead: "Uma provocação por dia que termina numa ação possível ainda hoje. Quando faltares, o Diariamente não cobra: espera por ti. Porque interromper não significa abandonar.",
  proof: "+5.000 pessoas já começaram · Garantia de 7 dias",
  phoneAlt: "Ecrã Hoje da app Diariamente",
  cardSub: "É a tua vez. O que vais fazer com isto?",
  share: "Partilhar", copied: "Ligação copiada!",
  tr4: "Dados protegidos · RGPD",
  pEyebrow: "O ciclo que já conheces", pH2: "Já começaste. Mais do que uma vez.",
  p1: "Transferiste a app. Prometeste que desta vez ias até ao fim. Paraste na segunda semana. E a vida engoliu o resto.",
  p2: "O problema nunca foi disciplina. É que ninguém te deu um sistema para continuar: só conteúdo. E conteúdo parado não muda ninguém.",
  p3: "O inimigo não é a falta de motivação. É o abandono silencioso. O Diariamente foi construído no ponto exato onde costumas parar.",
  vText: "Chegar ao fim do ano sem teres faltado à pessoa mais importante: tu. Um dia de cada vez, sem recomeçar do zero todas as segundas.",
  photoAlt: "Mesa de um dia comum ao amanhecer, com caderno aberto e café",
  hSub: "Sempre a mesma estrutura. O que muda é o texto, e o que fazes com ele.",
  steps: [
    ["Provocação", "Um texto curto que interrompe o automático. Todos os dias, um só. Sem antecipar, sem acumular."],
    ["Reflexão", "Uma pergunta honesta, sem resposta pronta. É a tua vez: o que vais fazer com isto?"],
    ["Ação", "Uma decisão possível ainda hoje. Registas, levas para o dia e voltas amanhã."],
  ],
  cP: "O contador não conta dias seguidos: conta quantas vezes voltaste. Nunca volta a zero. Faltar um dia não apaga o que já construíste.",
  t1d: "A provocação do dia, limpa. Nada compete pela tua atenção.",
  t2d: "Os dias em que vieste. E aqueles em que não vieste, sem alarme e sem culpa.",
  t4d: "As tuas voltas acumuladas e o lembrete diário no WhatsApp.",
  // Portugal usa as artes em português do Brasil: a legenda vai como está
  // desenhada na arte; a descrição da tela diz ecrã.
  t1alt: "Saúde mental todo dia. Três minutos para ler, refletir e agir. Ecrã Hoje do Diariamente com a data, o anel Seu dia e a provocação do dia.",
  t4alt: "Constância sem culpa. Voltas que nunca zeram e uma meta que você escolhe. Ecrã Ritmo com voltas acumuladas, semanas em ritmo e a meta da semana.",
  oneP1: "Quando dá para consumir tudo de uma vez, o domingo de entusiasmo come o ano inteiro e a segunda-feira fica sem nada. Aqui tens o dia de hoje. Inteiro, sem pressa de terminar.",
  oneStrong: "O Diariamente é diário. Tu não precisas de ser.",
  scP2: "As referências sustentam afirmações sobre o fenómeno, não sobre o produto. Não existe número mágico de dias, e ninguém pode prometer prazos. O Diariamente não trata, não diagnostica e não substitui acompanhamento profissional.",
  spD: "Empresa de educação em saúde com clientes em mais de 95 países. Conteúdo autoral, assinado pela marca.",
  belief: "Interromper não é abandonar. Perder um dia não é perder um caminho. Constância não é nunca cair: é continuar a voltar.",
  beliefP: "Aqui ninguém lê sozinho. O texto de hoje é o mesmo para toda a gente, no mesmo dia. Não precisas de alcançar ninguém. É só voltares.",
  yesL: "É para ti se",
  yes: ["Já experimentaste e deixaste outras apps de hábitos ou diários", "Queres mudança a sério, mas precisas de um sistema que te segure", "Preferes constância a surtos de motivação"],
  noL: "Não é para ti se",
  no: ["Procuras solução mágica de um dia para o outro", "Não estás disposto a três minutos por dia", "Queres só mais um PDF para a estante digital"],
  prH2: "Começa hoje. Volta amanhã.",
  prSub: "Menos do que um café por semana, por um ano inteiro de prática.",
  vaH3: "Um sistema, não um ficheiro que transferes e esqueces.",
  v1d: "Sem antecipar e sem acumular. Três minutos e o dia está cumprido.",
  v2d: "Os dias em que vieste ficam visíveis. Deixas de achar e passas a saber.",
  v3d: "A provocação torna-se tarefa concreta, com prazo. Refletir sem agir não muda nada.",
  v4d: "Cada dia em que voltas conta. Faltaste um dia? A contagem continua de onde parou.",
  v5d: "A app não espera que te lembres dela. Chega à hora que escolheres.",
  v6d: "Confirmaste o pagamento, recebeste o acesso. Começa hoje, não amanhã.",
  gD: "Tens 7 dias para experimentar. Se sentires que o Diariamente não é para ti, devolvemos o teu investimento. Sem letra miúda.",
  after: [
    ["Recebes o e-mail de acesso", "Logo após a confirmação, com o passo a passo para abrir a app."],
    ["Fazes a provocação do Dia 1", "O teu caminho começa quando registas o primeiro dia."],
    ["O ritual encontra-te todos os dias", "Lembrete diário no WhatsApp. O contador mostra quantas vezes voltaste."],
  ],
  afStores: "A app está nas lojas oficiais. O teu acesso chega por e-mail após a confirmação.",
  fqHelp: "Não encontraste a tua? Escreve para",
  faq: [
    ["Já transferi apps de hábitos antes. Parei na segunda semana.", "É o ponto exato onde o Diariamente foi construído. Não conta dias seguidos e não tem sequência para quebrar: conta quantas vezes voltaste, e esse número nunca volta a zero."],
    ["E se perder um dia?", "O dia em que não vieste fica visível, sem alarme e sem cobrança. Fica no meio da tua história, e a história continua depois dele."],
    ["Não tenho tempo.", "São três minutos: um texto curto, uma reflexão e uma ação pequena que cabe no dia que já tens. Não pede rotina nova nem horário reservado."],
    ["Posso ler tudo de uma vez?", "Não. Um texto por dia, sem antecipar e sem acumular. A obrigação diária é do Diariamente, não tua: ele aparece todos os dias, tu voltas quando puderes."],
    ["Como recebo o acesso?", "Por e-mail, assim que o pagamento for confirmado. A app está disponível para iPhone e Android, com o mesmo acesso em ambos."],
    ["Isto é terapia ou tratamento?", "Não. O Diariamente é uma prática diária de hábitos e bem-estar. Não trata, não diagnostica e não substitui acompanhamento profissional."],
    ["E se não for para mim?", "Tens 7 dias para experimentar. Se sentires que o Diariamente não é para ti, devolvemos o teu investimento. Sem letra miúda."],
  ],
  fin: "A transformação não vai acontecer num dia. Vai acontecer diariamente.",
  sign: "Volta amanhã.",
  ftTalk: "Falar connosco", ftContact: "Contacto", ftApp: "Transferir a app",
  ftAbout: "Sobre o Diariamente", ftTerms: "Termos de utilização", ftPriv: "Privacidade",
  stickyNote: "1 ano · 7 dias de garantia",
};

/**
 * Dicionário do mercado. Portugal recebe pt com a sobreposição pt-PT;
 * os outros recebem o dicionário do idioma, sem alteração.
 */
export function dicionario(lang: Lang, mercado?: string): Dict {
  const base = I18N[lang] as unknown as Dict;
  return mercado === "pt" ? ({ ...base, ...PT_PT } as unknown as Dict) : base;
}
