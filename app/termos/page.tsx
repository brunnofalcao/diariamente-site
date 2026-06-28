import type { Metadata } from "next";
import { EMPRESA, SITE, GARANTIA } from "@/config";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Termos de Uso — Diariamente",
  robots: { index: true, follow: true },
};

export default function Termos() {
  return (
    <LegalShell titulo="Termos de Uso" atualizado={EMPRESA.vigenciaLegal}>
      <div className="legal-note">
        <p>
          ⚠️ Modelo-base. Antes de publicar, este documento deve ser revisado por um
          advogado e ter os dados da empresa ({EMPRESA.marca}) preenchidos no config.
        </p>
      </div>

      <p>
        Estes Termos de Uso regem o acesso e a utilização do Diariamente, produto digital
        composto pelo aplicativo e seu conteúdo de provocações diárias, oferecido por{" "}
        {EMPRESA.marca}. Ao adquirir e utilizar o Diariamente, você concorda com as condições abaixo.
      </p>

      <h2>1. O que é o Diariamente</h2>
      <p>
        O Diariamente é um produto de desenvolvimento profissional que disponibiliza 365
        provocações diárias por meio de aplicativo, com recursos de acompanhamento de
        constância (ofensiva), conquistas, ranking e lembretes. O combo inclui também o
        livro físico. O conteúdo tem finalidade reflexiva e educacional.
      </p>

      <h2>2. Acesso ao produto</h2>
      <ul>
        <li>O acesso ao aplicativo é enviado por e-mail após a confirmação do pedido.</li>
        <li>O acesso é pessoal e intransferível, vinculado ao e-mail informado na aquisição.</li>
        <li>É vedado compartilhar, revender ou distribuir o conteúdo sem autorização.</li>
      </ul>

      <h2>3. Uso adequado</h2>
      <p>Ao usar o Diariamente, você se compromete a não:</p>
      <ul>
        <li>Copiar, reproduzir ou redistribuir o conteúdo das provocações;</li>
        <li>Tentar acessar áreas restritas ou burlar mecanismos de segurança;</li>
        <li>Utilizar o produto para fins ilícitos ou que violem direitos de terceiros.</li>
      </ul>

      <h2>4. Propriedade intelectual</h2>
      <p>
        Todo o conteúdo do Diariamente — textos, provocações, identidade visual, marca e
        software — é protegido por direitos autorais e pertence a {EMPRESA.marca} e/ou aos
        seus autores. A aquisição concede licença de uso, não a titularidade do conteúdo.
      </p>

      <h2>5. Garantia e reembolso</h2>
      <p>{GARANTIA.texto}</p>
      <p>
        O pedido de reembolso dentro do prazo pode ser feito pelo e-mail de suporte. Para o
        combo com livro físico, condições específicas de devolução do item físico podem se
        aplicar e serão informadas no atendimento.
      </p>

      <h2>6. Resultados</h2>
      <p>
        O Diariamente oferece um método de constância, mas os resultados dependem do
        engajamento individual de cada pessoa. Não prometemos resultados específicos,
        garantidos ou em prazo determinado.
      </p>

      <h2>7. Pagamentos</h2>
      <p>
        As transações são processadas pela plataforma Hotmart, responsável pelo
        processamento de pagamento, emissão e cobrança, conforme os termos da própria
        plataforma.
      </p>

      <h2>8. Alterações</h2>
      <p>
        {EMPRESA.marca} pode atualizar estes Termos a qualquer momento. A versão vigente
        estará sempre disponível nesta página, com a data de atualização.
      </p>

      <h2>9. Contato</h2>
      <p>
        Dúvidas sobre estes Termos: <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
      </p>
    </LegalShell>
  );
}
