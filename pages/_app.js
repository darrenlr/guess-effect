import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Guess Effect</title>
        <link rel="canonical" href="https://guesseffect.wtf" />
        <meta name="description" content="Think you know video games? Guess the title from its release date and limited hints. Trade points for clues, earn bonuses for smart guesses, and don't run out of lives!" />
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
