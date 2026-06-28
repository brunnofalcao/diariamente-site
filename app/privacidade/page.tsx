import type { Metadata } from "next";
import { EMPRESA, SITE } from "@/config";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Política de Privacidade — Diariamente",
  robots: { index: true, follow: true },
};

export default function Privacidade() {
  return (
    <LegalShell titulo="Política de Privacidade" atualizado={EMPRESA.vigenciaLegal}>
      <p>
        Esta Política de Privacidade descreve como a {EMPRESA.razaoSocial}, inscrita no
        CNPJ nº {EMPRESA.cnpj} ("Science Play", "nós"), coleta, utiliza, armazena, compartilha
        e protege os dados pessoais dos usuários ("você") do produto Diariamente, composto pelo
        aplicativo, pelo site e, no plano combo, pelo livro físico. Este documento está em
        conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD) e com as
        diretrizes de privacidade das lojas de aplicativos (Apple App Store e Google Play).
      </p>
      <p>
        Ao utilizar o Diariamente, você declara estar ciente desta Política. Recomendamos a
        leitura atenta antes de fornecer qualquer dado pessoal.
      </p>

      <h2>1. Quem é o controlador dos seus dados</h2>
      <p>
        O controlador, responsável pelas decisões sobre o tratamento dos seus dados pessoais, é
        a {EMPRESA.razaoSocial} (CNPJ {EMPRESA.cnpj}). Para qualquer questão relacionada a
        privacidade e proteção de dados, ou para exercer seus direitos, o canal de contato com o
        nosso encarregado pelo tratamento de dados (DPO) é o e-mail{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <p>Coletamos apenas os dados necessários para entregar e operar o Diariamente:</p>
      <ul>
        <li>
          <strong>Dados de cadastro e acesso:</strong> nome e e-mail, usados para criar e
          autenticar sua conta e enviar o acesso ao aplicativo.
        </li>
        <li>
          <strong>Dados de contato para lembretes:</strong> número de telefone/WhatsApp, quando
          você opta por receber os lembretes diários.
        </li>
        <li>
          <strong>Endereço de entrega:</strong> apenas no plano combo, para envio do livro físico.
        </li>
        <li>
          <strong>Dados de uso do aplicativo:</strong> provocações lidas, progresso, sequência
          (ofensiva), conquistas e ações registradas — necessários para o funcionamento do produto.
        </li>
        <li>
          <strong>Dados de pagamento:</strong> processados diretamente pela plataforma Hotmart.
          Não coletamos nem armazenamos números de cartão de crédito em nossos sistemas.
        </li>
        <li>
          <strong>Dados técnicos e de navegação:</strong> informações como tipo de dispositivo,
          sistema operacional, identificadores de sessão e cookies, coletados para segurança,
          funcionamento e melhoria da experiência.
        </li>
      </ul>
      <p>
        Praticamos a minimização de dados: não solicitamos informações que não sejam relevantes
        para o funcionamento do produto.
      </p>

      <h2>3. Para que usamos seus dados e com qual base legal</h2>
      <p>
        Tratamos seus dados com fundamento nas bases legais do art. 7º da LGPD, conforme a
        finalidade:
      </p>
      <ul>
        <li>
          <strong>Execução de contrato (art. 7º, V):</strong> entregar o acesso ao app, processar
          o pedido, enviar o livro no combo e dar suporte.
        </li>
        <li>
          <strong>Consentimento (art. 7º, I):</strong> envio de lembretes por WhatsApp e
          comunicações de marketing, quando você autoriza. Você pode revogar a qualquer momento.
        </li>
        <li>
          <strong>Legítimo interesse (art. 7º, IX):</strong> segurança da informação, prevenção a
          fraudes e melhoria do produto, sempre respeitando seus direitos e expectativas.
        </li>
        <li>
          <strong>Cumprimento de obrigação legal (art. 7º, II):</strong> guarda de registros e
          atendimento a obrigações fiscais e regulatórias.
        </li>
      </ul>

      <h2>4. Com quem compartilhamos</h2>
      <p>
        Compartilhamos dados apenas com operadores necessários à operação do Diariamente, na
        medida do necessário e sob obrigações de proteção de dados. <strong>Não vendemos seus
        dados pessoais.</strong> Os principais parceiros são:
      </p>
      <ul>
        <li><strong>Hotmart</strong> — processamento de pagamento, emissão e gestão do pedido.</li>
        <li><strong>Meta (WhatsApp / Cloud API)</strong> — envio dos lembretes diários.</li>
        <li><strong>Provedores de infraestrutura e banco de dados</strong> — hospedagem segura dos dados do app.</li>
        <li><strong>Ferramentas de medição</strong> — como Google Analytics e Meta Pixel, quando ativas, para entender o uso da página e das campanhas.</li>
        <li><strong>Transportadora</strong> — apenas no combo, para entrega do livro físico.</li>
      </ul>
      <p>
        Eventuais transferências internacionais de dados (por uso de provedores fora do Brasil)
        seguem as salvaguardas previstas na LGPD.
      </p>

      <h2>5. Cookies e tecnologias de medição</h2>
      <p>
        No site, podemos usar cookies e tecnologias semelhantes (incluindo Meta Pixel e Google
        Analytics) para medir desempenho e melhorar a experiência. Você pode gerenciar ou bloquear
        cookies nas configurações do seu navegador. No aplicativo, qualquer tecnologia de
        rastreamento sujeita à App Tracking Transparency (ATT) da Apple só é ativada mediante a sua
        permissão explícita, solicitada pelo próprio sistema operacional.
      </p>

      <h2>6. Seus direitos como titular (LGPD)</h2>
      <p>A qualquer momento, e de forma gratuita, você pode solicitar:</p>
      <ul>
        <li>Confirmação da existência de tratamento e acesso aos seus dados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
        <li>Portabilidade dos dados a outro fornecedor;</li>
        <li>Eliminação dos dados tratados com base no seu consentimento;</li>
        <li>Informação sobre com quem compartilhamos seus dados;</li>
        <li>Revogação do consentimento.</li>
      </ul>
      <p>
        Para exercer qualquer direito, escreva para{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>. Responderemos no
        menor prazo possível, conforme a LGPD.
      </p>

      <h2>7. Como revogar consentimento</h2>
      <p>
        Você pode parar de receber lembretes por WhatsApp respondendo à própria mensagem com o
        pedido de cancelamento, ajustando as preferências no aplicativo, ou escrevendo para o nosso
        canal de contato. A revogação não afeta a legalidade do tratamento feito antes dela, nem o
        acesso ao conteúdo já adquirido.
      </p>

      <h2>8. Por quanto tempo guardamos</h2>
      <p>
        Mantemos os dados pelo tempo necessário às finalidades descritas e ao cumprimento de
        obrigações legais e regulatórias. Encerrada a finalidade, os dados são eliminados ou
        anonimizados, salvo hipóteses de guarda obrigatória previstas em lei.
      </p>

      <h2>9. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não
        autorizado, perda, alteração ou divulgação indevida. Nenhum sistema é totalmente imune a
        riscos; em caso de incidente de segurança relevante, atuaremos conforme a LGPD, incluindo,
        quando aplicável, a comunicação aos titulares afetados e à ANPD.
      </p>

      <h2>10. Privacidade de menores</h2>
      <p>
        O Diariamente é destinado a maiores de 18 anos. Não coletamos intencionalmente dados de
        menores de idade. Caso identifiquemos coleta inadvertida, eliminaremos os dados.
      </p>

      <h2>11. Alterações desta Política</h2>
      <p>
        Podemos atualizar esta Política periodicamente. A versão vigente estará sempre disponível
        nesta página, com a data de atualização. Mudanças relevantes poderão ser comunicadas pelos
        nossos canais.
      </p>

      <h2>12. Contato</h2>
      <p>
        {EMPRESA.razaoSocial} — CNPJ {EMPRESA.cnpj}.<br />
        Encarregado pelo tratamento de dados (DPO) /  canal do titular:{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.<br />
        Site: <a href={EMPRESA.site}>{EMPRESA.site.replace("https://", "")}</a>.
      </p>
    </LegalShell>
  );
}
