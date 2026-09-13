import { EMPRESA, SITE } from "@/config";
import { LegalShell } from "@/components/LegalShell";
import { metadataDaPagina } from "@/lib/seo";
import { caminho } from "@/lib/rotas";

/* =====================================================================
   POLÍTICA DE PRIVACIDADE · PT
   ---------------------------------------------------------------------
   Cobre LGPD (Brasil) e RGPD (União Europeia) no mesmo documento, porque
   o produto é vendido a partir do Brasil para público que inclui
   Portugal e Espanha.

   DECISÕES QUE ESTÃO AQUI E PRECISAM SER RESPEITADAS:

   1. A Science Play é RESPONSÁVEL PELO TRATAMENTO, não dona dos dados.
      Dado pessoal não é propriedade. Afirmar posse não protege: expõe.

   2. O compartilhamento com parceiros e patrocinadores é baseado em
      CONSENTIMENTO ESPECÍFICO, coletado em caixa separada e
      desmarcada. Cláusula genérica em política não é consentimento
      válido (RGPD art. 7º(4); LGPD art. 8º §4º).

   3. As categorias de destinatários estão NOMEADAS. RGPD art. 13(1)(e)
      e LGPD art. 9º, III exigem informar os destinatários.

   4. Recusar marketing NÃO bloqueia o acesso ao produto. Condicionar
      serviço a consentimento não necessário invalida o consentimento.

   ISTO NÃO SUBSTITUI REVISÃO JURÍDICA. Foi escrito para ser um ponto de
   partida sólido e defensável, não um parecer.
   ===================================================================== */

export const metadata = metadataDaPagina("privacidade", "pt");

export default function Privacidade() {
  return (
    <LegalShell lang="pt" titulo="Política de Privacidade" atualizado={EMPRESA.vigenciaLegal}>
      <p>
        Esta Política explica como tratamos dados pessoais no Diariamente. Ela vale para
        todas as pessoas usuárias, no Brasil e fora dele, e foi escrita para atender
        simultaneamente à Lei Geral de Proteção de Dados brasileira (Lei nº 13.709/2018,
        &ldquo;LGPD&rdquo;) e ao Regulamento Geral sobre a Proteção de Dados da União
        Europeia (Regulamento UE 2016/679, &ldquo;RGPD&rdquo;).
      </p>

      <h2>1. Quem é o responsável pelo tratamento</h2>
      <p>
        <strong>{EMPRESA.razaoSocial}</strong>, inscrita no CNPJ nº {EMPRESA.cnpj}, é a
        controladora dos dados (&ldquo;responsável pelo tratamento&rdquo; no RGPD;
        &ldquo;controladora&rdquo; na LGPD). O Diariamente é um produto operado por ela.
      </p>
      <p>
        Endereço: {EMPRESA.endereco}
        <br />
        Contato para assuntos de privacidade:{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>
      </p>
      <p>
        A Science Play é <strong>responsável pelo tratamento</strong> dos dados, e não sua
        proprietária. Dados pessoais não são propriedade de ninguém: você mantém seus
        direitos sobre eles a qualquer tempo, e esta Política existe para descrever como os
        tratamos e como você os exerce.
      </p>

      <h2>2. Quais dados tratamos</h2>
      <p>
        <strong>Dados que você fornece:</strong> nome, e-mail, telefone e, quando aplicável,
        país, instituição de ensino, curso e período. Nas condições exclusivas para o Brasil,
        também o CPF, usado apenas para garantir um código por pessoa.
      </p>
      <p>
        <strong>Dados de pagamento:</strong> processados diretamente pela plataforma de
        checkout. <strong>Não recebemos nem armazenamos dados de cartão.</strong>
      </p>
      <p>
        <strong>Dados de uso:</strong> páginas visitadas, origem do acesso, dispositivo e
        interações, coletados por cookies e ferramentas de medição.
      </p>
      <p>
        <strong>Dados do aplicativo:</strong> registros de leitura, ações registradas e
        contagem de voltas. São necessários para a própria funcionalidade do produto.
      </p>
      <p>
        <strong>Não tratamos dados sensíveis.</strong> O Diariamente não coleta informações
        sobre saúde, diagnóstico, condição clínica, origem racial ou étnica, convicção
        religiosa, opinião política, filiação sindical, dado genético ou biométrico, nem vida
        ou orientação sexual. O conteúdo é reflexivo e não clínico, e o produto não pergunta
        nada disso.
      </p>

      <h2>3. Com que base legal e para quê</h2>
      <table className="legal-tabela">
        <thead>
          <tr>
            <th>Finalidade</th>
            <th>Base legal</th>
            <th>Você pode recusar?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Processar a compra, liberar e manter o acesso, prestar suporte</td>
            <td>Execução de contrato<br /><small>RGPD 6(1)(b) · LGPD 7º, V</small></td>
            <td>Não, sem isso não há como entregar o produto</td>
          </tr>
          <tr>
            <td>Emitir e validar código de condição especial</td>
            <td>Execução de contrato e diligências pré-contratuais<br /><small>RGPD 6(1)(b) · LGPD 7º, V</small></td>
            <td>Não solicitar o código</td>
          </tr>
          <tr>
            <td>Cumprir obrigações fiscais, contábeis e legais</td>
            <td>Obrigação legal<br /><small>RGPD 6(1)(c) · LGPD 7º, II</small></td>
            <td>Não</td>
          </tr>
          <tr>
            <td>Segurança, prevenção a fraude e abuso</td>
            <td>Interesse legítimo<br /><small>RGPD 6(1)(f) · LGPD 7º, IX</small></td>
            <td>Sim, por oposição fundamentada</td>
          </tr>
          <tr>
            <td>Comunicações sobre o próprio Diariamente</td>
            <td>Consentimento<br /><small>RGPD 6(1)(a) · LGPD 7º, I</small></td>
            <td><strong>Sim, a qualquer momento</strong></td>
          </tr>
          <tr>
            <td>Compartilhamento com grupo, parceiros e patrocinadores para comunicações deles</td>
            <td>Consentimento específico<br /><small>RGPD 6(1)(a) · LGPD 7º, I</small></td>
            <td><strong>Sim, a qualquer momento</strong></td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Recusar as duas últimas não afeta o acesso ao produto.</strong> Elas são
        oferecidas em caixas separadas e desmarcadas, e a aceitação de uma não implica a da
        outra.
      </p>

      <h2>4. Com quem compartilhamos</h2>
      <p>
        <strong>4.1. Operadores necessários à prestação.</strong> Tratam dados por nossa
        conta e sob nossas instruções, sem uso próprio: plataforma de pagamento, envio de
        e-mail e mensageria, hospedagem e infraestrutura, e ferramentas de medição.
      </p>
      <p>
        <strong>4.2. Empresas do grupo e parceiros comerciais.</strong> A Science Play atua
        com marcas, eventos e parceiros próprios, e mantém relações com patrocinadores. O
        compartilhamento de dados com essas empresas, <strong>para que enviem comunicações
        próprias</strong>, ocorre <strong>exclusivamente mediante o seu consentimento
        específico</strong>, manifestado em caixa própria e desmarcada no momento do
        cadastro.
      </p>
      <p>As categorias de destinatários são:</p>
      <ul>
        <li>empresas controladas, controladoras ou sob controle comum da {EMPRESA.razaoSocial};</li>
        <li>parceiros comerciais em ações conjuntas de educação, conteúdo e eventos;</li>
        <li>patrocinadores de ações, eventos e conteúdos do Diariamente ou da Science Play.</li>
      </ul>
      <p>
        Ao receberem seus dados, essas empresas passam a ser responsáveis pelo tratamento
        que realizarem, e deverão informá-lo em suas próprias políticas. Você pode revogar
        essa autorização a qualquer momento escrevendo para{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>, sem qualquer
        prejuízo ao seu acesso ao produto. A revogação não desfaz tratamentos já realizados
        com base no consentimento anterior.
      </p>
      <p>
        <strong>4.3. Autoridades.</strong> Quando houver obrigação legal, ordem judicial ou
        requisição de autoridade competente.
      </p>
      <p>
        <strong>Não vendemos dados pessoais.</strong> Em nenhuma hipótese, com ou sem
        consentimento.
      </p>

      <h2>5. Transferência internacional</h2>
      <p>
        Operamos a partir do Brasil e utilizamos provedores situados em outros países,
        inclusive nos Estados Unidos e na União Europeia. Nessas transferências adotamos as
        salvaguardas previstas no art. 33 da LGPD e, quando envolvidos dados de pessoas na
        União Europeia, os mecanismos do Capítulo V do RGPD, em regra as Cláusulas
        Contratuais-Tipo aprovadas pela Comissão Europeia.
      </p>
      <p>
        Se você está na União Europeia: o Brasil não possui, até esta data, decisão de
        adequação da Comissão Europeia. A transferência dos seus dados para o Brasil
        fundamenta-se nas Cláusulas Contratuais-Tipo, disponíveis mediante solicitação ao
        nosso contato de privacidade.
      </p>

      <h2>6. Por quanto tempo guardamos</h2>
      <table className="legal-tabela">
        <thead>
          <tr><th>Dado</th><th>Prazo</th><th>Por quê</th></tr>
        </thead>
        <tbody>
          <tr><td>Cadastro e acesso</td><td>Enquanto durar a relação, e por 5 anos após o término</td><td>Prazo prescricional do CDC e do Código Civil</td></tr>
          <tr><td>Registros fiscais da compra</td><td>5 anos</td><td>Obrigação legal</td></tr>
          <tr><td>Registros de acesso à aplicação</td><td>6 meses</td><td>Marco Civil da Internet, art. 15</td></tr>
          <tr><td>Consentimentos e revogações</td><td>Enquanto necessário à comprovação</td><td>Ônus da prova do responsável</td></tr>
          <tr><td>Dados de marketing</td><td>Até a revogação, mais o prazo de execução do descadastro</td><td>—</td></tr>
        </tbody>
      </table>
      <p>Encerrados os prazos, os dados são eliminados ou anonimizados de forma irreversível.</p>

      <h2>7. Seus direitos</h2>
      <p>
        <strong>Na LGPD (art. 18):</strong> confirmação da existência de tratamento, acesso,
        correção, anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em
        desconformidade, portabilidade, informação sobre compartilhamento, informação sobre a
        possibilidade de não consentir, revogação do consentimento e revisão de decisões
        automatizadas.
      </p>
      <p>
        <strong>No RGPD (arts. 15 a 22), se você está na União Europeia:</strong> acesso,
        retificação, apagamento (&ldquo;direito a ser esquecido&rdquo;), limitação do
        tratamento, <strong>portabilidade em formato estruturado e de uso corrente</strong>,{" "}
        <strong>oposição ao tratamento</strong>, inclusive à definição de perfis, e o direito
        de não se sujeitar a decisão exclusivamente automatizada com efeitos significativos.
      </p>
      <p>
        Para exercer qualquer um deles, escreva para{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>. Respondemos em
        até <strong>15 dias</strong> (LGPD) ou <strong>um mês</strong> (RGPD), prorrogável por
        mais dois meses em casos complexos, com aviso prévio a você. O exercício é gratuito.
      </p>
      <p>
        <strong>Reclamação.</strong> Você pode reclamar à Autoridade Nacional de Proteção de
        Dados (ANPD), no Brasil, ou à autoridade de controle do seu Estado-Membro, na União
        Europeia.
      </p>

      <h2>8. Cookies e medição</h2>
      <p>
        Usamos cookies estritamente necessários ao funcionamento do site e cookies de medição
        e publicidade. Os de medição e publicidade{" "}
        <strong>só são ativados mediante seu consentimento</strong>, manifestado no aviso
        exibido no primeiro acesso, e podem ser revistos a qualquer momento. Cookies
        estritamente necessários não dependem de consentimento e não podem ser desativados
        sem inviabilizar o site.
      </p>

      <h2>9. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizativas adequadas ao risco, incluindo controle de
        acesso, criptografia em trânsito e segregação de ambientes. Em caso de incidente de
        segurança com risco relevante, comunicaremos a autoridade competente e as pessoas
        afetadas nos prazos e formas da LGPD (art. 48) e do RGPD (arts. 33 e 34).
      </p>

      <h2>10. Menores de idade</h2>
      <p>
        O Diariamente não se destina a menores de 18 anos e não coletamos dados de crianças e
        adolescentes de forma consciente. Identificado um cadastro nessa condição, os dados
        são eliminados.
      </p>

      <h2>11. Alterações</h2>
      <p>
        Esta Política pode ser atualizada. A versão vigente está sempre em{" "}
        <a href={`${SITE.dominio}${caminho("privacidade", "pt")}`}>
          {SITE.dominio.replace("https://", "")}{caminho("privacidade", "pt")}
        </a>
        , com a data da última atualização. Alterações relevantes nas finalidades ou nos
        destinatários serão comunicadas e, quando a base legal for o consentimento, um novo
        consentimento será solicitado.
      </p>

      <h2>12. Contato</h2>
      <p>
        Assuntos de privacidade e exercício de direitos:{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
      </p>
    </LegalShell>
  );
}
