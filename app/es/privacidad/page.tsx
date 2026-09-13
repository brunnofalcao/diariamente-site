import { EMPRESA, SITE } from "@/config";
import { LegalShell } from "@/components/LegalShell";
import { metadataDaPagina } from "@/lib/seo";
import { caminho } from "@/lib/rotas";

/* =====================================================================
   POLÍTICA DE PRIVACIDAD · ES
   Espelho fiel da versão portuguesa. Ver as decisões comentadas em
   app/privacidade/page.tsx. Qualquer alteração precisa ser feita NAS
   DUAS: políticas divergentes entre idiomas é achado de auditoria.
   ===================================================================== */

export const metadata = metadataDaPagina("privacidade", "es");

export default function Privacidad() {
  return (
    <LegalShell lang="es" titulo="Política de Privacidad" atualizado={EMPRESA.vigenciaLegal}>
      <p>
        Esta Política explica cómo tratamos los datos personales en Diariamente. Se aplica a
        todas las personas usuarias, en Brasil y fuera de él, y fue redactada para atender
        simultáneamente la Ley General de Protección de Datos brasileña (Ley nº 13.709/2018,
        &ldquo;LGPD&rdquo;) y el Reglamento General de Protección de Datos de la Unión
        Europea (Reglamento UE 2016/679, &ldquo;RGPD&rdquo;).
      </p>

      <h2>1. Quién es el responsable del tratamiento</h2>
      <p>
        <strong>{EMPRESA.razaoSocial}</strong>, inscrita en el CNPJ nº {EMPRESA.cnpj}, es la
        responsable del tratamiento. Diariamente es un producto operado por ella.
      </p>
      <p>
        Dirección: {EMPRESA.endereco}
        <br />
        Contacto para asuntos de privacidad:{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>
      </p>
      <p>
        Science Play es <strong>responsable del tratamiento</strong> de los datos, no su
        propietaria. Los datos personales no son propiedad de nadie: conservas tus derechos
        sobre ellos en todo momento, y esta Política existe para describir cómo los tratamos
        y cómo puedes ejercerlos.
      </p>

      <h2>2. Qué datos tratamos</h2>
      <p>
        <strong>Datos que nos facilitas:</strong> nombre, correo electrónico, teléfono y,
        cuando corresponde, país, institución educativa, carrera y curso. En las condiciones
        exclusivas para Brasil, también el CPF, usado únicamente para garantizar un código
        por persona.
      </p>
      <p>
        <strong>Datos de pago:</strong> tratados directamente por la plataforma de checkout.{" "}
        <strong>No recibimos ni almacenamos datos de tarjeta.</strong>
      </p>
      <p>
        <strong>Datos de uso:</strong> páginas visitadas, origen del acceso, dispositivo e
        interacciones, recogidos mediante cookies y herramientas de medición.
      </p>
      <p>
        <strong>Datos de la aplicación:</strong> registros de lectura, acciones registradas y
        contador de vueltas. Son necesarios para la propia funcionalidad del producto.
      </p>
      <p>
        <strong>No tratamos categorías especiales de datos.</strong> Diariamente no recoge
        información sobre salud, diagnóstico, condición clínica, origen racial o étnico,
        convicciones religiosas, opiniones políticas, afiliación sindical, datos genéticos o
        biométricos, ni vida u orientación sexual. El contenido es reflexivo y no clínico, y
        el producto no pregunta nada de eso.
      </p>

      <h2>3. Con qué base jurídica y para qué</h2>
      <table className="legal-tabela">
        <thead>
          <tr>
            <th>Finalidad</th>
            <th>Base jurídica</th>
            <th>¿Puedes negarte?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Procesar la compra, dar y mantener el acceso, prestar soporte</td>
            <td>Ejecución del contrato<br /><small>RGPD 6(1)(b) · LGPD 7º, V</small></td>
            <td>No, sin eso no podemos entregar el producto</td>
          </tr>
          <tr>
            <td>Emitir y validar el código de condición especial</td>
            <td>Ejecución del contrato y medidas precontractuales<br /><small>RGPD 6(1)(b)</small></td>
            <td>No solicitar el código</td>
          </tr>
          <tr>
            <td>Cumplir obligaciones fiscales, contables y legales</td>
            <td>Obligación legal<br /><small>RGPD 6(1)(c) · LGPD 7º, II</small></td>
            <td>No</td>
          </tr>
          <tr>
            <td>Seguridad, prevención del fraude y del abuso</td>
            <td>Interés legítimo<br /><small>RGPD 6(1)(f) · LGPD 7º, IX</small></td>
            <td>Sí, mediante oposición motivada</td>
          </tr>
          <tr>
            <td>Comunicaciones sobre el propio Diariamente</td>
            <td>Consentimiento<br /><small>RGPD 6(1)(a) · LGPD 7º, I</small></td>
            <td><strong>Sí, en cualquier momento</strong></td>
          </tr>
          <tr>
            <td>Compartir con el grupo, socios y patrocinadores para sus comunicaciones</td>
            <td>Consentimiento específico<br /><small>RGPD 6(1)(a) · LGPD 7º, I</small></td>
            <td><strong>Sí, en cualquier momento</strong></td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Negarte a las dos últimas no afecta tu acceso al producto.</strong> Se
        ofrecen en casillas separadas y sin marcar, y aceptar una no implica aceptar la otra.
      </p>

      <h2>4. Con quién compartimos</h2>
      <p>
        <strong>4.1. Encargados necesarios para la prestación.</strong> Tratan datos por
        nuestra cuenta y bajo nuestras instrucciones, sin uso propio: plataforma de pago,
        envío de correo y mensajería, alojamiento e infraestructura, y herramientas de
        medición.
      </p>
      <p>
        <strong>4.2. Empresas del grupo y socios comerciales.</strong> Science Play opera con
        marcas, eventos y socios propios, y mantiene relaciones con patrocinadores. Compartir
        tus datos con esas empresas, <strong>para que te envíen sus propias
        comunicaciones</strong>, ocurre <strong>exclusivamente con tu consentimiento
        específico</strong>, manifestado en una casilla propia y sin marcar en el momento del
        registro.
      </p>
      <p>Las categorías de destinatarios son:</p>
      <ul>
        <li>empresas controladas, controladoras o bajo control común de {EMPRESA.razaoSocial};</li>
        <li>socios comerciales en acciones conjuntas de educación, contenido y eventos;</li>
        <li>patrocinadores de acciones, eventos y contenidos de Diariamente o de Science Play.</li>
      </ul>
      <p>
        Al recibir tus datos, esas empresas pasan a ser responsables del tratamiento que
        realicen y deberán informarlo en sus propias políticas. Puedes revocar esta
        autorización en cualquier momento escribiendo a{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>, sin ningún
        perjuicio para tu acceso al producto. La revocación no afecta la licitud del
        tratamiento realizado antes de ella.
      </p>
      <p>
        <strong>4.3. Autoridades.</strong> Cuando exista obligación legal, orden judicial o
        requerimiento de autoridad competente.
      </p>
      <p>
        <strong>No vendemos datos personales.</strong> En ningún caso, con o sin
        consentimiento.
      </p>

      <h2>5. Transferencias internacionales</h2>
      <p>
        Operamos desde Brasil y utilizamos proveedores situados en otros países, incluidos
        Estados Unidos y la Unión Europea. En esas transferencias aplicamos las garantías del
        art. 33 de la LGPD y, cuando hay datos de personas en la Unión Europea, los
        mecanismos del Capítulo V del RGPD, por regla general las Cláusulas Contractuales
        Tipo aprobadas por la Comisión Europea.
      </p>
      <p>
        <strong>Si estás en la Unión Europea:</strong> Brasil no cuenta, a esta fecha, con
        decisión de adecuación de la Comisión Europea. La transferencia de tus datos a Brasil
        se fundamenta en las Cláusulas Contractuales Tipo, disponibles a solicitud en nuestro
        contacto de privacidad.
      </p>

      <h2>6. Cuánto tiempo los conservamos</h2>
      <table className="legal-tabela">
        <thead>
          <tr><th>Dato</th><th>Plazo</th><th>Por qué</th></tr>
        </thead>
        <tbody>
          <tr><td>Registro y acceso</td><td>Durante la relación y 5 años después</td><td>Plazos de prescripción aplicables</td></tr>
          <tr><td>Registros fiscales de la compra</td><td>5 años</td><td>Obligación legal</td></tr>
          <tr><td>Registros de acceso a la aplicación</td><td>6 meses</td><td>Marco Civil de Internet, art. 15</td></tr>
          <tr><td>Consentimientos y revocaciones</td><td>Mientras sea necesario para su acreditación</td><td>Carga de la prueba del responsable</td></tr>
          <tr><td>Datos de marketing</td><td>Hasta la revocación, más el plazo de ejecución de la baja</td><td>—</td></tr>
        </tbody>
      </table>
      <p>Cumplidos los plazos, los datos se eliminan o se anonimizan de forma irreversible.</p>

      <h2>7. Tus derechos</h2>
      <p>
        <strong>En la LGPD (art. 18):</strong> confirmación de la existencia de tratamiento,
        acceso, corrección, anonimización, bloqueo o eliminación de datos innecesarios o
        tratados en disconformidad, portabilidad, información sobre el uso compartido,
        información sobre la posibilidad de no consentir, revocación del consentimiento y
        revisión de decisiones automatizadas.
      </p>
      <p>
        <strong>En el RGPD (arts. 15 a 22), si estás en la Unión Europea:</strong> acceso,
        rectificación, supresión (&ldquo;derecho al olvido&rdquo;), limitación del
        tratamiento, <strong>portabilidad en formato estructurado y de uso común</strong>,{" "}
        <strong>oposición al tratamiento</strong>, incluida la elaboración de perfiles, y el
        derecho a no ser objeto de decisiones basadas únicamente en el tratamiento
        automatizado con efectos significativos.
      </p>
      <p>
        Para ejercer cualquiera de ellos, escribe a{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>. Respondemos en
        un plazo de <strong>15 días</strong> (LGPD) o <strong>un mes</strong> (RGPD),
        prorrogable dos meses más en casos complejos, avisándote antes. El ejercicio es
        gratuito.
      </p>
      <p>
        <strong>Reclamación.</strong> Puedes reclamar ante la Autoridad Nacional de
        Protección de Datos (ANPD) en Brasil o ante la autoridad de control de tu Estado
        miembro en la Unión Europea. En España, la Agencia Española de Protección de Datos
        (AEPD).
      </p>

      <h2>8. Cookies y medición</h2>
      <p>
        Usamos cookies estrictamente necesarias para el funcionamiento del sitio y cookies de
        medición y publicidad. Las de medición y publicidad{" "}
        <strong>solo se activan con tu consentimiento</strong>, manifestado en el aviso
        mostrado en el primer acceso, y puedes revisarlo en cualquier momento. Las
        estrictamente necesarias no dependen de consentimiento.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Adoptamos medidas técnicas y organizativas adecuadas al riesgo, incluyendo control de
        acceso, cifrado en tránsito y segregación de entornos. En caso de incidente de
        seguridad con riesgo relevante, lo comunicaremos a la autoridad competente y a las
        personas afectadas en los plazos y formas de la LGPD (art. 48) y del RGPD (arts. 33
        y 34).
      </p>

      <h2>10. Menores de edad</h2>
      <p>
        Diariamente no está dirigido a menores de 18 años y no recogemos datos de menores de
        forma consciente. Identificado un registro en esa condición, los datos se eliminan.
      </p>

      <h2>11. Cambios</h2>
      <p>
        Esta Política puede actualizarse. La versión vigente está siempre en{" "}
        <a href={`${SITE.dominio}${caminho("privacidade", "es")}`}>
          {SITE.dominio.replace("https://", "")}{caminho("privacidade", "es")}
        </a>
        , con la fecha de la última actualización. Los cambios relevantes en las finalidades o
        en los destinatarios se comunicarán y, cuando la base jurídica sea el consentimiento,
        se solicitará uno nuevo.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Privacidad y ejercicio de derechos:{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
      </p>
    </LegalShell>
  );
}
