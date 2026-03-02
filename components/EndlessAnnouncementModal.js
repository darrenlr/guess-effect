import React, { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "endless_announcement_v1";

const EndlessAnnouncementModal = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(STORAGE_KEY);
        if (!seen) {
            setVisible(true);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <div style={{
                background: '#000',
                border: '3px double var(--hud-color)',
                width: '90%',
                maxWidth: '420px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Share Tech Mono', monospace",
                animation: 'endlessModalPulse 4s ease-in-out infinite',
            }}>
                {/* Scanlines */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
                }} />
                {/* Scan line sweep */}
                <div style={{
                    position: 'absolute', left: 0, right: 0, height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--hud-color), transparent)',
                    opacity: 0.45, zIndex: 3,
                    animation: 'endlessScanDown 3s linear infinite',
                }} />
                {/* Header */}
                <div style={{
                    background: 'var(--hud-color)', color: '#000',
                    padding: '5px 12px', fontSize: '12px', fontWeight: 'bold',
                    letterSpacing: '0.05em', position: 'relative', zIndex: 2,
                }}>
                    SYSTEM_ALERT.SYS — PRIORITY: HIGH
                </div>
                {/* Body */}
                <div style={{ padding: '1.75rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{
                        fontSize: '1.3rem',
                        color: 'var(--hud-color)',
                        letterSpacing: '0.06em',
                        marginBottom: '0.5rem',
                        textShadow: '0 0 12px var(--hud-color)',
                        animation: 'endlessGlitchShift 5s steps(1) infinite',
                    }}>
                        &gt;&gt;&gt; NEW FEATURE &lt;&lt;&lt;
                    </div>
                    <div style={{
                        fontSize: '0.65rem', color: 'var(--hud-color)',
                        opacity: 0.6, marginBottom: '1.25rem', letterSpacing: '0.08em',
                    }}>
                        ─────────────────────────────────
                    </div>
                    <div style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        ∞ ENDLESS MODE IS LIVE
                    </div>
                    <div style={{
                        fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)',
                        lineHeight: 1.7, marginBottom: '1.5rem',
                    }}>
                        Guess as many games as you can.<br />
                        Every life counts. Every point matters.<br />
                        How far can you go?
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <Link href="/endless" style={{ textDecoration: 'none' }} onClick={dismiss}>
                            <button style={{
                                width: '100%', background: '#000',
                                border: '3px double var(--hud-color)',
                                color: 'var(--hud-color)',
                                fontFamily: "'Share Tech Mono', monospace",
                                fontSize: '0.8rem', padding: '0.85rem',
                                cursor: 'pointer', letterSpacing: '0.12em',
                                animation: 'endlessBtnFlicker 6s steps(1) infinite',
                            }}>
                                [LAUNCH_ENDLESS.EXE]
                            </button>
                        </Link>
                        <button onClick={dismiss} style={{
                            background: 'none',
                            border: '1px solid rgba(0,255,65,0.3)',
                            color: 'rgba(255,255,255,0.4)',
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: '0.7rem', padding: '0.5rem',
                            cursor: 'pointer', letterSpacing: '0.1em',
                        }}>
                            [DISMISS]
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes endlessModalPulse {
                    0%,100% { box-shadow: 0 0 8px var(--hud-color); }
                    50%     { box-shadow: 0 0 28px var(--hud-color), 0 0 60px rgba(0,255,65,0.2); }
                }
                @keyframes endlessScanDown {
                    0%   { top: -2%; }
                    100% { top: 102%; }
                }
                @keyframes endlessGlitchShift {
                    0%   { text-shadow: 2px 0 #ff0040, -2px 0 var(--hud-color), 0 0 12px var(--hud-color); transform: translate(0); }
                    8%   { text-shadow: -3px 0 #ff0040, 3px 0 #00a2ff; transform: translate(-2px, 1px); }
                    16%  { text-shadow: 2px 0 #ff0040, -2px 0 var(--hud-color); transform: translate(2px, 0); }
                    24%  { text-shadow: none; transform: translate(0); }
                    100% { text-shadow: 0 0 12px var(--hud-color); transform: translate(0); }
                }
                @keyframes endlessBtnFlicker {
                    0%,90%,100% { opacity: 1; }
                    92%         { opacity: 0.4; }
                    94%         { opacity: 1; }
                    96%         { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default EndlessAnnouncementModal;
