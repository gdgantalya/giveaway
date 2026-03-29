import { useState, useEffect, useRef } from 'react';
import { saveWinner } from '../dataService';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CasinoIcon from '@mui/icons-material/Casino';
import ReplayIcon from '@mui/icons-material/Replay';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const COLORS = ['#4285f4', '#ea4335', '#34a853'];

export default function WinnerOverlay({ participants, raffleName, raffleId, winnerCount = 1, onClose, onWinnerSaved }) {
    const [phase, setPhase] = useState('spinning');
    const [display, setDisplay] = useState('');
    const [currentWinner, setCurrentWinner] = useState(null);
    const [confirmedWinners, setConfirmedWinners] = useState([]);
    const [remaining, setRemaining] = useState(participants || []);
    const [round, setRound] = useState(1);
    const [saving, setSaving] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!participants?.length) {
            setPhase('empty');
            return;
        }
        runSpin(participants);
    }, []);

    function runSpin(pool) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!pool?.length) return;

        setPhase('spinning');
        setCurrentWinner(null);
        setDisplay('');

        const picked = pool[Math.floor(Math.random() * pool.length)];
        const names = pool.map(p => p.name);
        let frame = 0;
        const total = 80;

        timerRef.current = setInterval(() => {
            const speed = frame < 50 ? 1 : frame < 65 ? 2 : frame < 75 ? 3 : 5;
            if (frame % speed === 0) {
                setDisplay(names[Math.floor(Math.random() * names.length)]);
            }
            frame++;
            if (frame >= total) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                setDisplay(picked.name);
                setTimeout(() => {
                    setCurrentWinner(picked);
                    setPhase('reveal');
                    spawnConfetti();
                }, 700);
            }
        }, 55);
    }

    function handleRetry() {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        const c = document.getElementById('confetti-root');
        if (c) c.innerHTML = '';
        setCurrentWinner(null);
        setDisplay('');
        runSpin(remaining);
    }

    function handleNextRound() {
        const newConfirmed = [...confirmedWinners, currentWinner];
        const newRemaining = remaining.filter(p => p.id !== currentWinner.id);
        setConfirmedWinners(newConfirmed);
        setRemaining(newRemaining);
        setRound(round + 1);
        const c = document.getElementById('confetti-root');
        if (c) c.innerHTML = '';
        runSpin(newRemaining);
    }

    async function handleComplete() {
        const allWinners = [...confirmedWinners, currentWinner];
        setSaving(true);
        try {
            await saveWinner(raffleId, allWinners);
            onWinnerSaved?.(allWinners);
        } catch (e) {
            console.error(e);
        }
        setSaving(false);
        onClose();
    }

    function spawnConfetti() {
        const c = document.getElementById('confetti-root');
        if (!c) return;
        c.innerHTML = '';
        const colors = ['#4285f4', '#ea4335', '#34a853', '#f9ab00', '#c084fc', '#fb7185'];
        for (let i = 0; i < 100; i++) {
            const el = document.createElement('div');
            const sz = 5 + Math.random() * 10;
            el.style.cssText = `
                position:absolute; left:${Math.random() * 100}%; top:-20px;
                width:${sz}px; height:${Math.random() > 0.4 ? sz : sz * 0.5}px;
                background:${colors[Math.floor(Math.random() * colors.length)]};
                border-radius:${Math.random() > 0.4 ? '50%' : '2px'};
                animation: confettiFall ${2.5 + Math.random() * 2.5}s ${Math.random() * 0.8}s ease-in forwards;
            `;
            c.appendChild(el);
        }
    }

    const isLastRound = round >= winnerCount;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,12,0.96)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(66,133,244,0.12) 0%, transparent 70%)', animation: 'glow 3s ease infinite' }} />
            <div id="confetti-root" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 580, width: '100%' }}>
                <img src="/beyaz.png" alt="Logo" style={{ height: 48, objectFit: 'contain', marginBottom: '1.5rem', opacity: 0.9 }} />

                {/* BOŞ KATILIMCI */}
                {phase === 'empty' && (
                    <div style={{ animation: 'fadeUp 0.4s ease' }}>
                        <WarningAmberIcon sx={{ fontSize: 64, color: '#f9ab00', marginBottom: '1rem' }} />
                        <h2 style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>
                            Katılımcı Bulunamadı
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>
                            Bu çekilişe henüz kimse katılmamış.<br />Katılımcı beklendikten sonra tekrar deneyin.
                        </p>
                        <button onClick={onClose} style={{ padding: '0.9rem 2.5rem', background: '#f9ab00', color: '#1e1e1e', border: 'none', borderRadius: 50, fontFamily: 'Google Sans, sans-serif', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                            Kapat
                        </button>
                    </div>
                )}

                {/* ÇEVİRME ANİMASYONU */}
                {phase === 'spinning' && (
                    <div style={{ animation: 'fadeUp 0.4s ease' }}>
                        <CasinoIcon sx={{ fontSize: 48, color: '#4285f4', marginBottom: '1rem' }} />
                        <p style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem' }}>
                            {raffleName}
                        </p>
                        <p style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '0.8rem', color: '#4285f4', marginBottom: '1.5rem' }}>
                            {winnerCount > 1 ? `${round}. kazanan seçiliyor (toplam ${winnerCount} kişi)` : 'Çekiliş Yapılıyor'}
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem 3rem', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
                            <div style={{ fontFamily: 'Google Sans, sans-serif', fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 700, color: '#4285f4', minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {display || '...'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], animation: `dotBounce 1.2s ${i * 0.2}s ease infinite` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* KAZANAN EKRANI */}
                {phase === 'reveal' && currentWinner && (
                    <div style={{ animation: 'pop 0.5s cubic-bezier(.34,1.56,.64,1)' }}>
                        <EmojiEventsIcon sx={{ fontSize: 80, color: '#f9ab00', marginBottom: '1rem' }} />
                        <p style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
                            {winnerCount > 1 ? `${round}. Kazanan` : 'Kazanan'}
                        </p>
                        <h2 style={{ fontFamily: 'Google Sans, sans-serif', fontSize: 'clamp(2rem,7vw,4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '0.5rem', color: '#fff' }}>
                            {currentWinner.name}
                        </h2>
                        <p style={{ color: '#4285f4', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>{currentWinner.email}</p>
                        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '0.5rem 1.2rem', display: 'inline-block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: confirmedWinners.length > 0 ? '1.5rem' : '2.5rem' }}>
                            {raffleName}
                        </div>

                        {/* Önceki onaylanan kazananlar */}
                        {confirmedWinners.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '0.75rem 1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
                                <div style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.6rem', fontFamily: 'Google Sans, sans-serif', fontWeight: 700 }}>
                                    Önceki Kazananlar
                                </div>
                                {confirmedWinners.map((w, i) => (
                                    <div key={w.email} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', borderBottom: i < confirmedWinners.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#34a853', fontWeight: 700, width: 18 }}>{i + 1}.</span>
                                        <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', fontFamily: 'Google Sans, sans-serif', fontWeight: 600 }}>{w.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>{w.email}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {/* Tekrar Çekiliş */}
                            <button onClick={handleRetry} style={{ padding: '0.9rem 2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50, fontFamily: 'Google Sans, sans-serif', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                <ReplayIcon sx={{ fontSize: 20 }} />
                                Tekrar Çek
                            </button>

                            {/* Sonraki Kazanan veya Tamamla */}
                            {!isLastRound ? (
                                <button onClick={handleNextRound} style={{ padding: '0.9rem 2rem', background: '#4285f4', color: '#fff', border: 'none', borderRadius: 50, fontFamily: 'Google Sans, sans-serif', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <ArrowForwardIcon sx={{ fontSize: 20 }} />
                                    {round + 1}. Kazananı Seç ({round}/{winnerCount})
                                </button>
                            ) : (
                                <button onClick={handleComplete} disabled={saving} style={{ padding: '0.9rem 2rem', background: '#34a853', color: '#fff', border: 'none', borderRadius: 50, fontFamily: 'Google Sans, sans-serif', fontSize: '0.95rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1, transition: 'all 0.2s' }}
                                    onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'scale(1.05)')}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {saving
                                        ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff' }} />
                                        : <CheckCircleIcon sx={{ fontSize: 20 }} />
                                    }
                                    Çekilişi Tamamla
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
