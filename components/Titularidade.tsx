import { EMPRESA, SITE } from "@/config";
import type { Lang } from "@/lib/i18n";

/* =====================================================================
   TITULARIDADE · seção 1 dos Termos e da Política (pt e es)
   ---------------------------------------------------------------------
   Decisão do dono (12/10/2026): o app é global, e no que é visível e
   exposto (rodapé, páginas de venda) entra só "Diariamente App by
   Science Play". Os dados completos da titular ficam AQUI, nos Termos e
   na Política, a um clique do rodapé: razão social, CNPJ, endereço e os
   dois e-mails (Decreto 7.962/2013, art. 2º).

   A cláusula precisa ficar "bem amarrada", porque o grupo usa outro CNPJ
   para outros fins. Ela diz, sem citar o nome da outra empresa:
     1. a titular (EMPRESA.razaoSocial) é a dona e a responsável pelo
        Diariamente App e pelos dados pessoais (controladora);
     2. os pagamentos são processados pela Hotmart, SEM dizer quem a
        contratou: a conta de produtor do 7448309 pode estar no nome de
        outra empresa do grupo, e o item 3 já cobre esse caso;
     3. outra empresa do mesmo grupo pode aparecer como vendedora em loja
        de aplicativos, na plataforma de pagamento ou em documento fiscal,
        sem mudar a titularidade nem a responsabilidade, e sem reduzir
        direito do consumidor (CDC: cláusula que tira responsabilidade do
        fornecedor é nula, então ela só AFIRMA a da titular).

   TEXTO SUJEITO A REVISÃO JURÍDICA (registrado no LEIA-ME). Um só
   componente para os quatro documentos: pt e es nunca divergem.
   ===================================================================== */

// O que a pessoa lê: sem www (config.ts, SITE.dominioVisivel).
const dominio = SITE.dominioVisivel;

function Contatos({ lang }: { lang: Lang }) {
  const suporte = <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>;
  const contato = <a href={`mailto:${EMPRESA.contatoEmail}`}>{EMPRESA.contatoEmail}</a>;
  return lang === "es" ? (
    <p>
      Dirección: {EMPRESA.endereco}, Brasil.
      <br />
      Atención a suscriptores y asuntos de privacidad: {suporte}
      <br />
      Contacto institucional: {contato}
    </p>
  ) : (
    <p>
      Endereço: {EMPRESA.endereco}.
      <br />
      Atendimento a assinantes e assuntos de privacidade: {suporte}
      <br />
      Contato institucional: {contato}
    </p>
  );
}

export function Titularidade({ lang = "pt", doc }: { lang?: Lang; doc: "termos" | "privacidade" }) {
  const nome = <strong>{EMPRESA.razaoSocial}</strong>;

  if (lang === "es") {
    return (
      <>
        <p>
          Diariamente App, que comprende la aplicación, el sitio {dominio}, el contenido y la
          marca, es de titularidad de {nome}, persona jurídica de derecho privado brasileña,
          inscrita en el CNPJ con el nº {EMPRESA.cnpj} (&ldquo;Science Play&rdquo;,
          &ldquo;nosotros&rdquo;).{" "}
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
          Otra empresa del mismo grupo económico de Science Play puede figurar como vendedora o
          desarrolladora en las tiendas de aplicaciones (como App Store y Google Play), en la
          plataforma de pago o en documentos fiscales. Eso no cambia la titularidad de
          Diariamente App ni de los derechos sobre él, que siguen siendo de{" "}
          {EMPRESA.razaoSocial}, ni su responsabilidad ante ti
          {doc === "termos" ? " descrita en estas Condiciones y en la Política de Privacidad" : " como responsable del tratamiento"}, y
          no reduce ninguno de tus derechos.
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        O Diariamente App, que compreende o aplicativo, o site {dominio}, o conteúdo e a marca, é
        de titularidade da {nome}, pessoa jurídica de direito privado inscrita no CNPJ sob o
        nº {EMPRESA.cnpj} (&ldquo;Science Play&rdquo;, &ldquo;nós&rdquo;).{" "}
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
        Outra empresa do mesmo grupo econômico da Science Play pode aparecer como vendedora ou
        desenvolvedora nas lojas de aplicativos (como App Store e Google Play), na plataforma
        de pagamento ou em documento fiscal. Isso não altera a titularidade do Diariamente App
        nem dos direitos sobre ele, que continuam com a {EMPRESA.razaoSocial}, nem a
        responsabilidade dela perante você
        {doc === "termos" ? " descrita nestes Termos e na Política de Privacidade" : " como controladora"}, e
        não reduz nenhum direito seu.
      </p>
    </>
  );
}
