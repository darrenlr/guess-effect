import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <title>Guess Effect (Beta)</title>
      <Head>
        <link rel="canonical" href="https://guesseffect.wtf" />
      </Head>
      <Component {...pageProps} />
      <SpeedInsights />
      <Analytics />
      <Script strategy="afterInteractive">
        {`
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config','ou7tq');
        `}
      />
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
