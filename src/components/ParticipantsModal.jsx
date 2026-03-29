import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import CasinoIcon from '@mui/icons-material/Casino';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ClearIcon from '@mui/icons-material/Clear';

export default function ParticipantsModal({ raffle, participants, onClose }) {
    const [picked, setPicked] = useState(null);
    const [pickedList, setPickedList] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [display, setDisplay] = useState('');

    if (!raffle) return null;

    function pickRandom() {
        const count = raffle.winnerCount || 1;
        if (!participants.length) return;
        setSpinning(true); setPicked(null); setPickedList([]);

        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, participants.length));
        const winner = selected[0];
        const names = participants.map(p => p.name);
        let frame = 0; const total = 50;

        const iv = setInterval(() => {
            const speed = frame < 35 ? 1 : frame < 45 ? 2 : 4;
            if (frame % speed === 0) setDisplay(names[Math.floor(Math.random() * names.length)]);
            frame++;
            if (frame >= total) {
                clearInterval(iv);
                setDisplay(winner.name);
                setPicked(winner);
                setPickedList(selected);
                setSpinning(false);
            }
        }, 60);
    }

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, width: '100%', maxWidth: 660, maxHeight: '85vh', display: 'flex', flexDirection: 'column', animation: 'pop 0.3s cubic-bezier(.34,1.56,.64,1)' }}>

                {/* Header */}
                <div style={{ padding: '1.4rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <GroupIcon sx={{ fontSize: 22, color: '#4285f4' }} />
                        <div>
                            <h3 style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.05rem', fontWeight: 700 }}>{raffle.name}</h3>
                            <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.1rem' }}>{participants.length} katılımcı</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--surface2)', border: 'none', color: 'var(--muted2)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </button>
                </div>

                {/* Random Pick */}
                {participants.length > 0 && (
                    <div style={{ padding: '1.2rem 2rem', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 180, background: 'var(--surface)', border: `1px solid ${spinning || picked ? '#4285f4' : 'var(--border)'}`, borderRadius: 10, padding: '0.65rem 1rem', fontFamily: 'Google Sans, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: picked ? '#4285f4' : 'var(--text)', transition: 'border-color 0.2s', minHeight: 44, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {spinning
                                    ? <span style={{ color: 'var(--muted)' }}>{display}</span>
                                    : picked
                                        ? <><EmojiEventsIcon sx={{ fontSize: 18, color: '#f9ab00' }} /><span>{picked.name} <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--muted)' }}>— {picked.email}</span></span></>
                                        : <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.85rem' }}>Rastgele seçim için butona bas</span>
                                }
                            </div>
                            <button onClick={pickRandom} disabled={spinning} style={{ padding: '0.65rem 1.3rem', background: '#4285f4', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'Google Sans, sans-serif', fontSize: '0.85rem', fontWeight: 700, cursor: spinning ? 'not-allowed' : 'pointer', opacity: spinning ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}>
                                {spinning
                                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Seçiliyor...</>
                                    : <><CasinoIcon sx={{ fontSize: 18 }} /> Rastgele Seç</>
                                }
                            </button>
                        </div>

                        {pickedList.length > 0 && !spinning && (
                            <div style={{ marginTop: '0.8rem', background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.25)', borderRadius: 10, padding: '0.6rem 1rem', animation: 'pop 0.4s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: pickedList.length > 1 ? '0.5rem' : 0 }}>
                                    <EmojiEventsIcon sx={{ fontSize: 18, color: '#34a853' }} />
                                    <span style={{ fontSize: '0.85rem', color: '#34a853', fontWeight: 600 }}>
                                        {pickedList.length > 1 ? `${pickedList.length} kişi seçildi!` : <><strong>{picked.name}</strong> seçildi!</>}
                                    </span>
                                    <button onClick={() => { setPicked(null); setPickedList([]); setDisplay(''); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </button>
                                </div>
                                {pickedList.length > 1 && pickedList.map((p, i) => (
                                    <div key={p.email} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.3rem', paddingBottom: '0.3rem', borderTop: '1px solid rgba(52,168,83,0.15)', fontSize: '0.83rem' }}>
                                        <span style={{ color: '#34a853', fontWeight: 700, width: 18 }}>{i + 1}.</span>
                                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                                        <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>{p.email}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Table */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {participants.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                            <GroupIcon sx={{ fontSize: 48, color: 'var(--border2)', marginBottom: '0.75rem' }} />
                            <p>Henüz katılımcı yok</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['#', 'Ad Soyad', 'E-posta', 'Tarih'].map((h, i) => (
                                        <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontFamily: 'Google Sans, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ['#4285f4', '#ea4335', '#34a853', '#f9ab00'][i] }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, i) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: pickedList.some(w => w.id === p.id) ? 'rgba(52,168,83,0.05)' : 'transparent', transition: 'background 0.3s' }}>
                                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--muted)', fontSize: '0.78rem' }}>{i + 1}</td>
                                        <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.88rem', fontWeight: pickedList.some(w => w.id === p.id) ? 700 : 500, color: pickedList.some(w => w.id === p.id) ? '#34a853' : 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {pickedList.some(w => w.id === p.id) && <EmojiEventsIcon sx={{ fontSize: 16, color: '#f9ab00' }} />}
                                            {p.name}
                                        </td>
                                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--muted2)', fontSize: '0.83rem' }}>{p.email}</td>
                                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--muted)', fontSize: '0.78rem' }}>
                                            {new Date(p.joinedAt?.toDate ? p.joinedAt.toDate() : p.joinedAt).toLocaleDateString('tr-TR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}