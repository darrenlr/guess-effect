import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="daily video game guessing game, video game guesser, guess the game, gaming challenge, endless video game guesser" />

        <meta property="og:site_name" content="Guess Effect" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://guesseffect.wtf/images/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://guesseffect.wtf/images/logo.png" />
        <meta name="twitter:site" content="@guesseffectwtf" />
      </Head>

      {/* Google Analytics Script Loader */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-RRKN0TJDML"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-RRKN0TJDML');
        `}
      </Script>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
      <Script id="twitter-pixel" strategy="afterInteractive">
        {`
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config','ou7tq');
        `}
      </Script>
      {/* <AdSense adSlot="7606066193" /> */}
      <Script
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        async
      />
    </>
  )
}

export default MyApp