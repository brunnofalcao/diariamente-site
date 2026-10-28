/* =====================================================================
   PÓS-PAGAMENTO · textos por idioma
   ---------------------------------------------------------------------
   Tudo o que a pessoa lê nas páginas de obrigado (aprovado, aguardando
   pagamento, em análise) e no /baixar, nos dois idiomas do projeto
   (decisão do dono, 28/10/2026: só português e espanhol):
     pt  português do Brasil: Brasil, Portugal e "mundo" (sem prefixo)
     es  espanhol da América Latina: América Latina e Espanha (/es/...)
   Os dois têm as MESMAS chaves (o teste confere). Pix e boleto só
   aparecem para o mercado br (components/ObrigadoShell.tsx): quem lê em
   português e paga em dólar ou euro vê a linha geral das instruções. A
   lista de formas do espanhol é vazia.

   FORMATO. Texto rico é uma lista: texto simples, { b: "..." } (negrito;
   se for o rótulo exato do botão do app, vira o "chip" que imita o
   botão) e { atendimento: true } (o e-mail do atendimento, com link).
   Título: uma linha por item.

   REGRAS DA MARCA (testes/obrigado.test.mjs confere): nunca "compra" nem
   "comprar" (nem no espanhol: pedido, pago, suscripción, acceso), sem
   travessão, no máximo um emoji por página, frases curtas, nada que o
   sistema não cumpra, sem dizer em que idioma chegam o WhatsApp e o
   e-mail e sem garantir que o WhatsApp chega (depende de um número
   válido no pagamento).

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
      sub: "Boas-vindas ao Diariamente. Agora são só dois passos: instalar o app e criar sua senha.",
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
      sub: "Te damos la bienvenida a Diariamente. Ahora son solo dos pasos: instalar la app y crear tu contraseña.",
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
  }
};
