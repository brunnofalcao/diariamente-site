import { EMPRESA, SITE } from "@/config";
import { LegalShell } from "@/components/LegalShell";
import { metadataDaPagina } from "@/lib/seo";

/* =====================================================================
   /es/privacidad
   ---------------------------------------------------------------------
   TRADUÇÃO, NÃO ADAPTAÇÃO JURÍDICA. Ver a nota em condicionesdeuso.

   Ponto específico e importante desta página: o tratamento de dados
   segue a LGPD brasileira, porque o responsável pelo tratamento é uma
   empresa brasileira. Um residente na União Europeia tem direitos pelo
   RGPD que esta política NÃO descreve (portabilidade em formato
   estruturado, oposição ao tratamento, autoridade de control local,
   representante na UE quando aplicável).

   Enquanto o público espanhol for residual, isto é aceitável e honesto.
   No momento em que houver campanha paga mirando a Espanha, a política
   precisa de um capítulo RGPD escrito por advogado.
   ===================================================================== */

export const metadata = metadataDaPagina("privacidade", "es");

export default function Privacidad() {
  return (
    <LegalShell lang="es" titulo="Política de Privacidad" atualizado={EMPRESA.vigenciaLegal}>
      <p>
        Esta Política explica cómo {EMPRESA.razaoSocial}, inscrita en el CNPJ nº{" "}
        {EMPRESA.cnpj} (&ldquo;Science Play&rdquo;, &ldquo;nosotros&rdquo;), recoge, utiliza y
        protege datos personales en Diariamente, en conformidad con la Ley brasileña nº
        13.709/2018 (Ley General de Protección de Datos, LGPD).
      </p>
      <p>
        <strong>Responsable del tratamiento:</strong> {EMPRESA.razaoSocial}. Al tratarse de una
        empresa establecida en Brasil, el tratamiento se rige por la legislación brasileña. Si
        resides en la Unión Europea y deseas ejercer derechos previstos en el RGPD, escríbenos
        a <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a> y atenderemos
        tu solicitud.
      </p>

      <h2>1. Qué datos recogemos</h2>
      <p>
        <strong>Datos que nos entregas:</strong> nombre, correo electrónico y número de
        teléfono, cuando compras o solicitas contacto.
      </p>
      <p>
        <strong>Datos de pago:</strong> procesados directamente por la plataforma de checkout.
        No almacenamos datos de tarjeta.
      </p>
      <p>
        <strong>Datos de uso:</strong> páginas visitadas, origen del acceso e interacciones,
        recogidos mediante cookies y herramientas de medición.
      </p>

      <h2>2. Para qué utilizamos</h2>
      <p>
        Para procesar el pedido, liberar y mantener tu acceso, prestar soporte, enviar
        comunicaciones sobre el producto, cumplir obligaciones legales y mejorar el servicio.
      </p>

      <h2>3. Base legal</h2>
      <p>
        Tratamos datos con fundamento en la ejecución del contrato, en el cumplimiento de
        obligaciones legales, en el interés legítimo y, cuando corresponde, en tu
        consentimiento, conforme al artículo 7º de la LGPD.
      </p>

      <h2>4. Con quién compartimos</h2>
      <p>
        Solo con proveedores necesarios para la operación: plataforma de pago, envío de
        correo electrónico y mensajería, alojamiento y herramientas de medición. Todos
        tratan los datos por nuestra cuenta y bajo instrucciones.
      </p>
      <p>
        <strong>No vendemos datos personales.</strong>
      </p>

      <h2>5. Transferencia internacional</h2>
      <p>
        Algunos proveedores operan fuera de Brasil. En esos casos se aplican las salvaguardas
        previstas en la LGPD.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes solicitar confirmación de tratamiento, acceso, corrección, anonimización,
        portabilidad, eliminación y revocación del consentimiento. Para ejercerlos, escribe a{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>. Responderemos en
        el menor plazo posible.
      </p>

      <h2>7. Conservación</h2>
      <p>
        Conservamos los datos durante el tiempo necesario para las finalidades descritas y
        para el cumplimiento de obligaciones legales. Después, son eliminados o anonimizados.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Utilizamos cookies esenciales para el funcionamiento del sitio y cookies de medición
        para entender el uso. Puedes gestionarlas en la configuración de tu navegador; la
        desactivación de las esenciales puede afectar al funcionamiento.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Adoptamos medidas técnicas y organizativas para proteger los datos. En caso de
        incidente de seguridad relevante, actuaremos conforme a la LGPD.
      </p>

      <h2>10. Cambios</h2>
      <p>
        Esta Política puede actualizarse. La versión vigente estará siempre en{" "}
        <a href={`${SITE.dominio}/es/privacidad`}>{SITE.dominio.replace("https://", "")}/es/privacidad</a>,
        con la fecha de la última actualización.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Dudas sobre privacidad:{" "}
        <a href={`mailto:${EMPRESA.suporteEmail}`}>{EMPRESA.suporteEmail}</a>.
      </p>
    </LegalShell>
  );
}
