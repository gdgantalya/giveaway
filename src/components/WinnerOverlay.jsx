import { useState, useEffect, useRef } from 'react';

export default function WinnerOverlay({ participants, raffleName, onClose }) {
    const [phase, setPhase] = useState('spinning');
    const [display, setDisplay] = useState('');
    const [winner, setWinner] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!participants?.length) return;
        const picked = participants[Math.floor(Math.random() * participants.length)];
        const names = participants.map(p => p.name);
        let frame = 0; const total = 80;

        timerRef.current = setInterval(() => {
            // Slow down toward end
            const speed = frame < 50 ? 1 : frame < 65 ? 2 : frame < 75 ? 3 : 5;
            if (frame % speed === 0) setDisplay(names[Math.floor(Math.random() * names.length)]);
            frame++;
            if (frame >= total) {
                clearInterval(timerRef.current);
                setDisplay(picked.name);
                setTimeout(() => {
                    setWinner(picked);
                    setPhase('reveal');
                    spawnConfetti();
                }, 700);
            }
        }, 55);

        return () => clearInterval(timerRef.current);
    }, []);

    function spawnConfetti() {
        const c = document.getElementById('confetti-root');
        if (!c) return;
        const colors = ['#f5c842', '#ff5c3a', '#34d399', '#60a5fa', '#c084fc', '#fb7185', '#fbbf24'];
        for (let i = 0; i < 100; i++) {
            const el = document.createElement('div');
            const sz = 5 + Math.random() * 10;
            const isCircle = Math.random() > 0.4;
            el.style.cssText = `
        position:absolute;
        left:${Math.random() * 100}%;
        top: -20px;
        width:${sz}px; height:${isCircle ? sz : sz * 0.5}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${isCircle ? '50%' : '2px'};
        animation: confettiFall ${2.5 + Math.random() * 2.5}s ${Math.random() * 0.8}s ease-in forwards;
      `;
            c.appendChild(el);
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,12,0.97)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            {/* Glow bg */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(245,200,66,0.12) 0%, transparent 70%)', animation: 'glow 3s ease infinite' }} />

            {/* Confetti container */}
            <div id="confetti-root" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 580, width: '100%' }}>

                {phase === 'spinning' && (
                    <div style={{ animation: 'fadeUp 0.4s ease' }}>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '2.5rem' }}>
                            {raffleName}
                        </p>

                        {/* Slot machine display */}
                        <div style={{
                            background: 'var(--surface)', border: '1px solid var(--border2)',
                            borderRadius: 20, padding: '2rem 3rem', marginBottom: '2rem',
                            boxShadow: '0 0 60px rgba(245,200,66,0.1)',
                        }}>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.03em', minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {display || '...'}
                            </div>
                        </div>

                        {/* Dots */}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: `dotBounce 1.2s ${i * 0.2}s ease infinite` }} />
                            ))}
                        </div>
                    </div>
                )}

                {phase === 'reveal' && winner && (
                    <div style={{ animation: 'pop 0.5s cubic-bezier(.34,1.56,.64,1)' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: 1 }}>🏆</div>

                        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                            Kazanan
                        </p>

                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.2rem,7vw,4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff 30%, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {winner.name}
                        </h2>

                        <p style={{ color: 'var(--accent)', fontSize: '1rem', fontWeight: 500, marginBottom: '3rem', opacity: 0.8 }}>
                            {winner.email}
                        </p>

                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '0.8rem 1.5rem', display: 'inline-block', fontSize: '0.85rem', color: 'var(--muted2)', marginBottom: '2rem' }}>
                            {raffleName}
                        </div>
                        <br />

                        <button onClick={onClose} style={{
                            padding: '0.95rem 3rem', background: 'var(--accent)', color: '#080810',
                            border: 'none', borderRadius: 50, fontFamily: 'Syne, sans-serif',
                            fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s',
                        }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        >
                            Tamamlandı
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}