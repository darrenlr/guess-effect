import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <title>Guess Effect</title>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}

export default MyApp
