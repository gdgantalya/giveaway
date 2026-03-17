import { useState, useEffect } from 'react';
import { getRaffles, getCountMap } from '../dataService';
import RaffleCard from '../components/RaffleCard';
import JoinModal from '../components/JoinModal';

export default function Home({ onNavigate }) {
    const [raffles, setRaffles] = useState([]);
    const [counts, setCounts] = useState({});
    const [active, setActive] = useState(null);

    async function load() {
        try {
            const [r, c] = await Promise.all([getRaffles(), getCountMap()]);
            setRaffles(r.filter(item => item.isActive !== false));
            setCounts(c);
        } catch (e) { console.error(e); }
    }

    useEffect(() => { load(); }, []);

    return (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
            {/* <div className="home-bg">
                <div className="blob-green" />
                <div className="blob-yellow" />
            </div> */}
            {/* Background GIF */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.3 }}>
                <img src="/hero_animated_logo.gif" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Header */}
            <header style={{ position: 'relative', zIndex: 1, padding: '5rem 2rem 0', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', animation: 'fadeUp 0.5s ease 0.05s both' }}>
                    <img src="/gdg-logo2.png" alt="GDG Antalya" style={{ height: 68, objectFit: 'contain' }} />
                </div>
                <h1 style={{ fontFamily: 'Google Sans, sans-serif', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', animation: 'fadeUp 0.6s ease 0.2s both', marginBottom: '0.5rem' }}>
                    Etkinlik{' '}
                    <span style={{ color: '#4285f4' }}>Ç</span><span style={{ color: '#ea4335' }}>e</span><span style={{ color: '#34a853' }}>k</span><span style={{ color: '#f9ab00' }}>i</span><span style={{ color: '#4285f4' }}>l</span><span style={{ color: '#ea4335' }}>i</span><span style={{ color: '#34a853' }}>ş</span><span style={{ color: '#f9ab00' }}>i</span>
                </h1>

                <p style={{ marginTop: '1.2rem', fontSize: '1rem', color: 'var(--muted2)', fontWeight: 300, lineHeight: 1.7, animation: 'fadeUp 0.6s ease 0.35s both', maxWidth: 480, margin: '1.2rem auto 0' }}>
                    İstediğin çekilişi seç ve şansını dene.
                </p>

                <div style={{ width: 40, height: 2, background: 'var(--accent)', margin: '2rem auto', borderRadius: 2, animation: 'fadeUp 0.5s ease 0.5s both' }} />

             
            </header>

            {/* Grid */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 8rem' }}>
                {raffles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
                        <p style={{ fontSize: '1.05rem' }}>Henüz aktif çekiliş yok.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.4rem' }}>
                        {raffles.map((r, i) => (
                            <RaffleCard key={r.id} raffle={r} index={i} count={counts[r.id] || 0} onJoin={setActive} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - Kurallar */}
            <footer style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '0 2rem 6rem' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.2rem 1.5rem', textAlign: 'left' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {[
                            { color: '#4285f4', text: 'Etkinliğe katılmış olmanız gerekmektedir.' },
                            { color: '#ea4335', text: 'Her çekilişe yalnızca 1 kez katılabilirsiniz.' },
                            { color: '#34a853', text: 'Kayıt olurken etkinlikte kullandığınız e-posta adresini kullanın.' },
                            { color: '#f9ab00', text: 'Kazanan, çekiliş sonucunda rastgele belirlenir.' },
                        ].map((rule, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--muted2)', lineHeight: 1.5 }}>
                                <span style={{ color: rule.color, fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.5 }}>•</span>
                                {rule.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </footer>

            {/* Admin link */}
            <button onClick={() => onNavigate('admin')} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.5rem 1.1rem', borderRadius: 50, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Google Sans, sans-serif', fontWeight: 600, zIndex: 50, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
            >
                ⚙️ Yönetim
            </button>

            {active && <JoinModal raffle={active} onClose={() => setActive(null)} onSuccess={load} />}
        </div>
    );
}