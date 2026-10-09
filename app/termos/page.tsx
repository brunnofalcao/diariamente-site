import { metadataDaPagina } from "@/lib/seo";
import { EMPRESA, SITE, GARANTIA } from "@/config";
import { LegalShell } from "@/components/LegalShell";

export const metadata = metadataDaPagina("termos", "pt");

export default function Termos() {
  return (
    <LegalShell lang="pt" titulo="Termos de Uso" atualizado={EMPRESA.vigenciaLegal}>
      <p>
        Estes Termos de Uso ("Termos") regem o acesso e a utilização do Diariamente, produto
        digital de desenvolvimento profissional composto pelo aplicativo, pelo conteúdo de
        provocações diárias, oferecido pela{" "}
        {EMPRESA.razaoSocial}, inscrita no CNPJ nº {EMPRESA.cnpj} ("Science Play", "nós"). Ao
        adquirir e utilizar o Diariamente, você ("usuário") declara ter lido, compreendido e
        aceito integralmente estes Termos.
      </p>

      <h2>1. O que é o Diariamente</h2>
      <p>
        O Diariamente disponibiliza 365 provocações, uma para cada dia, por meio de um
        aplicativo, com recursos de acompanhamento de voltas acumuladas, conquistas,
        menu de Ações e lembretes. O conteúdo tem finalidade reflexiva e educacional, voltada ao
        desenvolvimento profissional. Os resultados dependem do engajamento individual de cada
        usuário; não prometemos resultados específicos ou garantidos.
      </p>

      <h2>2. Acesso e funcionamento</h2>
      <ul>
        <li>O acesso ao aplicativo é enviado por e-mail após a confirmação do pedido.</li>
        <li>O acesso é pessoal e intransferível, vinculado ao e-mail informado na aquisição.</li>
        <li>
          O conteúdo é liberado de forma progressiva: o aplicativo disponibiliza a provocação do
          dia vigente. O avanço para dias adicionais pode ocorrer conforme as regras de constância
          e progresso do próprio aplicativo. Essa dinâmica é parte intencional da proposta do
          produto.
        </li>
        <li>É vedado compartilhar, revender, reproduzir ou distribuir o conteúdo sem autorização.</li>
      </ul>

      <h2>3. Cadastro e responsabilidades do usuário</h2>
      <p>Ao utilizar o Diariamente, você se compromete a:</p>
      <ul>
        <li>Fornecer informações verdadeiras, exatas e atualizadas;</li>
        <li>Manter a confidencialidade do seu acesso;</li>
        <li>Não utilizar o produto para fins ilícitos ou que violem direitos de terceiros;</li>
        <li>Não tentar acessar áreas restritas, burlar mecanismos de segurança ou interferir no funcionamento do aplicativo.</li>
      </ul>

      <h2>4. Propriedade intelectual</h2>
      <p>
        Todo o conteúdo do Diariamente (textos, provocações, identidade visual, marca, software e
        demais elementos) é protegido por direitos autorais e de propriedade intelectual,
        pertencendo à {EMPRESA.razaoSocial}. A aquisição concede ao usuário uma licença de uso pessoal e intransferível, não
        exclusiva, e não transfere a titularidade de qualquer direito sobre o conteúdo.
      </p>

      {/* Uma seção só para garantia e arrependimento. Antes eram duas (5 e
          6) dizendo coisas diferentes, e a 6 falava em "condições
          específicas" para a devolução, contra a garantia incondicional
          prometida na página de vendas. TEXTO SUJEITO À APROVAÇÃO DO DONO. */}
      <h2>5. Garantia e direito de arrependimento</h2>
      <p>
        Oferecemos <strong>garantia incondicional de {GARANTIA.dias} dias</strong>, contados da
        confirmação da compra. Dentro desse prazo, você pode pedir a devolução integral do valor
        pago, sem precisar justificar.
      </p>
      <p>
        <strong>Como pedir:</strong> pela própria plataforma de pagamento ou escrevendo para{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>. O reembolso é
        feito pelo mesmo meio de pagamento, em até 14 dias da comunicação.
      </p>
      <p>
        <strong>Se você está no Brasil:</strong> o art. 49 do Código de Defesa do Consumidor (Lei
        nº 8.078/1990) garante 7 dias para desistir de compras feitas fora do estabelecimento
        comercial, contados da confirmação da compra ou do recebimento do produto. Nossa garantia
        de {GARANTIA.dias} dias já contempla esse prazo.
      </p>
      <p>
        <strong>Se você está na União Europeia:</strong> a Diretiva 2011/83/UE garante{" "}
        <strong>14 dias</strong> de direito de retratação, sem necessidade de justificativa.
        Esse prazo prevalece sobre a nossa garantia contratual sempre que for mais favorável
        a você.
      </p>
      <p>
        Atenção, e isto é do seu interesse saber: para conteúdo digital fornecido de imediato,
        o art. 16(m) da mesma Diretiva permite que o fornecedor exija consentimento expresso
        para o início imediato da execução, com reconhecimento de que isso faz perder o
        direito de retratação. <strong>Nós não fazemos isso.</strong> Você mantém o prazo
        integral mesmo tendo acessado o conteúdo.
      </p>

      <h2>6. Disponibilidade e alterações do serviço</h2>
      <p>
        Empenhamo-nos para manter o aplicativo disponível e funcional, mas o serviço pode passar
        por manutenções, atualizações ou indisponibilidades temporárias. Podemos aprimorar,
        modificar ou descontinuar funcionalidades, buscando preservar a experiência essencial do
        produto adquirido.
      </p>

      <h2>7. Limitação de responsabilidade</h2>
      <p>
        O Diariamente é uma ferramenta de reflexão e desenvolvimento profissional, e não substitui
        aconselhamento profissional especializado (jurídico, médico, psicológico, financeiro ou de
        carreira). Na máxima extensão permitida pela lei, a Science Play não se responsabiliza por
        decisões tomadas pelo usuário com base no conteúdo, nem por danos indiretos decorrentes do
        uso do produto.
      </p>

      <h2>8. Proteção de dados</h2>
      <p>
        O tratamento de dados pessoais relacionado ao Diariamente é regido pela nossa{" "}
        <a href="/privacidade">Política de Privacidade</a>, parte integrante destes Termos.
      </p>

      <h2>9. Alterações dos Termos</h2>
      <p>
        Podemos atualizar estes Termos a qualquer momento. A versão vigente estará sempre
        disponível nesta página, com a data de atualização. O uso continuado após alterações
        implica concordância com a versão atualizada.
      </p>

      <h2>10. Foro e contato</h2>
      <p>
        Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro do domicílio do
        consumidor para dirimir eventuais controvérsias, conforme o Código de Defesa do Consumidor.
      </p>
      <p>
        Contato: <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a> ·{" "}
        {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj}.
      </p>
    </LegalShell>
  );
}
