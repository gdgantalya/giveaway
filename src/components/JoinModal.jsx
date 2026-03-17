import { useState } from 'react';
import { addEntry, hasEntered, getAttendees, isAttendee } from '../dataService';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function JoinModal({ raffle, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    if (!raffle) return null;

    async function submit() {
        if (!name.trim() || !email.trim()) { setError('Lütfen tüm alanları doldurun.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Geçerli bir e-posta adresi girin.'); return; }

        setLoading(true); setError('');
        try {
            const attendeeList = await getAttendees();
            if (attendeeList.length > 0) {
                const allowed = await isAttendee(email);
                if (!allowed) { setError('Bu e-posta adresi etkinlik katılımcı listesinde bulunamadı!'); setLoading(false); return; }
            }
            const already = await hasEntered(raffle.id, email);
            if (already) { setError('Bu e-posta adresi ile zaten katıldınız!'); setLoading(false); return; }
            await addEntry({ raffleId: raffle.id, raffleName: raffle.name, name: name.trim(), email: email.toLowerCase().trim() });
            setDone(true);
            onSuccess?.();
            setTimeout(onClose, 2800);
        } catch (e) {
            console.error(e);
            setError('Bir hata oluştu, tekrar dene.');
        }
        setLoading(false);
    }

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 24,
                padding: '2.5rem', width: '100%', maxWidth: 420, position: 'relative',
                animation: 'pop 0.35s cubic-bezier(.34,1.56,.64,1)',
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'var(--surface2)', border: 'none', color: 'var(--muted2)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                </button>

                {done ? (
                    <div style={{ textAlign: 'center', padding: '0.5rem 0', animation: 'pop 0.4s ease' }}>
                        <CelebrationIcon sx={{ fontSize: 56, color: '#34a853', marginBottom: '1rem' }} />
                        <h3 style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Katılımın Onaylandı!</h3>
                        <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Tebrikler <strong style={{ color: 'var(--text)' }}>{name}</strong>,<br />şansın bol olsun!
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <ConfirmationNumberIcon sx={{ fontSize: 32, color: '#4285f4', marginTop: '0.2rem' }} />
                            <div>
                                <h2 style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>Çekilişe Katıl</h2>
                                <p style={{ color: '#4285f4', fontSize: '0.85rem', fontWeight: 500 }}>{raffle.name}</p>
                            </div>
                        </div>

                        <Field label="İsim Soyisim" type="text" placeholder="Adınız Soyadınız" value={name} onChange={setName} onEnter={submit} />
                        <Field label="E-posta Adresi" type="email" placeholder="ornek@mail.com" value={email} onChange={setEmail} onEnter={submit} />

                        {error && (
                            <div style={{ background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.25)', borderRadius: 8, padding: '0.6rem 0.9rem', color: '#ea4335', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <WarningAmberIcon sx={{ fontSize: 16 }} />
                                {error}
                            </div>
                        )}

                        <button onClick={submit} disabled={loading} style={{
                            width: '100%', padding: '0.95rem', background: '#4285f4', color: '#fff',
                            border: 'none', borderRadius: 12, fontFamily: 'Google Sans, sans-serif', fontSize: '0.95rem',
                            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s',
                        }}>
                            {loading
                                ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                : <><span>Katılımımı Onayla</span><ArrowForwardIcon sx={{ fontSize: 18 }} /></>
                            }
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function Field({ label, type, placeholder, value, onChange, onEnter }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontFamily: 'Google Sans, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</label>
            <input
                type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onEnter?.()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%', padding: '0.85rem 1rem',
                    background: 'var(--surface2)', border: `1px solid ${focused ? '#4285f4' : 'var(--border)'}`,
                    borderRadius: 10, color: 'var(--text)', fontFamily: 'Google Sans, sans-serif', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s',
                }}
            />
        </div>
    );
}