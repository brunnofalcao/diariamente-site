/* =====================================================================
   PÓS-PAGAMENTO · textos por idioma
   ---------------------------------------------------------------------
   Tudo o que a pessoa lê nas páginas de obrigado (aprovado, aguardando
   pagamento, em análise) e no /baixar, nos quatro locais do
   pós-pagamento (pedido do dono, 29/10/2026: "Brasil: português BR;
   Portugal: português PT; Espanha: espanhol; América Latina: espanhol;
   EUA / demais países: inglês"):
     pt     português do Brasil (sem prefixo)
     pt-pt  português de Portugal (/pt-pt/...)
     es     espanhol: América Latina e Espanha (/es/...)
     en     inglês dos Estados Unidos: Estados Unidos e demais países (/en/...)
   Os quatro têm as MESMAS chaves (o teste confere). O "baixar" de pt-pt e
   en existe para manter as chaves iguais, mas não tem página: os dois
   usam o /baixar do pt (lib/obrigado.mjs, BAIXAR_DO_LOCAL). Pix e boleto
   só aparecem para o mercado br (components/ObrigadoShell.tsx): quem lê
   em português do Brasil e paga em dólar ou euro vê a linha geral das
   instruções. A lista de formas de es, pt-pt e en é vazia.

   FORMATO. Texto rico é uma lista: texto simples, { b: "..." } (negrito;
   se for o rótulo exato do botão do app, vira o "chip" que imita o
   botão), { pt: "..." } (rótulo do app em português citado no meio de
   outro idioma, como o "Entrar" do en: sai com lang="pt-BR" para o
   leitor de tela) e { atendimento: true } (o e-mail do atendimento, com
   link). Título: uma linha por item.

   REGRAS DA MARCA (testes/obrigado.test.mjs confere nos quatro): nunca
   "compra" nem "comprar" (nem no espanhol: pedido, pago, suscripción,
   acceso; no inglês, nem "purchase", "buy" ou "bought": payment,
   subscription, access, order), sem travessão, no máximo um emoji por
   página, frases curtas, nada que o sistema não cumpra, sem dizer em que
   idioma chegam o WhatsApp e o e-mail e sem garantir que o WhatsApp chega
   (depende de um número válido no pagamento).

   PORTUGUÊS DE PORTUGAL de verdade, não o pt-BR com troca de palavras:
   telemóvel, ecrã, câmara, instalar e descarregar, registo, "a app",
   "o seu" e "a sua" (tratamento formal, sem "você"), palavra-passe na
   prosa, separador (a aba do Gmail), apoio ao cliente.

   INGLÊS DOS ESTADOS UNIDOS, curto e claro (email, sem hífen).

   O APP SÓ TEM pt-BR E es (public/i18n do app). Abre em espanhol num
   aparelho em espanhol e em português num em português; num aparelho em
   inglês, decide pelo fuso horário: país de língua espanhola, es; o
   resto (os Estados Unidos, por exemplo), pt-BR (public/index.html do
   app, escolherIdiomaInicial). Por isso pt-pt e en citam os rótulos do
   app EXATAMENTE como aparecem em português ("Primeiro acesso? Ativar
   conta", abaixo do botão "Entrar"); o en põe a tradução entre
   parênteses na primeira vez e diz, numa frase, que o app está em
   português e espanhol. A página não diz em que idioma chegam o
   WhatsApp e o e-mail de acesso (regra da marca).

   O CÓDIGO DE 6 DÍGITOS. Na ativação, o app manda o código ao WhatsApp
   da conta; sem telefone, ou se o WhatsApp falhar, manda um link de
   ativação ao e-mail (server.js do app, /api/auth/activate-by-email). Por
   isso o passo 3 e o "Não recebeu?" falam dos dois caminhos.

   O rótulo do botão do app tem de ser o EXATO da tela de login
   (public/i18n/pt-BR.json e es.json do app, login.primeiro_acesso_btn),
   que fica logo abaixo do botão Entrar (public/index.html do app).
   ===================================================================== */

export const TEXTOS = {
  pt: {
    aprovado: {
      aba: "Pagamento aprovado · Diariamente",
      descricao: "Seu pagamento foi aprovado. Instale o app e crie sua senha para começar.",
      selo: "Pagamento aprovado",
      titulo: [
        "Seu ano",
        "começa agora."
      ],
      sub: "Boas-vindas ao Diariamente. Agora falta instalar o app e criar sua senha.",
      trilha: {
        rotulo: "Seu progresso",
        resumo: "1 de 3 concluído",
        passos: [
          "Pagamento aprovado",
          "Instalar o app",
          "Criar sua senha"
        ],
        feito: "Feito",
        agora: "Agora",
        depois: "A seguir"
      },
      app: {
        selo: "Passo 2",
        titulo: "Instale o app",
        jaInstalado: "Já tem o app? Siga para o passo 3."
      },
      senha: {
        selo: "Passo 3",
        titulo: "Crie sua senha no app",
        passos: [
          [
            "Abra o app e toque em ",
            {
              b: "Primeiro acesso? Ativar conta"
            },
            ", abaixo do botão Entrar."
          ],
          [
            "Informe o ",
            {
              b: "e-mail usado no pagamento"
            },
            "."
          ],
          [
            "Crie sua senha. O app confirma com um código de 6 dígitos no WhatsApp do pagamento. Sem WhatsApp, a confirmação vai por um link no seu e-mail."
          ]
        ]
      },
      whatsapp: {
        selo: "No seu WhatsApp",
        titulo: "Confira seu WhatsApp",
        texto: "Informou seu WhatsApp no pagamento? Deve chegar por lá uma mensagem com o passo a passo e os botões para instalar o app."
      },
      naoRecebeu: {
        titulo: "Não recebeu?",
        itens: [
          {
            p: "O WhatsApp não chegou.",
            r: [
              "A mensagem depende de um número de WhatsApp válido no pagamento. Se ele ficou em branco ou com erro, ela não chega. Os passos desta página são os mesmos da mensagem."
            ]
          },
          {
            p: "O e-mail de acesso não chegou.",
            r: [
              "Confira o spam e a aba Promoções. Procure também a confirmação que a Hotmart enviou: o endereço que a recebeu é o e-mail que você usa no app."
            ]
          },
          {
            p: "O código não chegou.",
            r: [
              "Se o app avisar que enviou um link, ele está no e-mail do pagamento. Confira também o spam. Número errado? Escreva para ",
              {
                atendimento: true
              },
              " com o e-mail do pagamento e o WhatsApp certo."
            ]
          }
        ]
      },
      webAntes: "Prefere começar agora no navegador?",
      webAquiAntes: "Prefere começar aqui mesmo?",
      webLink: "Abrir a versão web",
      suporteAntes: "Dificuldade para entrar? Escreva para",
      frase: "Volte amanhã."
    },
    "aguardando-pagamento": {
      aba: "Aguardando pagamento · Diariamente",
      descricao: "Recebemos seu pedido do Diariamente. Falta a confirmação do pagamento.",
      selo: "Pedido recebido",
      titulo: [
        "Falta só confirmar",
        "o pagamento."
      ],
      sub: "Assim que ele for confirmado, sua conta é criada com o e-mail usado no pagamento.",
      trilha: {
        rotulo: "Seu progresso",
        resumo: "1 de 3 concluído",
        passos: [
          "Pedido recebido",
          "Confirmação do pagamento",
          "Instalar e criar a senha"
        ],
        feito: "Feito",
        agora: "Agora",
        depois: "A seguir"
      },
      concluir: {
        selo: "Para concluir",
        titulo: "Conclua o pagamento",
        formas: [
          {
            id: "pix",
            titulo: "Se você escolheu Pix",
            texto: "Pague com o QR Code ou o código copia e cola gerado ao finalizar o pedido."
          },
          {
            id: "boleto",
            titulo: "Se você escolheu boleto",
            texto: "Pague o boleto gerado ao finalizar o pedido, no app do seu banco ou em uma lotérica, até o vencimento."
          }
        ],
        instrucoes: "Em geral, a Hotmart também envia as instruções de pagamento para o e-mail usado no pedido.",
        instrucoesGeral: "Siga as instruções mostradas ao finalizar o pedido. Em geral, a Hotmart também as envia para o e-mail usado no pedido.",
        instrucoesSoEmail: "Em geral, a Hotmart envia as instruções de pagamento para o e-mail usado no pedido. Se não encontrar, escreva para o atendimento.",
        jaPagou: "Se você já pagou, é só aguardar a confirmação."
      },
      acesso: {
        selo: "Depois da confirmação",
        titulo: "Como você recebe o acesso",
        texto: [
          "As instruções de acesso chegam no ",
          {
            b: "e-mail usado no pagamento"
          },
          ". Se você informou seu WhatsApp corretamente, elas também devem chegar por lá."
        ]
      },
      app: {
        selo: "Enquanto isso",
        titulo: "Já deixe o app instalado",
        texto: [
          "Depois da confirmação, abra o app, toque em ",
          {
            b: "Primeiro acesso? Ativar conta"
          },
          " e use o e-mail do pagamento."
        ]
      },
      webAntes: "Depois da confirmação, também dá para usar o app no navegador.",
      webLink: "Abrir a versão web",
      suporteAntes: "Dúvidas? Escreva para",
      frase: "Volte amanhã."
    },
    "aguardando-analise": {
      aba: "Pagamento em análise · Diariamente",
      descricao: "Seu pagamento do Diariamente está em análise. Assim que for aprovado, o acesso é liberado.",
      selo: "Em análise",
      titulo: [
        "Seu pagamento está",
        "em análise."
      ],
      sub: "A instituição responsável pelo pagamento está analisando a transação. O prazo depende dela.",
      trilha: {
        rotulo: "Seu progresso",
        resumo: "1 de 3 concluído",
        passos: [
          "Pedido recebido",
          "Confirmação do pagamento",
          "Instalar e criar a senha"
        ],
        feito: "Feito",
        agora: "Agora",
        depois: "A seguir"
      },
      calma: {
        selo: "Enquanto isso",
        titulo: "Você não precisa fazer nada",
        texto: [
          "Quando o pagamento for aprovado, as instruções de acesso chegam no ",
          {
            b: "e-mail usado no pagamento"
          },
          ". Se você informou seu WhatsApp corretamente, elas também devem chegar por lá. Pode fechar esta página."
        ]
      },
      app: {
        selo: "Se quiser ganhar tempo",
        titulo: "Já deixe o app instalado",
        texto: [
          "Depois da aprovação, abra o app, toque em ",
          {
            b: "Primeiro acesso? Ativar conta"
          },
          " e use o e-mail do pagamento."
        ]
      },
      webAntes: "Depois da aprovação, também dá para usar o app no navegador.",
      webLink: "Abrir a versão web",
      suporteAntes: "Dúvidas? Escreva para",
      frase: "Volte amanhã."
    },
    baixar: {
      aba: "Baixar o app · Diariamente",
      descricao: "Instale o Diariamente no iPhone ou no Android.",
      titulo: [
        "O Diariamente",
        "no seu celular."
      ],
      texto: "Disponível para iPhone e Android, com o mesmo acesso nos dois.",
      qrTitulo: "Aponte a câmera do celular para o código",
      qrTexto: "O código abre a página para instalar o app.",
      lojasAntes: "Ou abra direto na loja:",
      appStore: "Baixar na App Store",
      googlePlay: "Disponível no Google Play",
      primeiroAcesso: [
        "Ao abrir o app pela primeira vez, toque em ",
        {
          b: "Primeiro acesso? Ativar conta"
        },
        " e use o e-mail do pagamento."
      ],
      webAntes: "Prefere usar no navegador?",
      webLink: "Abrir a versão web",
      frase: "Volte amanhã."
    },
    lojas: {
      iphone: {
        botao: "Instalar no iPhone",
        nota: "Abre na App Store",
        outroAntes: "Usa Android?",
        outroLink: "Instalar pelo Google Play"
      },
      android: {
        botao: "Instalar no Android",
        nota: "Abre no Google Play",
        outroAntes: "Usa iPhone?",
        outroLink: "Instalar pela App Store"
      },
      computador: {
        titulo: "Aponte a câmera do celular para o código",
        texto: "O código abre a página para instalar o app.",
        lojasAntes: "Ou abra a loja:"
      },
      appStore: "Baixar na App Store",
      googlePlay: "Disponível no Google Play",
      appStoreAria: "Baixe o Diariamente na App Store",
      googlePlayAria: "Baixe o Diariamente no Google Play",
      qrAlt: "Código QR que abre a página para instalar o Diariamente no celular"
    }
  },
  es: {
    aprovado: {
      aba: "Pago aprobado · Diariamente",
      descricao: "Tu pago fue aprobado. Instala la app y crea tu contraseña para empezar.",
      selo: "Pago aprobado",
      titulo: [
        "Tu año",
        "empieza ahora."
      ],
      sub: "Te damos la bienvenida a Diariamente. Ahora falta instalar la app y crear tu contraseña.",
      trilha: {
        rotulo: "Tu progreso",
        resumo: "1 de 3 completado",
        passos: [
          "Pago aprobado",
          "Instalar la app",
          "Crear tu contraseña"
        ],
        feito: "Hecho",
        agora: "Ahora",
        depois: "Pendiente"
      },
      app: {
        selo: "Paso 2",
        titulo: "Instala la app",
        jaInstalado: "¿Ya tienes la app? Pasa al paso 3."
      },
      senha: {
        selo: "Paso 3",
        titulo: "Crea tu contraseña en la app",
        passos: [
          [
            "Abre la app y toca ",
            {
              b: "¿Primer acceso? Activar cuenta"
            },
            ", debajo del botón Entrar."
          ],
          [
            "Ingresa el ",
            {
              b: "correo que usaste en el pago"
            },
            "."
          ],
          [
            "Crea tu contraseña. La app la confirma con un código de 6 dígitos en el WhatsApp del pago. Sin WhatsApp, la confirmación va por un enlace a tu correo."
          ]
        ]
      },
      whatsapp: {
        selo: "En tu WhatsApp",
        titulo: "Revisa tu WhatsApp",
        texto: "¿Registraste tu WhatsApp en el pago? Debería llegarte por ahí un mensaje con el paso a paso y los botones para instalar la app."
      },
      naoRecebeu: {
        titulo: "¿No te llegó?",
        itens: [
          {
            p: "No me llegó el WhatsApp.",
            r: [
              "El mensaje depende de un número de WhatsApp válido en el pago. Si lo dejaste en blanco o tiene un error, no llega. Los pasos de esta página son los mismos que los del mensaje."
            ]
          },
          {
            p: "No me llegó el correo de acceso.",
            r: [
              "Revisa la carpeta de spam y la pestaña Promociones. Busca también la confirmación que te envió Hotmart: la dirección que la recibió es el correo que usas en la app."
            ]
          },
          {
            p: "No me llegó el código.",
            r: [
              "Si la app avisa que envió un enlace, está en el correo del pago. Revisa también el spam. ¿El número está mal? Escribe a ",
              {
                atendimento: true
              },
              " con el correo del pago y tu WhatsApp correcto."
            ]
          }
        ]
      },
      webAntes: "¿Prefieres empezar ahora en el navegador?",
      webAquiAntes: "¿Prefieres empezar aquí mismo?",
      webLink: "Abrir la versión web",
      suporteAntes: "¿Problemas para entrar? Escribe a",
      frase: "Vuelve mañana."
    },
    "aguardando-pagamento": {
      aba: "Pago pendiente · Diariamente",
      descricao: "Recibimos tu pedido de Diariamente. Falta la confirmación del pago.",
      selo: "Pedido recibido",
      titulo: [
        "Solo falta confirmar",
        "el pago."
      ],
      sub: "En cuanto se confirme, tu cuenta se crea con el correo que usaste en el pago.",
      trilha: {
        rotulo: "Tu progreso",
        resumo: "1 de 3 completado",
        passos: [
          "Pedido recibido",
          "Confirmación del pago",
          "Instalar y crear la contraseña"
        ],
        feito: "Hecho",
        agora: "Ahora",
        depois: "Pendiente"
      },
      concluir: {
        selo: "Para terminar",
        titulo: "Completa el pago",
        formas: [],
        instrucoes: "Sigue las instrucciones que viste al finalizar el pedido, por ejemplo para pagar en efectivo o por transferencia. Por lo general, Hotmart también las envía al correo que usaste en el pedido.",
        instrucoesGeral: "Sigue las instrucciones que viste al finalizar el pedido, por ejemplo para pagar en efectivo o por transferencia. Por lo general, Hotmart también las envía al correo que usaste en el pedido.",
        instrucoesSoEmail: "Por lo general, Hotmart envía las instrucciones de pago al correo que usaste en el pedido. Si no las encuentras, escribe a soporte.",
        jaPagou: "Si ya pagaste, solo queda esperar la confirmación."
      },
      acesso: {
        selo: "Después de la confirmación",
        titulo: "Cómo recibes el acceso",
        texto: [
          "Las instrucciones de acceso llegan al ",
          {
            b: "correo que usaste en el pago"
          },
          ". Si tu número de WhatsApp quedó bien registrado, también deberían llegarte por ahí."
        ]
      },
      app: {
        selo: "Mientras tanto",
        titulo: "Deja la app instalada",
        texto: [
          "Después de la confirmación, abre la app, toca ",
          {
            b: "¿Primer acceso? Activar cuenta"
          },
          " y usa el correo del pago."
        ]
      },
      webAntes: "Después de la confirmación, también puedes usar la app en el navegador.",
      webLink: "Abrir la versión web",
      suporteAntes: "¿Dudas? Escribe a",
      frase: "Vuelve mañana."
    },
    "aguardando-analise": {
      aba: "Pago en revisión · Diariamente",
      descricao: "Tu pago de Diariamente está en revisión. En cuanto se apruebe, se activa tu acceso.",
      selo: "En revisión",
      titulo: [
        "Tu pago está",
        "en revisión."
      ],
      sub: "La entidad que procesa tu pago está revisando la operación. El plazo depende de ella.",
      trilha: {
        rotulo: "Tu progreso",
        resumo: "1 de 3 completado",
        passos: [
          "Pedido recibido",
          "Confirmación del pago",
          "Instalar y crear la contraseña"
        ],
        feito: "Hecho",
        agora: "Ahora",
        depois: "Pendiente"
      },
      calma: {
        selo: "Mientras tanto",
        titulo: "No necesitas hacer nada",
        texto: [
          "Cuando se apruebe el pago, las instrucciones de acceso llegarán al ",
          {
            b: "correo que usaste en el pago"
          },
          ". Si tu número de WhatsApp quedó bien registrado, también deberían llegarte por ahí. Puedes cerrar esta página."
        ]
      },
      app: {
        selo: "Si quieres adelantarte",
        titulo: "Deja la app instalada",
        texto: [
          "Después de la aprobación, abre la app, toca ",
          {
            b: "¿Primer acceso? Activar cuenta"
          },
          " y usa el correo del pago."
        ]
      },
      webAntes: "Después de la aprobación, también puedes usar la app en el navegador.",
      webLink: "Abrir la versión web",
      suporteAntes: "¿Dudas? Escribe a",
      frase: "Vuelve mañana."
    },
    baixar: {
      aba: "Descargar la app · Diariamente",
      descricao: "Instala Diariamente en iPhone o Android.",
      titulo: [
        "Diariamente",
        "en tu celular."
      ],
      texto: "Disponible para iPhone y Android, con el mismo acceso en ambos.",
      qrTitulo: "Apunta la cámara de tu celular al código",
      qrTexto: "El código te lleva a la página para instalar la app.",
      lojasAntes: "O abre directo la tienda:",
      appStore: "Descárgalo en el App Store",
      googlePlay: "Disponible en Google Play",
      primeiroAcesso: [
        "Al abrir la app por primera vez, toca ",
        {
          b: "¿Primer acceso? Activar cuenta"
        },
        " y usa el correo del pago."
      ],
      webAntes: "¿Prefieres usarla en el navegador?",
      webLink: "Abrir la versión web",
      frase: "Vuelve mañana."
    },
    lojas: {
      iphone: {
        botao: "Instalar en iPhone",
        nota: "Te lleva al App Store",
        outroAntes: "¿Usas Android?",
        outroLink: "Instalar desde Google Play"
      },
      android: {
        botao: "Instalar en Android",
        nota: "Te lleva a Google Play",
        outroAntes: "¿Usas iPhone?",
        outroLink: "Instalar desde el App Store"
      },
      computador: {
        titulo: "Apunta la cámara de tu celular al código",
        texto: "El código te lleva a la página para instalar la app.",
        lojasAntes: "O abre la tienda:"
      },
      appStore: "Descárgalo en el App Store",
      googlePlay: "Disponible en Google Play",
      appStoreAria: "Descarga Diariamente en el App Store",
      googlePlayAria: "Descarga Diariamente en Google Play",
      qrAlt: "Código QR que lleva a la página para instalar Diariamente en el celular"
    }
  },
  "pt-pt": {
    aprovado: {
      aba: "Pagamento aprovado · Diariamente",
      descricao: "O seu pagamento foi aprovado. Instale a app e crie a sua palavra-passe para começar.",
      selo: "Pagamento aprovado",
      titulo: [
        "O seu ano",
        "começa agora."
      ],
      sub: "Boas-vindas ao Diariamente. Agora só falta instalar a app e criar a sua palavra-passe.",
      trilha: {
        rotulo: "O seu progresso",
        resumo: "1 de 3 concluído",
        passos: [
          "Pagamento aprovado",
          "Instalar a app",
          "Criar a palavra-passe"
        ],
        feito: "Feito",
        agora: "Agora",
        depois: "A seguir"
      },
      app: {
        selo: "Passo 2",
        titulo: "Instale a app",
        jaInstalado: "Já tem a app? Avance para o passo 3."
      },
      senha: {
        selo: "Passo 3",
        titulo: "Crie a sua palavra-passe na app",
        passos: [
          [
            "Abra a app e toque em ",
            {
              b: "Primeiro acesso? Ativar conta"
            },
            ", por baixo do botão Entrar."
          ],
          [
            "Indique o ",
            {
              b: "e-mail que usou no pagamento"
            },
            "."
          ],
          [
            "Crie a sua palavra-passe. A app confirma-a com um código de 6 dígitos enviado para o WhatsApp do pagamento. Sem WhatsApp, a confirmação segue por um link para o seu e-mail."
          ]
        ]
      },
      whatsapp: {
        selo: "No seu WhatsApp",
        titulo: "Veja o seu WhatsApp",
        texto: "Indicou o seu WhatsApp no pagamento? Deve receber lá uma mensagem com o passo a passo e os botões para instalar a app."
      },
      naoRecebeu: {
        titulo: "Não recebeu?",
        itens: [
          {
            p: "A mensagem de WhatsApp não chegou.",
            r: [
              "A mensagem depende de um número de WhatsApp válido no pagamento. Se ficou em branco ou com um erro, não chega. Os passos desta página são os mesmos da mensagem."
            ]
          },
          {
            p: "O e-mail de acesso não chegou.",
            r: [
              "Veja a pasta de spam e o separador Promoções. Procure também a confirmação que a Hotmart lhe enviou: o endereço que a recebeu é o e-mail que usa na app."
            ]
          },
          {
            p: "O código não chegou.",
            r: [
              "Se a app indicar que enviou um link, procure-o no e-mail do pagamento. Veja também o spam. Número errado? Escreva para ",
              {
                atendimento: true
              },
              " com o e-mail do pagamento e o WhatsApp correto."
            ]
          }
        ]
      },
      webAntes: "Prefere começar já no navegador?",
      webAquiAntes: "Prefere começar aqui mesmo?",
      webLink: "Abrir a versão web",
      suporteAntes: "Dificuldade em entrar? Escreva para",
      frase: "Volte amanhã."
    },
    "aguardando-pagamento": {
      aba: "A aguardar pagamento · Diariamente",
      descricao: "Recebemos o seu pedido do Diariamente. Falta a confirmação do pagamento.",
      selo: "Pedido recebido",
      titulo: [
        "Só falta confirmar",
        "o pagamento."
      ],
      sub: "Assim que for confirmado, a sua conta é criada com o e-mail que usou no pagamento.",
      trilha: {
        rotulo: "O seu progresso",
        resumo: "1 de 3 concluído",
        passos: [
          "Pedido recebido",
          "Confirmação do pagamento",
          "Instalar e criar a palavra-passe"
        ],
        feito: "Feito",
        agora: "Agora",
        depois: "A seguir"
      },
      concluir: {
        selo: "Para concluir",
        titulo: "Conclua o pagamento",
        formas: [],
        instrucoes: "Siga as instruções mostradas ao finalizar o pedido. Em geral, a Hotmart também as envia para o e-mail usado no pedido.",
        instrucoesGeral: "Siga as instruções mostradas ao finalizar o pedido. Em geral, a Hotmart também as envia para o e-mail usado no pedido.",
        instrucoesSoEmail: "Em geral, a Hotmart envia as instruções de pagamento para o e-mail usado no pedido. Se não as encontrar, escreva para o apoio ao cliente.",
        jaPagou: "Se já pagou, basta aguardar a confirmação."
      },
      acesso: {
        selo: "Depois da confirmação",
        titulo: "Como recebe o acesso",
        texto: [
          "As instruções de acesso chegam ao ",
          {
            b: "e-mail que usou no pagamento"
          },
          ". Se indicou o seu WhatsApp corretamente, também as deve receber lá."
        ]
      },
      app: {
        selo: "Entretanto",
        titulo: "Deixe já a app instalada",
        texto: [
          "Depois da confirmação, abra a app, toque em ",
          {
            b: "Primeiro acesso? Ativar conta"
          },
          " e use o e-mail do pagamento."
        ]
      },
      webAntes: "Depois da confirmação, também pode usar a app no navegador.",
      webLink: "Abrir a versão web",
      suporteAntes: "Dúvidas? Escreva para",
      frase: "Volte amanhã."
    },
    "aguardando-analise": {
      aba: "Pagamento em análise · Diariamente",
      descricao: "O seu pagamento do Diariamente está em análise. Assim que for aprovado, o acesso fica disponível.",
      selo: "Em análise",
      titulo: [
        "O seu pagamento está",
        "em análise."
      ],
      sub: "A entidade responsável pelo pagamento está a analisar a transação. O prazo depende dela.",
      trilha: {
        rotulo: "O seu progresso",
        resumo: "1 de 3 concluído",
        passos: [
          "Pedido recebido",
          "Confirmação do pagamento",
          "Instalar e criar a palavra-passe"
        ],
        feito: "Feito",
        agora: "Agora",
        depois: "A seguir"
      },
      calma: {
        selo: "Entretanto",
        titulo: "Não precisa de fazer nada",
        texto: [
          "Quando o pagamento for aprovado, as instruções de acesso chegam ao ",
          {
            b: "e-mail que usou no pagamento"
          },
          ". Se indicou o seu WhatsApp corretamente, também as deve receber lá. Pode fechar esta página."
        ]
      },
      app: {
        selo: "Se quiser ganhar tempo",
        titulo: "Deixe já a app instalada",
        texto: [
          "Depois da aprovação, abra a app, toque em ",
          {
            b: "Primeiro acesso? Ativar conta"
          },
          " e use o e-mail do pagamento."
        ]
      },
      webAntes: "Depois da aprovação, também pode usar a app no navegador.",
      webLink: "Abrir a versão web",
      suporteAntes: "Dúvidas? Escreva para",
      frase: "Volte amanhã."
    },
    baixar: {
      aba: "Instalar a app · Diariamente",
      descricao: "Instale o Diariamente no iPhone ou no Android.",
      titulo: [
        "O Diariamente",
        "no seu telemóvel."
      ],
      texto: "Disponível para iPhone e Android, com o mesmo acesso nos dois.",
      qrTitulo: "Aponte a câmara do telemóvel para o código",
      qrTexto: "O código abre a página para instalar a app.",
      lojasAntes: "Ou abra diretamente na loja:",
      appStore: "Descarregar na App Store",
      googlePlay: "Disponível no Google Play",
      primeiroAcesso: [
        "Ao abrir a app pela primeira vez, toque em ",
        {
          b: "Primeiro acesso? Ativar conta"
        },
        " e use o e-mail do pagamento."
      ],
      webAntes: "Prefere usar no navegador?",
      webLink: "Abrir a versão web",
      frase: "Volte amanhã."
    },
    lojas: {
      iphone: {
        botao: "Instalar no iPhone",
        nota: "Abre na App Store",
        outroAntes: "Usa Android?",
        outroLink: "Instalar pelo Google Play"
      },
      android: {
        botao: "Instalar no Android",
        nota: "Abre no Google Play",
        outroAntes: "Usa iPhone?",
        outroLink: "Instalar pela App Store"
      },
      computador: {
        titulo: "Aponte a câmara do telemóvel para o código",
        texto: "O código abre a página para instalar a app.",
        lojasAntes: "Ou abra a loja:"
      },
      appStore: "Descarregar na App Store",
      googlePlay: "Disponível no Google Play",
      appStoreAria: "Descarregue o Diariamente na App Store",
      googlePlayAria: "Descarregue o Diariamente no Google Play",
      qrAlt: "Código QR que abre a página para instalar o Diariamente no telemóvel"
    }
  },
  en: {
    aprovado: {
      aba: "Payment approved · Diariamente",
      descricao: "Your payment was approved. Install the app and create your password to get started.",
      selo: "Payment approved",
      titulo: [
        "Your year",
        "starts now."
      ],
      sub: "Welcome to Diariamente. Now just install the app and create your password.",
      trilha: {
        rotulo: "Your progress",
        resumo: "1 of 3 done",
        passos: [
          "Payment approved",
          "Install the app",
          "Create your password"
        ],
        feito: "Done",
        agora: "Now",
        depois: "Next"
      },
      app: {
        selo: "Step 2",
        titulo: "Install the app",
        jaInstalado: "Already have the app? Go to step 3."
      },
      senha: {
        selo: "Step 3",
        titulo: "Create your password in the app",
        passos: [
          [
            "The app is in Portuguese and Spanish. Open it and tap ",
            {
              b: "Primeiro acesso? Ativar conta"
            },
            " (First access? Activate account), below the ",
            {
              pt: "Entrar"
            },
            " (Sign in) button."
          ],
          [
            "Enter the ",
            {
              b: "email you used for the payment"
            },
            "."
          ],
          [
            "Create your password. The app confirms it with a 6-digit code sent to the WhatsApp number from your payment. No WhatsApp? You confirm through a link sent to your email."
          ]
        ]
      },
      whatsapp: {
        selo: "On WhatsApp",
        titulo: "Check your WhatsApp",
        texto: "Did you add your WhatsApp number at checkout? You should get a message there with the steps and buttons to install the app."
      },
      naoRecebeu: {
        titulo: "Didn't get it?",
        itens: [
          {
            p: "The WhatsApp message didn't arrive.",
            r: [
              "The message needs a valid WhatsApp number in your payment details. If it was left blank or has a typo, it won't arrive. The steps on this page are the same as in the message."
            ]
          },
          {
            p: "The access email didn't arrive.",
            r: [
              "Check your spam folder and the Promotions tab. Also look for the confirmation Hotmart sent you: the address that got it is the email you use in the app."
            ]
          },
          {
            p: "The code didn't arrive.",
            r: [
              "If the app says it sent a link, look in your payment email. Check spam as well. Wrong number? Write to ",
              {
                atendimento: true
              },
              " with your payment email and the correct WhatsApp number."
            ]
          }
        ]
      },
      webAntes: "Prefer to start now in your browser?",
      webAquiAntes: "Prefer to start right here?",
      webLink: "Open the web version",
      suporteAntes: "Trouble signing in? Write to",
      frase: "Come back tomorrow."
    },
    "aguardando-pagamento": {
      aba: "Payment pending · Diariamente",
      descricao: "We got your Diariamente order. The payment still needs to be confirmed.",
      selo: "Order received",
      titulo: [
        "Waiting for",
        "payment confirmation."
      ],
      sub: "Once it's confirmed, your account is created with the email you used for the payment.",
      trilha: {
        rotulo: "Your progress",
        resumo: "1 of 3 done",
        passos: [
          "Order received",
          "Payment confirmation",
          "Install and create password"
        ],
        feito: "Done",
        agora: "Now",
        depois: "Next"
      },
      concluir: {
        selo: "To finish",
        titulo: "Complete your payment",
        formas: [],
        instrucoes: "Follow the instructions shown when you placed your order. Hotmart usually sends them to the email on your order as well.",
        instrucoesGeral: "Follow the instructions shown when you placed your order. Hotmart usually sends them to the email on your order as well.",
        instrucoesSoEmail: "Hotmart usually sends the payment instructions to the email on your order. If you can't find them, contact support.",
        jaPagou: "Already paid? Just wait for the confirmation."
      },
      acesso: {
        selo: "After confirmation",
        titulo: "How you get access",
        texto: [
          "Access instructions go to the ",
          {
            b: "email you used for the payment"
          },
          ". If you entered your WhatsApp number correctly, they should arrive there as well."
        ]
      },
      app: {
        selo: "Meanwhile",
        titulo: "Install the app now",
        texto: [
          "The app is in Portuguese and Spanish. After confirmation, open it, tap ",
          {
            b: "Primeiro acesso? Ativar conta"
          },
          " (First access? Activate account) and use your payment email."
        ]
      },
      webAntes: "After confirmation, you can also use the app in your browser.",
      webLink: "Open the web version",
      suporteAntes: "Questions? Write to",
      frase: "Come back tomorrow."
    },
    "aguardando-analise": {
      aba: "Payment under review · Diariamente",
      descricao: "Your Diariamente payment is under review. Once it's approved, your access is unlocked.",
      selo: "Under review",
      titulo: [
        "Your payment is",
        "under review."
      ],
      sub: "The company processing your payment is reviewing the transaction. The timing depends on them.",
      trilha: {
        rotulo: "Your progress",
        resumo: "1 of 3 done",
        passos: [
          "Order received",
          "Payment confirmation",
          "Install and create password"
        ],
        feito: "Done",
        agora: "Now",
        depois: "Next"
      },
      calma: {
        selo: "Meanwhile",
        titulo: "You don't need to do anything",
        texto: [
          "Once the payment is approved, access instructions go to the ",
          {
            b: "email you used for the payment"
          },
          ". If you entered your WhatsApp number correctly, they should arrive there as well. You can close this page."
        ]
      },
      app: {
        selo: "Want to save time?",
        titulo: "Install the app now",
        texto: [
          "The app is in Portuguese and Spanish. After approval, open it, tap ",
          {
            b: "Primeiro acesso? Ativar conta"
          },
          " (First access? Activate account) and use your payment email."
        ]
      },
      webAntes: "After approval, you can also use the app in your browser.",
      webLink: "Open the web version",
      suporteAntes: "Questions? Write to",
      frase: "Come back tomorrow."
    },
    baixar: {
      aba: "Get the app · Diariamente",
      descricao: "Install Diariamente on iPhone or Android.",
      titulo: [
        "Diariamente",
        "on your phone."
      ],
      texto: "Available for iPhone and Android, with the same access on both.",
      qrTitulo: "Point your phone's camera at the code",
      qrTexto: "The code opens the page to install the app.",
      lojasAntes: "Or go straight to the store:",
      appStore: "Download on the App Store",
      googlePlay: "Get it on Google Play",
      primeiroAcesso: [
        "The app is in Portuguese and Spanish. The first time you open it, tap ",
        {
          b: "Primeiro acesso? Ativar conta"
        },
        " (First access? Activate account) and use your payment email."
      ],
      webAntes: "Prefer to use it in your browser?",
      webLink: "Open the web version",
      frase: "Come back tomorrow."
    },
    lojas: {
      iphone: {
        botao: "Install on iPhone",
        nota: "Opens the App Store",
        outroAntes: "On Android?",
        outroLink: "Install from Google Play"
      },
      android: {
        botao: "Install on Android",
        nota: "Opens Google Play",
        outroAntes: "On iPhone?",
        outroLink: "Install from the App Store"
      },
      computador: {
        titulo: "Point your phone's camera at the code",
        texto: "The code opens the page to install the app.",
        lojasAntes: "Or open the store:"
      },
      appStore: "Download on the App Store",
      googlePlay: "Get it on Google Play",
      appStoreAria: "Download Diariamente on the App Store",
      googlePlayAria: "Get Diariamente on Google Play",
      qrAlt: "QR code that opens the page to install Diariamente on your phone"
    }
  }
};
