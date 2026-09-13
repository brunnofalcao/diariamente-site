import { EMPRESA } from "@/config";
import { LockupHorizontal } from "@/components/Brand";
import { metadataDaPagina } from "@/lib/seo";
import { caminho } from "@/lib/rotas";

/* =====================================================================
   /es/acerca-de
   ---------------------------------------------------------------------
   Página factual, equivalente à /sobre. Serve aos três mecanismos ao
   mesmo tempo: busca por palavra-chave, resposta direta e mecanismo
   generativo. Todos leem texto renderizado, e todos preferem o fato
   respondido na primeira frase de cada bloco.

   Não é órfã: está linkada do rodapé e no sitemap com hreflang.
   ===================================================================== */

export const metadata = metadataDaPagina("sobre", "es");

const RESUMO: [string, string][] = [
  ["Producto", "Diariamente App, aplicación de provocaciones diarias"],
  ["Categoría", "Práctica diaria de hábitos y bienestar"],
  ["Modelo", "Suscripción anual, contenido nuevo en cada ciclo"],
  ["Formato", "Aplicación para iPhone y Android"],
  ["Duración", "365 textos por año, uno liberado cada día"],
  ["Responsable", `${EMPRESA.marca}, ${EMPRESA.razaoSocial}`],
];

export default function AcercaDe() {
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
          <span className="overline eyebrow">Información general</span>
          <h1 className="display-sm" style={{ margin: "var(--sp3) 0 var(--sp8)" }}>
            Acerca de Diariamente
          </h1>

          <div className="sobre-corpo">
            <p>
              <strong className="teal">Qué es:</strong> Diariamente es una práctica diaria de
              hábitos y bienestar, realizada por Science Play. Un texto por día que provoca una
              reflexión y termina en una acción posible hoy mismo, con contador de vueltas
              acumuladas, logros y recordatorio diario.
            </p>
            <p>
              <strong className="teal">Para quién es:</strong> cualquier persona que quiera
              rutina y cadencia para cuidar de su propio bienestar, y que ya intentó mantener
              algo y se detuvo. Quien ya descargó, ya pagó y ya abandonó en la segunda semana.
              La segmentación es por comportamiento, nunca por condición de salud: no hace
              falta estar en crisis para querer constancia.
            </p>
            <p>
              <strong className="teal">Cómo funciona:</strong> el ritual tiene tres
              movimientos: provocación (interrumpe el automático), reflexión (invita a pensar
              con honestidad) y acción (una decisión posible hoy mismo). Alrededor de ellos, el
              producto cuenta las vueltas acumuladas, que nunca se reinician. El acceso se
              envía por correo electrónico tras la confirmación.
            </p>
            <p>
              <strong className="teal">Todos leen lo mismo:</strong> el texto del día es el
              mismo para todas las personas, en la misma fecha. Quien vuelve después de una
              semana fuera encuentra exactamente el mismo punto que quien no faltó ningún día.
            </p>
            <p>
              <strong className="teal">Qué no es:</strong> no es terapia, ni tratamiento, ni
              sustituto del acompañamiento profesional. No trata, no diagnostica y no promete
              resultado clínico.
            </p>
            <p>
              <strong className="teal">Acceso:</strong> suscripción anual. En la renovación, un
              ciclo nuevo de contenido inédito. El valor vigente y las condiciones aparecen en
              la página principal.
            </p>

            <ul className="geo-resumo">
              {RESUMO.map(([k, v]) => (
                <li key={k}>
                  <b>{k}:</b> {v}
                </li>
              ))}
            </ul>
          </div>

          <p className="caption" style={{ marginTop: "var(--sp10)", color: "var(--n-500)" }}>
            Dudas sobre el producto:{" "}
            <a href={`mailto:${EMPRESA.suporteEmail}`} className="teal">{EMPRESA.suporteEmail}</a>.{" "}
            Prensa y alianzas:{" "}
            <a href={`mailto:${EMPRESA.contatoEmail}`} className="teal">{EMPRESA.contatoEmail}</a>.
          </p>

          <p className="assinatura" style={{ marginTop: "var(--sp10)" }}>Vuelve mañana.</p>
        </div>
      </section>
    </main>
  );
}
