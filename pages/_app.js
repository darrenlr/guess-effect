import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Guess Effect - Daily Video Game Guessing Game</title>
        <link rel="canonical" href="https://guesseffect.wtf" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Play Guess Effect, the daily video game guessing game! Guess the title from its release date and hints, trade points for clues, and see if you can beat the challenge every day."
        />
        <meta name="keywords" content="daily video game guessing game, video game trivia, guess the game, gaming challenge, daily gaming challenge" />
        <meta property="og:title" content="Daily Video Game Guessing Game – Guess Effect" />
        <meta property="og:description" content="Play Guess Effect, the daily video game guessing game where you guess the title from its release date and clues." />
        <meta name="twitter:title" content="Daily Video Game Guessing Game – Guess Effect" />
        <meta name="twitter:description" content="Guess the video game from clues in Guess Effect, the daily challenge for gamers." />
        <meta property="og:image" content="https://guesseffect.wtf/images/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://guesseffect.wtf/images/logo.png" />
        <meta property="og:url" content="https://guesseffect.wtf" />
        <meta property="og:type" content="website" />
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
