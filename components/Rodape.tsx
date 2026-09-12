import { EMPRESA, LOJAS, SITE } from "@/config";
import { LockupVertical } from "@/components/Brand";

/* =====================================================================
   RODAPÉ
   ---------------------------------------------------------------------
   Cara de produto, não de landing page. Três decisões:

   1. A ASSINATURA vem primeiro e sozinha. "Volte amanhã." é nível 1 da
      hierarquia (seção 10): nada compete com ela, e ela nunca é botão.
      Por isso ela fica acima de tudo, com respiro, e os links vêm depois.

   2. Dois e-mails com papéis distintos. Suporte para quem já assina;
      contato para imprensa e parcerias. Um canal só faz o assinante com
      problema esperar atrás de um pitch de parceria.

   3. A SEQUÊNCIA fecha a página. Sete cápsulas em gradação, o vão
      preservado, hoje alongada (seção 24). É a marca reconhecível sem o
      logotipo, e é o último elemento que a pessoa vê.

   Sem newsletter, sem selo de pagamento, sem mapa do site inflado. O
   rodapé de produto é curto.
   ===================================================================== */

const LINKS = [
  { href: "/sobre", texto: "Informações gerais" },
  { href: "/termos", texto: "Termos de uso" },
  { href: "/privacidade", texto: "Privacidade" },
];

function IcInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.6 6.4h.01" />
    </svg>
  );
}

export function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="rp">
      <div className="wrap">
        {/* marca + assinatura, sozinhas no topo */}
        <div className="rp-marca">
          <LockupVertical altura={52} />
          <p className="assinatura rp-assinatura">Volte amanhã.</p>
        </div>

        <hr className="rp-linha" />

        <div className="rp-grid">
          {/* navegação */}
          <nav className="rp-col" aria-label="Institucional">
            <span className="rp-t">Institucional</span>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.texto}
              </a>
            ))}
          </nav>

          {/* contato: dois canais, papéis distintos */}
          <div className="rp-col">
            <span className="rp-t">Falar com a gente</span>
            <a href={`mailto:${EMPRESA.suporteEmail}`}>
              Suporte <span className="rp-hint">para quem já assina</span>
            </a>
            <a href={`mailto:${EMPRESA.contatoEmail}`}>
              Contato <span className="rp-hint">imprensa e parcerias</span>
            </a>
          </div>

          {/* app */}
          <div className="rp-col">
            <span className="rp-t">Baixar o app</span>
            <a href={LOJAS.appStore} target="_blank" rel="noopener noreferrer">App Store</a>
            <a href={LOJAS.googlePlay} target="_blank" rel="noopener noreferrer">Google Play</a>
          </div>

          {/* social · A MARCA, não a realizadora.
              As redes da Science Play saíram do rodapé: elas são da empresa
              que realiza, não do produto. Misturar as duas dilui a entidade
              que buscadores e mecanismos generativos precisam reconhecer. */}
          <div className="rp-col">
            <span className="rp-t">Acompanhar</span>
            <a
              href={`https://instagram.com/${SITE.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rp-ig"
            >
              <IcInstagram />
              @{SITE.instagram}
            </a>
          </div>
        </div>

        <hr className="rp-linha" />

        <div className="rp-base">
          <p>
            © {ano} {EMPRESA.marca}® · {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj}
            <br />
            {SITE.dominio.replace("https://", "")}
          </p>
          <p className="rp-aviso">
            O Diariamente é uma prática de hábitos e bem-estar. Não trata, não
            diagnostica e não substitui acompanhamento profissional.
          </p>
        </div>

        {/* A SEQUÊNCIA fecha a página: o vão fica, hoje é a cápsula alongada. */}
        <div className="rp-seq" aria-hidden="true">
          <span className="seq grad">
            <i /><i /><i /><i /><i /><i /><i className="is-hoje" />
          </span>
        </div>
      </div>
    </footer>
  );
}
