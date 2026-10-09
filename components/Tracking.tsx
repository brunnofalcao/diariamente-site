import Script from "next/script";
import { TRACKING } from "@/config";

/**
 * Tracking — GA4 (uma ou mais propriedades) + Meta Pixel.
 * Carrega os scripts só quando TRACKING.ativo === true e o ID existe.
 * Os eventos de conversão (InitiateCheckout) são disparados no clique do
 * botão de checkout (ver components/Oferta.tsx), tanto pro dataLayer (GA4)
 * quanto pro fbq (Meta). Aqui ficam apenas a base e o PageView.
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
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
