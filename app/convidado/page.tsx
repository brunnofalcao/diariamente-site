import type { Metadata } from "next";
import { ATENDIMENTO } from "@/config/atendimento";
import { RodapeDoGrupo } from "@/components/CnpjsDoGrupo";
import { OfficialLogo } from "@/components/Brand";
import { ConvidadoForm } from "@/components/ConvidadoForm";
import { normalizarCupom } from "@/lib/convidado.mjs";
import "../estudante/estudante.css";

/* =====================================================================
   /convidado · cadastro gratuito com cupom (evento NB Goiânia, 07/11/2026)
   ---------------------------------------------------------------------
   Pedido do dono: o cadastro do convidado no site normal, com os dados
   obrigatórios e o CUPOM obrigatório; o campo só aceita cupom que existe
   no app (tabela convites). A conta nasce no app (POST
   app.diariamente.club/api/convite/:cupom/cadastro), com a confirmação e
   os botões para baixar o app no WhatsApp. ?cupom= preenche o campo.
   Noindex: é a porta de um evento, não página de busca.
   ===================================================================== */

export const metadata: Metadata = {
  title: "Convidado · Diariamente",
  description: "Crie sua conta de convidado do Diariamente com o cupom do convite.",
  robots: { index: false, follow: false },
};

export default async function Convidado({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const busca = await searchParams;
  const bruto = Array.isArray(busca.cupom) ? busca.cupom[0] : busca.cupom;
  const cupomInicial = normalizarCupom(bruto || "");

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
        <div className="ed-wrap" style={{ maxWidth: 560 }}>
          <span className="ed-overline">Convite</span>
          <h1 className="ed-h1" style={{ fontSize: "clamp(30px, 5vw, 44px)" }}>
            Seu acesso de convidado ao Diariamente.
          </h1>
          <p className="ed-lead" style={{ marginBottom: 28 }}>
            Uma provocação por dia para você agir. Cadastre-se com o cupom do convite, receba a confirmação no WhatsApp e baixe o app.
          </p>
          <ConvidadoForm cupomInicial={cupomInicial} />
          <p className="ed-legal" style={{ marginTop: 20, textAlign: "center" }}>
            Dúvidas? Escreva para <a href={`mailto:${ATENDIMENTO.email}`}>{ATENDIMENTO.email}</a>.
          </p>
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
            <a href={`mailto:${ATENDIMENTO.email}`}>Suporte</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
