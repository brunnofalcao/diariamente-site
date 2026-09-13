import { EMPRESA, GARANTIA } from "@/config";
import { LockupHorizontal } from "@/components/Brand";
import { metadataDaPagina } from "@/lib/seo";
import { caminho } from "@/lib/rotas";
import { FormularioGlobal } from "@/components/FormularioGlobal";

/* =====================================================================
   /es/estudiantes · modelo GLOBAL (Espanha + LATAM)
   ---------------------------------------------------------------------
   Não é tradução do formulário brasileiro. É outro modelo, porque o
   brasileiro não funciona fora do Brasil:

     cpfValido()  rejeita com 400 qualquer documento que não seja CPF
     UFS          27 unidades federativas brasileiras
     whatsapp     DDI "55" fixo no código
     Hotmart      oferta em real

   O modelo global troca CPF por país + instituição, aceita telefone com
   DDI livre e NÃO emite cupom: registra interesse. Emitir cupom exige
   oferta em moeda local, que ainda não existe.

   O consentimento é desagregado em duas caixas separadas e desmarcadas,
   conforme lib/consentimento.ts. Prometer a condição e depois usar o
   dado para marketing sem base é o tipo de coisa que a AEPD multa.
   ===================================================================== */

export const metadata = metadataDaPagina("estudante", "es");

const BENEFICIOS = [
  "Los 365 textos, uno liberado cada día",
  "Menú Acciones: la reflexión del día se vuelve tarea concreta",
  "Contador de vueltas: cada vuelta cuenta, y ninguna se reinicia",
  "Recordatorio diario a la hora que elijas",
  "App en iPhone y Android, con el mismo acceso",
];

export default function Estudiantes() {
  return (
    <main className="sobre">
      <header className="sobre-top">
        <div className="wrap-content">
          <a href={caminho("home", "es")} aria-label="Volver a la página principal">
            <LockupHorizontal altura={24} />
          </a>
        </div>
      </header>

      <section style={{ paddingTop: "var(--sp12)" }}>
        <div className="wrap-content">
          <span className="overline eyebrow">Condición para estudiantes</span>
          <h1 className="display-sm" style={{ margin: "var(--sp3) 0 var(--sp5)" }}>
            El mismo acceso de toda la clase, al precio de quien todavía estudia.
          </h1>
          <p className="lead" style={{ maxWidth: "52ch", marginBottom: "var(--sp8)" }}>
            Nada se recorta de tu versión. Es la aplicación completa, con los 365 textos, el
            contador de vueltas, el menú Acciones y el recordatorio diario. Lo que cambia es
            cuánto pagas por ella mientras estás cursando.
          </p>

          <div className="sobre-corpo" style={{ marginBottom: "var(--sp10)" }}>
            <h2 className="t-heading" style={{ marginBottom: "var(--sp4)" }}>
              Qué entra en tu acceso
            </h2>
            <ul className="geo-resumo">
              {BENEFICIOS.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <p style={{ marginTop: "var(--sp5)" }}>
              Y {GARANTIA.dias} días de garantía: si no es para ti, devolvemos.
            </p>
          </div>

          <FormularioGlobal lang="es" />

          <p className="caption" style={{ marginTop: "var(--sp8)", color: "var(--n-500)" }}>
            ¿Estudias en Brasil?{" "}
            <a href={caminho("estudante", "pt")} className="teal" hrefLang="pt-BR">
              Solicita tu código aquí
            </a>
            , el proceso es inmediato.
          </p>

          <p className="caption" style={{ marginTop: "var(--sp4)", color: "var(--n-500)" }}>
            Responsable del tratamiento: {EMPRESA.razaoSocial}. Consulta la{" "}
            <a href={caminho("privacidade", "es")} className="teal">Política de Privacidad</a>.
          </p>

          <p className="assinatura" style={{ marginTop: "var(--sp10)" }}>Vuelve mañana.</p>
        </div>
      </section>
    </main>
  );
}
