import { EMPRESA, SITE, GARANTIA } from "@/config";
import { LegalShell } from "@/components/LegalShell";
import { metadataDaPagina } from "@/lib/seo";

/* =====================================================================
   /es/condicionesdeuso
   ---------------------------------------------------------------------
   TRADUÇÃO, NÃO ADAPTAÇÃO JURÍDICA.

   O texto foi vertido para o espanhol preservando o sentido e a estrutura
   do original. O que NÃO mudou, de propósito:

   - o fornecedor continua sendo uma empresa brasileira (CNPJ)
   - a lei aplicável e o foro continuam sendo os do Brasil
   - o prazo de arrependimento citado é o do CDC brasileiro

   Isso é correto enquanto a venda for feita a partir do Brasil, em real,
   pela mesma oferta. Se um dia houver entidade, moeda ou checkout local
   na Espanha ou na América hispânica, este documento precisa de REVISÃO
   JURÍDICA, não de tradução: direito do consumidor muda por país, e na
   União Europeia o prazo de desistência é de 14 dias, não 7.
   ===================================================================== */

export const metadata = metadataDaPagina("termos", "es");

export default function CondicionesDeUso() {
  return (
    <LegalShell lang="es" titulo="Condiciones de Uso" atualizado={EMPRESA.vigenciaLegal}>
      <p>
        Estas Condiciones de Uso (&ldquo;Condiciones&rdquo;) rigen el acceso y el uso de
        Diariamente, producto digital compuesto por la aplicación y por el contenido de
        provocaciones diarias, ofrecido por {EMPRESA.razaoSocial}, inscrita en el CNPJ
        nº {EMPRESA.cnpj} (&ldquo;Science Play&rdquo;, &ldquo;nosotros&rdquo;). Al adquirir y
        utilizar Diariamente, tú (&ldquo;usuario&rdquo;) declaras haber leído, comprendido y
        aceptado íntegramente estas Condiciones.
      </p>

      <h2>1. Qué es Diariamente</h2>
      <p>
        Diariamente pone a disposición 365 provocaciones, una para cada día, a través de una
        aplicación, con contador de vueltas acumuladas, logros, menú de Acciones y
        recordatorios. El contenido tiene finalidad reflexiva y educativa. Los resultados
        dependen del compromiso individual de cada usuario; no prometemos resultados
        específicos ni garantizados.
      </p>
      <p>
        Diariamente es una práctica diaria de hábitos y bienestar. <strong>No trata, no
        diagnostica y no sustituye el acompañamiento de un profesional de la salud.</strong>
      </p>

      <h2>2. Acceso y licencia de uso</h2>
      <p>
        La compra otorga una licencia de uso personal, intransferible y no exclusiva del
        contenido, durante el período contratado. El acceso se envía por correo electrónico
        tras la confirmación del pago y está vinculado a la persona que realizó la compra.
      </p>
      <p>
        No está permitido compartir credenciales, reproducir, distribuir, revender o exhibir
        públicamente el contenido, ni utilizarlo para entrenar modelos automatizados.
      </p>

      <h2>3. Propiedad intelectual</h2>
      <p>
        Todo el contenido, la marca, la identidad visual y el software son protegidos por la
        legislación de propiedad intelectual y pertenecen a {EMPRESA.razaoSocial}. La
        adquisición no transfiere ningún derecho de titularidad.
      </p>

      <h2>4. Pago</h2>
      <p>
        La venta se procesa a través de la plataforma de pago indicada en el momento de la
        compra, que actúa como intermediaria. Las condiciones comerciales vigentes son las
        presentadas en la página de compra en el momento de la contratación.
      </p>
      <p>
        <strong>Moneda:</strong> salvo indicación en contrario en el checkout, la operación se
        realiza en reales brasileños (BRL). Tu banco puede aplicar conversión y tarifas de
        transacción internacional.
      </p>

      <h2>5. Garantía y desistimiento</h2>
      <p>
        Ofrecemos garantía de {GARANTIA.dias} días contados desde la confirmación de la
        compra. Dentro de ese plazo puedes solicitar la devolución íntegra del valor pagado,
        escribiendo a{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>, sin necesidad
        de justificación.
      </p>
      <p>
        Este plazo corresponde al derecho de arrepentimiento previsto en el artículo 49 del
        Código de Defensa del Consumidor brasileño, aplicable por tratarse de una venta
        realizada desde Brasil. Si la legislación de tu país de residencia previera un plazo
        más favorable, prevalecerá el plazo más favorable al consumidor.
      </p>

      <h2>6. Conducta del usuario</h2>
      <p>
        El usuario se compromete a utilizar Diariamente de forma lícita, sin intentar acceder
        a áreas restringidas, sin realizar ingeniería inversa y sin perjudicar el
        funcionamiento del servicio o la experiencia de otros usuarios.
      </p>

      <h2>7. Disponibilidad</h2>
      <p>
        Trabajamos para mantener el servicio disponible de forma continua, pero pueden ocurrir
        interrupciones por mantenimiento, actualizaciones o factores ajenos a nuestro control.
        Interrupciones puntuales no configuran incumplimiento contractual.
      </p>

      <h2>8. Cambios en estas Condiciones</h2>
      <p>
        Podemos actualizar estas Condiciones para reflejar cambios legales o en el producto.
        La versión vigente estará siempre disponible en{" "}
        <a href={`${SITE.dominio}/es/condicionesdeuso`}>{SITE.dominio.replace("https://", "")}/es/condicionesdeuso</a>,
        con la fecha de la última actualización.
      </p>

      <h2>9. Ley aplicable y foro</h2>
      <p>
        Estas Condiciones se rigen por la legislación brasileña. Queda elegido el foro del
        domicilio del consumidor para dirimir controversias, conforme a la legislación
        aplicable.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Dudas sobre estas Condiciones:{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
      </p>
    </LegalShell>
  );
}
