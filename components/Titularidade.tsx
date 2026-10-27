import { EMPRESA, SITE } from "@/config";
import { IdentificacaoDoGrupo } from "@/components/CnpjsDoGrupo";
import type { Lang } from "@/lib/i18n";

/* =====================================================================
   TITULARIDADE · seção 1 dos Termos e da Política (pt e es)
   ---------------------------------------------------------------------
   Decisão de Brunno (26/10/2026), que substitui a de 12/10/2026: o
   Diariamente é um produto Science Play®, operado pelas empresas do
   grupo. A seção abre com a linha de identificação aprovada
   (IdentificacaoDoGrupo, razão social e CNPJ de cada empresa, vindos de
   EMPRESA.grupo) e segue com endereço e os dois e-mails (Decreto
   7.962/2013, art. 2º).

   A cláusula diz:
     1. a Science Play®, por meio das empresas do grupo, é a dona e a
        responsável pelo Diariamente App e pelos dados pessoais
        (controladora);
     2. os pagamentos são processados pela Hotmart, SEM dizer quem a
        contratou: o item 3 já cobre o caso;
     3. qualquer empresa do grupo pode aparecer como vendedora em loja de
        aplicativos, na plataforma de pagamento ou em documento fiscal,
        sem mudar a titularidade nem a responsabilidade, e sem reduzir
        direito do consumidor (CDC: cláusula que tira responsabilidade do
        fornecedor é nula, então ela só AFIRMA a da Science Play).

   TEXTO SUJEITO A REVISÃO JURÍDICA (registrado no LEIA-ME). Um só
   componente para os quatro documentos: pt e es nunca divergem.
   ===================================================================== */

// O que a pessoa lê: sem www (config.ts, SITE.dominioVisivel).
const dominio = SITE.dominioVisivel;

// O endereço do config já termina em "Brasil". Se um dia ele voltar a ser
// nota interna "[...]", a linha some em vez de mostrá-la (a trava de
// scripts/checar-endereco.js também barra o build).
const temEndereco = !EMPRESA.endereco.startsWith("[");
const endereco = EMPRESA.endereco.replace(/\.$/, "");

function Contatos({ lang }: { lang: Lang }) {
  const suporte = <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>;
  const contato = <a href={`mailto:${EMPRESA.contatoEmail}`}>{EMPRESA.contatoEmail}</a>;
  return lang === "es" ? (
    <p>
      {temEndereco && (
        <>
          Dirección: {endereco}.
          <br />
        </>
      )}
      Atención a suscriptores y asuntos de privacidad: {suporte}
      <br />
      Contacto institucional: {contato}
    </p>
  ) : (
    <p>
      {temEndereco && (
        <>
          Endereço: {endereco}.
          <br />
        </>
      )}
      Atendimento a assinantes e assuntos de privacidade: {suporte}
      <br />
      Contato institucional: {contato}
    </p>
  );
}

export function Titularidade({ lang = "pt", doc }: { lang?: Lang; doc: "termos" | "privacidade" }) {
  const nome = <strong>{EMPRESA.marca}®</strong>;

  if (lang === "es") {
    return (
      <>
        <p><IdentificacaoDoGrupo lang="es" /></p>
        <p>
          Diariamente App, que comprende la aplicación, el sitio {dominio}, el contenido y la
          marca, es de titularidad de {nome}, a través de las empresas del grupo identificadas
          arriba (&ldquo;Science Play&rdquo;, &ldquo;nosotros&rdquo;).{" "}
          {doc === "termos"
            ? "Science Play es la proveedora de Diariamente App y la responsable ante ti, incluso por la garantía, la atención y el tratamiento de los datos personales."
            : "Science Play es la responsable del tratamiento de los datos personales tratados en Diariamente App, en el sitio y en la aplicación."}
        </p>
        <Contatos lang="es" />
        <p>
          {doc === "termos" && (
            <>
              Los pagos realizados en el sitio son procesados por Hotmart, que actúa como
              intermediaria en el cobro.{" "}
            </>
          )}
          Cualquier empresa del grupo económico de Science Play puede figurar como vendedora o
          desarrolladora en las tiendas de aplicaciones (como App Store y Google Play), en la
          plataforma de pago o en documentos fiscales. Eso no cambia la titularidad de
          Diariamente App ni de los derechos sobre él, que siguen siendo de{" "}
          {EMPRESA.marca}®, ni su responsabilidad ante ti
          {doc === "termos" ? " descrita en estas Condiciones y en la Política de Privacidad" : " como responsable del tratamiento"}, y
          no reduce ninguno de tus derechos.
        </p>
      </>
    );
  }

  return (
    <>
      <p><IdentificacaoDoGrupo lang="pt" /></p>
      <p>
        O Diariamente App, que compreende o aplicativo, o site {dominio}, o conteúdo e a marca, é
        de titularidade da {nome}, por meio das empresas do grupo identificadas acima
        (&ldquo;Science Play&rdquo;, &ldquo;nós&rdquo;).{" "}
        {doc === "termos"
          ? "A Science Play é a fornecedora do Diariamente App e a responsável por ele perante você, inclusive pela garantia, pelo atendimento e pelo tratamento dos dados pessoais."
          : "A Science Play é a controladora dos dados pessoais tratados no Diariamente App, no site e no aplicativo."}
      </p>
      <Contatos lang="pt" />
      <p>
        {doc === "termos" && (
          <>
            Os pagamentos feitos pelo site são processados pela Hotmart, que atua como
            intermediária na cobrança.{" "}
          </>
        )}
        Qualquer empresa do grupo econômico da Science Play pode aparecer como vendedora ou
        desenvolvedora nas lojas de aplicativos (como App Store e Google Play), na plataforma
        de pagamento ou em documento fiscal. Isso não altera a titularidade do Diariamente App
        nem dos direitos sobre ele, que continuam com a {EMPRESA.marca}®, nem a
        responsabilidade dela perante você
        {doc === "termos" ? " descrita nestes Termos e na Política de Privacidade" : " como controladora"}, e
        não reduz nenhum direito seu.
      </p>
    </>
  );
}
