import Script from "next/script";
import { TRACKING } from "@/config";

/**
 * Tracking — GA4 + Meta Pixel.
 * Carrega os scripts só quando TRACKING.ativo === true e o ID existe.
 * Os eventos de conversão (InitiateCheckout) são disparados no clique do
 * botão de checkout (ver components/Oferta.tsx), tanto pro dataLayer (GA4)
 * quanto pro fbq (Meta). Aqui ficam apenas a base e o PageView.
 */
export function Tracking() {
  if (!TRACKING.ativo) return null;

  const ga = TRACKING.ga4Id;
  const pixel = TRACKING.metaPixelId;

  return (
    <>
      {/* ---------- Google Analytics 4 (gtag) ---------- */}
      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga}');
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
