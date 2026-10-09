import Script from "next/script";
import { TRACKING } from "@/config";

/**
 * Tracking: GA4 (uma ou mais propriedades) + Meta Pixel.
 *
 * SÓ É MONTADO PELO components/Consentimento.tsx, DEPOIS DO "ACEITAR" no
 * aviso de cookies. Não coloque este componente direto no layout nem numa
 * página: sem o aceite, nenhum desses scripts pode carregar (é o que a
 * Política de Privacidade, seção 8, promete). Como ele só existe no
 * navegador depois do aceite, nada daqui vai no HTML do servidor.
 *
 * Carrega os scripts só quando TRACKING.ativo === true e o ID existe.
 * Aqui ficam apenas a base e o PageView; os eventos de conversão saem de
 * lib/medicao.ts e do PurchaseTracking, também só com aceite.
 *
 * Sem <noscript> do Pixel: sem JavaScript não há como aceitar o aviso, e
 * a imagem de rastreio carregaria sem consentimento.
 */
export function Tracking() {
  if (!TRACKING.ativo) return null;

  const gas = (TRACKING.ga4Ids ?? []).filter(Boolean);
  const pixel = TRACKING.metaPixelId;

  return (
    <>
      {/* ---------- Google Analytics 4 (gtag) ----------
           Duas propriedades medindo em paralelo. A biblioteca gtag.js é
           carregada UMA vez, com o primeiro ID, e cada propriedade recebe
           o seu próprio gtag('config'). Carregar o script duas vezes
           duplicaria o PageView em ambas. */}
      {gas.length > 0 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gas[0]}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${gas.map((id) => `gtag('config', '${id}');`).join("\n              ")}
            `}
          </Script>
        </>
      )}

      {/* ---------- Meta Pixel (fbq) ---------- */}
      {pixel && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixel}');
              fbq('track', 'PageView');
            `}
          </Script>
        </>
      )}
    </>
  );
}
