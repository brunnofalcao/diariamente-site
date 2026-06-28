import type { Metadata } from "next";
import { EMPRESA } from "@/config";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Política de Privacidade — Diariamente",
  robots: { index: true, follow: true },
};

export default function Privacidade() {
  return (
    <LegalShell titulo="Política de Privacidade" atualizado={EMPRESA.vigenciaLegal}>
      <div className="legal-note">
        <p>
          ⚠️ Modelo-base alinhado à LGPD. Antes de publicar, revise com apoio jurídico e
          preencha os dados da empresa ({EMPRESA.marca}) no config. Ajuste a lista de
          ferramentas conforme o stack real (Hotmart, Meta Pixel, GA4, WhatsApp, Supabase).
        </p>
      </div>

      <p>
        Esta Política descreve como {EMPRESA.marca} coleta, usa e protege os dados pessoais
        de quem adquire e utiliza o Diariamente, em conformidade com a Lei Geral de Proteção
        de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2>1. Dados que coletamos</h2>
      <ul>
        <li><strong>Dados de cadastro:</strong> nome, e-mail e, no combo, endereço para envio do livro.</li>
        <li><strong>Dados de pagamento:</strong> processados pela Hotmart; não armazenamos dados de cartão.</li>
        <li><strong>Dados de uso:</strong> progresso no app, sequência (ofensiva) e interações, para o funcionamento do produto.</li>
        <li><strong>Dados de navegação:</strong> cookies e identificadores para medição e melhoria da página (quando aplicável).</li>
      </ul>

      <h2>2. Como usamos os dados</h2>
      <ul>
        <li>Entregar o acesso ao app e, no combo, enviar o livro físico;</li>
        <li>Enviar lembretes diários (incluindo via WhatsApp, quando autorizado);</li>
        <li>Dar suporte e responder solicitações;</li>
        <li>Medir desempenho da página e das campanhas;</li>
        <li>Cumprir obrigações legais.</li>
      </ul>

      <h2>3. Compartilhamento</h2>
      <p>
        Compartilhamos dados apenas com parceiros necessários à operação — como a plataforma
        de pagamento (Hotmart), provedores de e-mail, mensageria (WhatsApp) e analytics — e
        somente na medida necessária. Não vendemos seus dados.
      </p>

      <h2>4. Cookies e medição</h2>
      <p>
        Podemos usar cookies e tecnologias semelhantes (como Meta Pixel e Google Analytics)
        para entender o uso da página e melhorar a experiência. Você pode gerenciar cookies
        nas configurações do seu navegador.
      </p>

      <h2>5. Seus direitos (LGPD)</h2>
      <p>Você pode, a qualquer momento, solicitar:</p>
      <ul>
        <li>Confirmação e acesso aos seus dados;</li>
        <li>Correção de dados incompletos ou desatualizados;</li>
        <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
        <li>Portabilidade e revogação de consentimento.</li>
      </ul>
      <p>
        Para exercer esses direitos, escreva para{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
      </p>

      <h2>6. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados. O conteúdo e os
        dados do app são mantidos em infraestrutura segura.
      </p>

      <h2>7. Retenção</h2>
      <p>
        Mantemos os dados pelo tempo necessário para as finalidades descritas e para o
        cumprimento de obrigações legais. Após esse período, os dados são eliminados ou
        anonimizados.
      </p>

      <h2>8. Contato do controlador</h2>
      <p>
        {EMPRESA.marca} — {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj}.<br />
        Encarregado/contato: <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
      </p>
    </LegalShell>
  );
}
