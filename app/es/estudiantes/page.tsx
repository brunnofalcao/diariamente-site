import { EMPRESA, GARANTIA } from "@/config";
import { LockupHorizontal } from "@/components/Brand";
import { metadataDaPagina } from "@/lib/seo";
import { caminho } from "@/lib/rotas";

/* =====================================================================
   /es/estudiantes
   ---------------------------------------------------------------------
   POR QUE ESTA PÁGINA NÃO TEM O FORMULÁRIO

   O fluxo de estudante é Brasil-only POR CONSTRUÇÃO, não por descuido:

     app/api/estudante/solicitar/route.js
       cpfValido()  -> rejeita com 400 qualquer documento que não seja
                       CPF, com dígito verificador conferido
     components/EstudanteForm.tsx
       UFS          -> dropdown com as 27 unidades federativas do Brasil
       whatsapp     -> "55" + dígitos, DDI fixo no código
     config.HOTMART -> oferta em real

   Traduzir o formulário criaria uma página que PARECE disponível e
   rejeita todo mundo no último passo, depois de a pessoa ter digitado
   nome, telefone e instituição. É pior do que não ter a página.

   Então esta rota existe, é indexável e tem hreflang recíproco com a
   versão portuguesa, mas diz a verdade: a condição está disponível hoje
   para estudantes no Brasil, e quem estuda fora pode escrever para
   registrar interesse.

   PARA ABRIR DE VERDADE seria preciso, no mínimo:
     1. aceitar documento não brasileiro (ou dispensar documento e usar
        e-mail institucional como sinal)
     2. trocar o dropdown de UF por país + instituição livre
     3. DDI variável no WhatsApp
     4. oferta da Hotmart em moeda local
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

          <div className="sobre-corpo">
            <h2 className="t-heading" style={{ marginBottom: "var(--sp4)" }}>
              Qué entra en tu acceso
            </h2>
            <ul className="geo-resumo">
              {BENEFICIOS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p style={{ marginTop: "var(--sp5)" }}>
              Y {GARANTIA.dias} días de garantía: si no es para ti, devolvemos.
            </p>
          </div>

          {/* Honestidade operacional: a condição existe, o fluxo ainda não
              atende fora do Brasil. Dizer isso é melhor do que deixar a
              pessoa descobrir depois de preencher o formulário inteiro. */}
          <div
            style={{
              marginTop: "var(--sp10)",
              padding: "var(--sp6)",
              borderRadius: 16,
              background: "rgba(245,183,49,.07)",
              border: "1px solid rgba(245,183,49,.28)",
            }}
          >
            <h2 className="t-heading" style={{ marginBottom: 10 }}>
              Por ahora, solo para Brasil
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--n-300)", maxWidth: "58ch" }}>
              La validación de la condición para estudiantes utiliza documento y datos de
              instituciones brasileñas, y el cobro se realiza en reales. Todavía no podemos
              emitir el código para estudiantes fuera de Brasil.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--n-300)", marginTop: 12, maxWidth: "58ch" }}>
              Si estudias fuera de Brasil y quieres la condición, escríbenos a{" "}
              <a href={`mailto:${EMPRESA.contatoEmail}`} className="teal">
                {EMPRESA.contatoEmail}
              </a>{" "}
              con tu país e institución. Registramos tu interés y te avisamos en cuanto esté
              disponible.
            </p>
          </div>

          <div className="ed-actions" style={{ justifyContent: "flex-start", marginTop: "var(--sp8)" }}>
            <a href={caminho("home", "es")} className="btn btn-primary">
              Ver el acceso completo
            </a>
          </div>

          <p className="caption" style={{ marginTop: "var(--sp6)", color: "var(--n-500)" }}>
            ¿Estudias en Brasil?{" "}
            <a href={caminho("estudante", "pt")} className="teal" hrefLang="pt-BR">
              Solicita tu código aquí
            </a>
            .
          </p>

          <p className="assinatura" style={{ marginTop: "var(--sp10)" }}>Vuelve mañana.</p>
        </div>
      </section>
    </main>
  );
}
