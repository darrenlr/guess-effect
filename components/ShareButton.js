import { useState } from 'react';

const ShareButton = ({ score, remainingGuesses, releaseDate }) => {
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateShareText = () => {
    const formattedDate = formatDate(releaseDate);
    const maxGuesses = 4;
    const redHearts = '❤️'.repeat(remainingGuesses);
    const blackHearts = '🖤'.repeat(maxGuesses - remainingGuesses);
    return `🎮 guesseffect.wtf\n${formattedDate}\n${redHearts}${blackHearts}\n🏆 ${score}`;
  };

  const copyToClipboard = () => {
    const shareText = generateShareText();

    navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true); 
        setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
        alert('Failed to copy!');
    });
  };

  return (
    <div>
        <button onClick={copyToClipboard} className="shareButton">
            [SHARE]
        </button>

        <div className={`toast ${copied ? 'show' : ''}`}>
            COPIED!
        </div>

        <style jsx>{`
            .shareButton {
                background-color: color-mix(in srgb, var(--hud-color) 20%, #000);
                cursor: pointer;
                color: var(--hud-color);
                font-weight: normal;
                font-size: 12px;
                border-radius: 0;
                border: 2px solid var(--hud-color);
                padding: 10px 16px;
                font-family: 'Share Tech Mono', monospace;
                text-align: center;
                transition: all 0.2s ease;
                width: 100%;
            }

            .shareButton:hover {
                background-color: color-mix(in srgb, var(--hud-color) 30%, #000);
            }

            .toast {
                position: fixed;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #000;
                color: var(--hud-color);
                padding: 10px 20px;
                border: 2px solid var(--hud-color);
                border-radius: 0;
                font-size: 14px;
                font-family: 'Share Tech Mono', monospace;
                transition: top 0.4s ease-in-out, opacity 0.4s;
                opacity: 0;
                z-index: 9999;
            }
            .toast.show {
                top: 20px;
                opacity: 1;
            }
        `}</style>
    </div>
  );
};

export default ShareButton;
