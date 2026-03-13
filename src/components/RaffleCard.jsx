import { useState } from 'react';

const EMOJIS = ['🎓', '💻', '📚', '🎨', '🏋️', '🎵', '🌍', '✈️', '📷', '🎯', '🎮', '🍕'];

export default function RaffleCard({ raffle, index, count, onJoin }) {
    const [hovered, setHovered] = useState(false);
    const [imgErr, setImgErr] = useState(false);
    const emoji = EMOJIS[index % EMOJIS.length];

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--surface)',
                border: `1px solid ${hovered ? 'rgba(245,200,66,0.35)' : 'var(--border)'}`,
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.25s ease',
                transform: hovered ? 'translateY(-7px)' : 'translateY(0)',
                boxShadow: hovered ? '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,200,66,0.08)' : 'none',
                animation: `fadeUp 0.5s cubic-bezier(.22,1,.36,1) ${index * 0.07}s both`,
            }}
        >
            {raffle.imageUrl && !imgErr
                ? <img src={raffle.imageUrl} alt={raffle.name} onError={() => setImgErr(true)}
                    style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: 210, background: 'linear-gradient(135deg, var(--surface2), var(--surface3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>{emoji}</div>
            }

            <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {raffle.sponsor && (
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                        {raffle.sponsor}
                    </span>
                )}
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.02em' }}>{raffle.name}</h2>
                {raffle.description && <p style={{ fontSize: '0.84rem', color: 'var(--muted2)', lineHeight: 1.65, flex: 1 }}>{raffle.description}</p>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--muted)', paddingTop: '0.9rem', borderTop: '1px solid var(--border)', marginTop: '0.3rem' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {count} katılımcı
                </div>

                <button onClick={() => onJoin(raffle)} style={{
                    marginTop: '0.5rem', padding: '0.8rem',
                    background: hovered ? 'var(--accent)' : 'var(--accent-dim)',
                    color: hovered ? '#080810' : 'var(--accent)',
                    border: `1px solid ${hovered ? 'transparent' : 'rgba(245,200,66,0.25)'}`,
                    borderRadius: 10, fontFamily: 'Syne, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                    cursor: 'pointer', width: '100%', transition: 'all 0.25s ease', letterSpacing: '0.02em',
                }}>
                    Çekilişe Katıl
                </button>
            </div>
        </div>
    );
}