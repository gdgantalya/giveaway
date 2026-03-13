import { useState, useEffect } from 'react';
import { getRaffles, getEntries, getCountMap, addRaffle, updateRaffle, deleteRaffle, getEntriesForRaffle } from '../dataService';
import WinnerOverlay from '../components/WinnerOverlay';
import ParticipantsModal from '../components/ParticipantsModal';

const ADMIN_CREDS = { user: 'admin', pass: 'admin123' };

export default function Admin({ onNavigate }) {
    const [authed, setAuthed] = useState(false);
    const [page, setPage] = useState('raffles');
    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} onBack={() => onNavigate('home')} />;
    return <AdminPanel page={page} setPage={setPage} onLogout={() => setAuthed(false)} onNavigate={onNavigate} />;
}

/* ─── LOGIN ─────────────────────────────────────────── */
function LoginScreen({ onLogin, onBack }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [err, setErr] = useState(false);
    const [showPass, setShowPass] = useState(false);

    function tryLogin() {
        if (user === ADMIN_CREDS.user && pass === ADMIN_CREDS.pass) { onLogin(); }
        else { setErr(true); setTimeout(() => setErr(false), 2500); }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(245,200,66,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 24, padding: '3rem', width: '100%', maxWidth: 400, textAlign: 'center', animation: 'fadeUp 0.5s ease', position: 'relative' }}>
                <button onClick={onBack} style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>← Geri</button>

                {/* <div style={{ fontSize: '2.8rem', marginBottom: '1.5rem' }}>🔐</div> */}
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem' }}>Yönetim Paneli</h1>
                <p style={{ color: 'var(--muted2)', fontSize: '0.87rem', marginBottom: '2rem' }}>Devam etmek için giriş yapın</p>

                <div style={{ position: 'relative', marginBottom: err ? '0.5rem' : '1.1rem' }}><input value={user} onChange={e => setUser(e.target.value)} placeholder="Kullanıcı adı"
                    onKeyDown={e => e.key === 'Enter' && tryLogin()}
                    style={inputSt} onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}
                /></div>
                <div style={{ position: 'relative', marginBottom: err ? '0.5rem' : '1.5rem' }}>
                    <input value={pass} onChange={e => setPass(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Şifre"
                        onKeyDown={e => e.key === 'Enter' && tryLogin()}
                        style={{ ...inputSt, marginBottom: 0, paddingRight: '3rem' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem' }}>
                        {showPass ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                </div>
                {err && <p style={{ color: 'var(--accent2)', fontSize: '0.82rem', marginBottom: '1rem', animation: 'pop 0.3s ease' }}>⚠️ Kullanıcı adı veya şifre hatalı.</p>}

                <button onClick={tryLogin} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem' }}>
                    Giriş Yap
                </button>
                {/* <p style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: '1.2rem' }}>Varsayılan: admin / admin123</p> */}
            </div>
        </div>
    );
}

/* ─── ADMIN PANEL ───────────────────────────────────── */
function AdminPanel({ page, setPage, onLogout, onNavigate }) {
    const [raffles, setRaffles] = useState([]);
    const [allEntries, setAllEntries] = useState([]);
    const [countMap, setCountMap] = useState({});
    const [menuOpen, setMenuOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [fName, setFName] = useState('');
    const [fDesc, setFDesc] = useState('');
    const [fSponsor, setFSponsor] = useState('');
    const [fImage, setFImage] = useState('');
    const [saving, setSaving] = useState(false);
    const [participants, setParticipants] = useState(null);
    const [drawRaffle, setDrawRaffle] = useState(null);
    const [toast, setToast] = useState(null);

    function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

    async function load() {
        try {
            const [r, e, c] = await Promise.all([getRaffles(), getEntries(), getCountMap()]);
            setRaffles(r); setAllEntries(e); setCountMap(c);
        } catch (e) { console.error(e); }
    }

    useEffect(() => { load(); }, []);

    function clearForm() { setFName(''); setFDesc(''); setFSponsor(''); setFImage(''); setEditId(null); }
    function openAdd() { clearForm(); setPage('add'); setMenuOpen(false); }
    function openEdit(r) { setEditId(r.id); setFName(r.name || ''); setFDesc(r.description || ''); setFSponsor(r.sponsor || ''); setFImage(r.imageUrl || ''); setPage('add'); }
    function navigate(id) { if (id === 'add') clearForm(); setPage(id); setMenuOpen(false); }

    async function handleSave() {
        if (!fName.trim()) { showToast('Çekiliş adı zorunlu!', 'error'); return; }
        setSaving(true);
        try {
            const data = { name: fName.trim(), description: fDesc.trim(), sponsor: fSponsor.trim(), imageUrl: fImage.trim() };
            if (editId) { await updateRaffle(editId, data); showToast('Çekiliş güncellendi! ✓'); }
            else { await addRaffle(data); showToast('Çekiliş eklendi! ✓'); }
            clearForm(); await load(); setPage('raffles');
        } catch (e) { console.error(e); showToast('Hata oluştu!', 'error'); }
        setSaving(false);
    }

    async function handleDelete(r) {
        if (!confirm(`"${r.name}" silinsin mi?`)) return;
        try { await deleteRaffle(r.id); showToast('Silindi.'); await load(); }
        catch (e) { showToast('Hata oluştu!', 'error'); }
    }

    async function handleDraw(r) {
        const list = await getEntriesForRaffle(r.id);
        if (!list.length) { showToast('Henüz katılımcı yok!', 'error'); return; }
        setDrawRaffle({ raffle: r, list });
    }

    const navItems = [
        { id: 'raffles', title: 'Çekilişler' },
        { id: 'add', label: '➕', title: 'Yeni Çekiliş' },
        { id: 'entries', label: '👥', title: 'Katılımcılar' },
    ];

    return (
        <>
            <style>{`
                .a-layout { display: flex; min-height: 100vh; }
                .a-sidebar {
                    width: 220px; background: var(--surface); border-right: 1px solid var(--border);
                    padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.2rem;
                    flex-shrink: 0; position: fixed; top: 0; bottom: 0; overflow-y: auto; z-index: 20;
                }
                .a-main { flex: 1; margin-left: 220px; padding: 2.5rem; min-height: 100vh; }
                .a-topbar { display: none; }
                .a-overlay { display: none; }

                @media (max-width: 768px) {
                    .a-sidebar {
                        transform: translateX(-100%);
                        width: 260px; top: 54px;
                        box-shadow: 4px 0 24px rgba(0,0,0,0.12);
                        transition: transform 0.28s ease;
                    }
                    .a-sidebar.is-open { transform: translateX(0); }
                    .a-main { margin-left: 0; padding: 1.2rem; padding-top: 68px; }
                    .a-topbar {
                        display: flex; position: fixed; top: 0; left: 0; right: 0; z-index: 30;
                        background: var(--surface); border-bottom: 1px solid var(--border);
                        height: 54px; padding: 0 1rem; align-items: center; justify-content: space-between;
                    }
                    .a-overlay {
                        display: block; position: fixed; inset: 0; top: 54px;
                        background: rgba(0,0,0,0.35); z-index: 15;
                    }
                }
            `}</style>

            <div className="a-layout">
                {/* Mobile topbar */}
                <div className="a-topbar">
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--accent)', fontSize: '1rem' }}>⚡ Admin</span>
                    <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <span style={{ display: 'block', width: 16, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(3px,3px)' : 'none' }} />
                        <span style={{ display: 'block', width: 16, height: 2, background: 'var(--text)', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
                        <span style={{ display: 'block', width: 16, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(3px,-3px)' : 'none' }} />
                    </button>
                </div>

                {menuOpen && <div className="a-overlay" onClick={() => setMenuOpen(false)} />}

                {/* Sidebar */}
                <aside className={`a-sidebar ${menuOpen ? 'is-open' : ''}`}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--accent)', fontSize: '0.95rem', marginBottom: '1.5rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
                        Yönetim Paneli
                    </div>
                    {navItems.map(n => (
                        <NavBtn key={n.id} active={page === n.id} onClick={() => navigate(n.id)}>
                            {n.label} {n.title}
                        </NavBtn>
                    ))}
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <NavBtn onClick={() => { onNavigate('home'); setMenuOpen(false); }}>Siteye Git</NavBtn>
                        <NavBtn onClick={onLogout} danger>Çıkış</NavBtn>
                    </div>
                </aside>

                {/* Main content */}
                <main className="a-main">

                    {page === 'raffles' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <h1 style={pageTitleSt}>Çekilişler</h1>
                                <button onClick={openAdd} style={btnPrimary}>➕ Yeni Ekle</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <StatCard label="Çekiliş" value={raffles.length} />
                                <StatCard label="Katılım" value={allEntries.length} icon="👥" />
                                <StatCard label="Aktif" value={raffles.length} />
                            </div>
                            {raffles.length === 0 ? (
                                <Empty msg="Henüz çekiliş eklenmemiş." action={<button onClick={openAdd} style={btnPrimary}>➕ İlk Çekilişi Ekle</button>} />
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.2rem' }}>
                                    {raffles.map(r => (
                                        <RaffleAdminCard key={r.id} raffle={r} count={countMap[r.id] || 0}
                                            onEdit={() => openEdit(r)}
                                            onDelete={() => handleDelete(r)}
                                            onParticipants={async () => { const list = await getEntriesForRaffle(r.id); setParticipants({ raffle: r, list }); }}
                                            onDraw={() => handleDraw(r)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {page === 'add' && (
                        <div>
                            <h1 style={{ ...pageTitleSt, marginBottom: '1.5rem' }}>{editId ? 'Çekilişi Düzenle' : 'Yeni Çekiliş'}</h1>
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', maxWidth: 580 }}>
                                <FormRow label="Çekiliş Adı *">
                                    <input style={inputSt} placeholder="Örn: Yabancı Dil Kursu" value={fName} onChange={e => setFName(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </FormRow>
                                <FormRow label="Açıklama">
                                    <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 80 }} placeholder="Hediye hakkında kısa bilgi..." value={fDesc} onChange={e => setFDesc(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </FormRow>
                                <FormRow label="Sponsor / Destekçi">
                                    <input style={inputSt} placeholder="Örn: XYZ Akademi" value={fSponsor} onChange={e => setFSponsor(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </FormRow>
                                <FormRow label="Görsel URL (opsiyonel)">
                                    <input style={inputSt} type="url" placeholder="https://..." value={fImage} onChange={e => setFImage(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </FormRow>
                                {fImage && (
                                    <div style={{ marginBottom: '1.2rem' }}>
                                        <img src={fImage} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} onError={e => e.target.style.display = 'none'} />
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', padding: '0.9rem', opacity: saving ? 0.6 : 1 }}>
                                        {saving ? 'Kaydediliyor...' : (editId ? 'Güncelle' : 'Kaydet')}
                                    </button>
                                    <button onClick={() => { clearForm(); setPage('raffles'); }} style={btnOutline}>İptal</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {page === 'entries' && (
                        <div>
                            <h1 style={{ ...pageTitleSt, marginBottom: '0.5rem' }}>Tüm Katılımcılar</h1>
                            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{allEntries.length} kayıt</p>
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'auto' }}>
                                {allEntries.length === 0 ? <Empty msg="Henüz katılımcı yok." /> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                {['Ad Soyad', 'E-posta', 'Çekiliş', 'Tarih'].map(h => (
                                                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontFamily: 'Syne, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allEntries.map(e => (
                                                <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.8rem 1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{e.name}</td>
                                                    <td style={{ padding: '0.8rem 1rem', color: 'var(--muted2)', fontSize: '0.83rem' }}>{e.email}</td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>
                                                        <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.76rem', color: 'var(--muted2)', whiteSpace: 'nowrap' }}>{e.raffleName}</span>
                                                    </td>
                                                    <td style={{ padding: '0.8rem 1rem', color: 'var(--muted)', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                                                        {e.joinedAt?.toDate ? e.joinedAt.toDate().toLocaleDateString('tr-TR') : new Date(e.joinedAt).toLocaleDateString('tr-TR')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {participants && <ParticipantsModal raffle={participants.raffle} participants={participants.list} onClose={() => setParticipants(null)} />}
            {drawRaffle && <WinnerOverlay participants={drawRaffle.list} raffleName={drawRaffle.raffle.name} onClose={() => setDrawRaffle(null)} />}

            {toast && (
                <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', border: `1px solid ${toast.type === 'error' ? 'var(--accent2)' : 'var(--success)'}`, color: toast.type === 'error' ? 'var(--accent2)' : 'var(--success)', borderRadius: 50, padding: '0.8rem 1.5rem', fontSize: '0.88rem', zIndex: 2000, animation: 'pop 0.3s ease', whiteSpace: 'nowrap' }}>
                    {toast.msg}
                </div>
            )}
        </>
    );
}

/* ─── RAFFLE ADMIN CARD ─────────────────────────────── */
function RaffleAdminCard({ raffle, count, onEdit, onDelete, onParticipants, onDraw }) {
    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {raffle.sponsor && <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)' }}>{raffle.sponsor}</div>}
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 700 }}>{raffle.name}</div>
            {raffle.description && <div style={{ fontSize: '0.82rem', color: 'var(--muted2)', lineHeight: 1.55 }}>{raffle.description}</div>}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 50, padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: 'var(--muted2)', width: 'fit-content' }}>
                👥 {count} katılımcı
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={onEdit} style={{ ...btnSmall, flex: 1, background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', textAlign: 'center' }}>Düzenle</button>
                <button onClick={onDelete} style={{ ...btnSmall, flex: 1, background: 'transparent', color: 'var(--accent2)', border: '1px solid rgba(255,92,58,0.25)', textAlign: 'center' }}>Sil</button>
            </div>
            <button onClick={onParticipants} style={{ width: '100%', padding: '0.6rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '0.83rem', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                👥 Katılımcıları Gör
            </button>
            <button onClick={onDraw} style={{ width: '100%', padding: '0.75rem', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
                Çekilişi Başlat
            </button>
        </div>
    );
}

/* ─── SMALL COMPONENTS ──────────────────────────────── */
function NavBtn({ children, active, onClick, danger }) {
    return (
        <button onClick={onClick} style={{ padding: '0.7rem 1rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.9rem', color: danger ? 'var(--accent2)' : active ? 'var(--accent)' : 'var(--muted2)', background: active ? 'var(--accent-dim)' : 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {children}
        </button>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div style={{ background: 'var(--surface)', border: '2px solid var(--border2)', borderRadius: 16, padding: '1.2rem 1.5rem' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: '0.5rem' }}>{icon} {label}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.04em' }}>{value}</div>
        </div>
    );
}

function FormRow({ label, children }) {
    return (
        <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontFamily: 'Syne, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</label>
            {children}
        </div>
    );
}

function Empty({ msg, action }) {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></div>
            <p style={{ fontSize: '1rem', marginBottom: action ? '1.5rem' : 0 }}>{msg}</p>
            {action}
        </div>
    );
}

const inputSt = { width: '100%', padding: '0.85rem 1rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.93rem', outline: 'none', transition: 'border-color 0.2s', marginBottom: 0 };
const btnPrimary = { padding: '0.6rem 1.2rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'Syne, sans-serif', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s' };
const btnOutline = { padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 9, fontFamily: 'Syne, sans-serif', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' };
const btnSmall = { padding: '0.5rem 0.85rem', borderRadius: 7, fontFamily: 'Syne, sans-serif', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' };
const pageTitleSt = { fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.4rem,4vw,1.8rem)', fontWeight: 800, letterSpacing: '-0.03em' };