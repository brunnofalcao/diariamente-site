import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EMPRESA } from "@/config";
import { SITE_LANCADO } from "@/config/lancamento";
import { RodapeDoGrupo } from "@/components/CnpjsDoGrupo";
import { OfficialLogo } from "@/components/Brand";
import "../estudante.css";

/* =====================================================================
   /estudante/inscricao?situacao=... · o link pessoal que não abre o
   checkout agora
   ---------------------------------------------------------------------
   Só o /estudante/ativar manda para cá (app/estudante/ativar/route.ts),
   com um token CONHECIDO (aprovado, não revogado). Dois casos:

     concluida  o link já foi usado: o webhook marcou a venda aprovada da
                oferta de estudante. Um segundo checkout faria a pessoa
                assinar duas vezes.
     aguarde    a fase vigente está sem o código da oferta de estudante
                (config/pricing.ts): a pessoa foi aprovada e o link
                continua valendo. A lista de espera da /estudante, aqui,
                contradiria a mensagem aprovada ("Sua inscrição como
                estudante ... foi aprovada").

   Outra situação (ou nenhuma) volta para a /estudante, e em standby
   também (o fluxo do link pessoal só existe com a chave ligada). Sem
   preço e sem prazo: nada aqui promete o que o sistema não cumpre.
   Noindex.
   ===================================================================== */

export const metadata: Metadata = {
  title: "Inscrição de estudante · Diariamente",
  description: "A situação do seu link pessoal de estudante no Diariamente.",
  robots: { index: false, follow: false },
};

type Situacao = "concluida" | "aguarde";

const TEXTOS: Record<Situacao, { selo: string; titulo: string; texto: string; botao: { rotulo: string; href: string } | null }> = {
  concluida: {
    selo: "Inscrição concluída",
    titulo: "Sua inscrição de estudante já foi concluída.",
    texto:
      "Recebemos o pagamento feito com este link. Para entrar, abra o Diariamente App com o e-mail usado no pagamento.",
    botao: { rotulo: "Baixar o app", href: "/baixar" },
  },
  aguarde: {
    selo: "Inscrição aprovada",
    titulo: "Seu link de estudante continua valendo.",
    texto:
      "Sua inscrição de estudante está aprovada. O pagamento da condição de estudante está fechado neste momento e abre em breve. Quando abrir, é só tocar de novo em Concluir inscrição, na mesma mensagem.",
    botao: null,
  },
};

function IcOk() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default async function Inscricao({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const busca = await searchParams;
  const bruto = Array.isArray(busca.situacao) ? busca.situacao[0] : busca.situacao;
  if (!SITE_LANCADO || (bruto !== "concluida" && bruto !== "aguarde")) redirect("/estudante");
  const t = TEXTOS[bruto];

  return (
    <main className="ed">
      <div className="ed-glow" aria-hidden="true" />

      <header className="ed-topbar">
        <div className="ed-wrap ed-topbar-row">
          <a href="/" className="ed-topbar-logo" aria-label="Voltar para a página inicial do Diariamente">
            <OfficialLogo height={26} />
          </a>
        </div>
      </header>

      <section className="ed-hero">
        <div className="ed-wrap">
          <div className="ed-ok">
            <div className="ed-ok-ic">
              <IcOk />
            </div>
            <span className="ed-overline">{t.selo}</span>
            <h1 className="ed-h1" style={{ fontSize: "clamp(30px, 5vw, 46px)" }}>
              {t.titulo}
            </h1>
            <p className="ed-lead" style={{ margin: "0 auto" }}>
              {t.texto}
            </p>
            {t.botao && (
              <div className="ed-actions" style={{ justifyContent: "center", marginTop: 28 }}>
                <a href={t.botao.href} className="ed-btn ed-btn-primary">
                  {t.botao.rotulo}
                </a>
              </div>
            )}
            <p className="ed-legal" style={{ marginTop: 20 }}>
              Dúvidas? Escreva para <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
            </p>
          </div>
        </div>
      </section>

      <footer className="ed-footer">
        <div className="ed-wrap ed-footer-row">
          <p>
            © {new Date().getFullYear()} <RodapeDoGrupo lang="pt" />
          </p>
          <nav aria-label="Links institucionais">
            <a href="/">Página inicial</a>
            <a href="/termos">Termos</a>
            <a href="/privacidade">Privacidade</a>
            <a href={`mailto:${EMPRESA.suporteEmail}`}>Suporte</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
