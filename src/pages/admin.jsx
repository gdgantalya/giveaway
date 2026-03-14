import { useState, useEffect } from 'react';
import { getRaffles, getEntries, getCountMap, addRaffle, updateRaffle, deleteRaffle, getEntriesForRaffle } from '../dataService';
import WinnerOverlay from '../components/WinnerOverlay';
import ParticipantsModal from '../components/ParticipantsModal';

// Material Icons
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import CasinoIcon from '@mui/icons-material/Casino';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const ADMIN_CREDS = { user: 'admin', pass: 'admin123' };
const COLORS = ['#4285f4', '#ea4335', '#34a853', '#f9ab00'];

export default function Admin({ onNavigate }) {
    const [authed, setAuthed] = useState(false);
    const [page, setPage] = useState('raffles');
    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} onBack={() => onNavigate('home')} />;
    return <AdminPanel page={page} setPage={setPage} onLogout={() => setAuthed(false)} onNavigate={onNavigate} />;
}

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
            <div className="admin-bg">
                <div className="admin-blob-red" />
                <div className="admin-blob-yellow" />
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 24, padding: '3rem', width: '100%', maxWidth: 400, textAlign: 'center', animation: 'fadeUp 0.5s ease', position: 'relative' }}>
                <button onClick={onBack} style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'Google Sans, sans-serif', fontSize: '0.82rem' }}>
                    <ArrowBackIcon sx={{ fontSize: 16 }} /> Geri
                </button>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <img src="/gdg-logo2.png" alt="GDG Antalya" style={{ height: 44, objectFit: 'contain' }} />
                </div>
                <h1 style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>Yönetim Paneli</h1>
                <p style={{ color: 'var(--muted2)', fontSize: '0.87rem', marginBottom: '2rem' }}>Devam etmek için giriş yapın</p>
                <div style={{ position: 'relative', marginBottom: '1.1rem' }}>
                    <input value={user} onChange={e => setUser(e.target.value)} placeholder="Kullanıcı adı"
                        onKeyDown={e => e.key === 'Enter' && tryLogin()}
                        style={inputSt} onFocus={e => e.target.style.borderColor = '#4285f4'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div style={{ position: 'relative', marginBottom: err ? '0.5rem' : '1.5rem' }}>
                    <input value={pass} onChange={e => setPass(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Şifre"
                        onKeyDown={e => e.key === 'Enter' && tryLogin()}
                        style={{ ...inputSt, marginBottom: 0, paddingRight: '3rem' }}
                        onFocus={e => e.target.style.borderColor = '#4285f4'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showPass ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                    </button>
                </div>
                {err && (
                    <div style={{ color: '#ea4335', fontSize: '0.82rem', marginBottom: '1rem', animation: 'pop 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        ⚠️ Kullanıcı adı veya şifre hatalı.
                    </div>
                )}
                <button onClick={tryLogin} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem' }}>
                    Giriş Yap
                </button>
            </div>
        </div>
    );
}

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
        { id: 'raffles', title: 'Çekilişler', Icon: DashboardIcon },
        { id: 'add', title: 'Yeni Çekiliş', Icon: AddIcon },
        { id: 'entries', title: 'Katılımcılar', Icon: PersonAddIcon },
    ];

    return (
        <>
            <style>{`
                .a-layout { display: flex; min-height: 100vh; }
                .a-sidebar { width: 220px; background: var(--surface); border-right: 1px solid var(--border); padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.2rem; flex-shrink: 0; position: fixed; top: 0; bottom: 0; overflow-y: auto; z-index: 20; }
                .a-main { flex: 1; margin-left: 220px; padding: 2.5rem; min-height: 100vh; }
                .a-topbar { display: none; }
                .a-overlay { display: none; }
                @media (max-width: 768px) {
                    .a-sidebar { transform: translateX(-100%); width: 260px; top: 54px; box-shadow: 4px 0 24px rgba(0,0,0,0.12); transition: transform 0.28s ease; }
                    .a-sidebar.is-open { transform: translateX(0); }
                    .a-main { margin-left: 0; padding: 1.2rem; padding-top: 68px; }
                    .a-topbar { display: flex; position: fixed; top: 0; left: 0; right: 0; z-index: 30; background: var(--surface); border-bottom: 1px solid var(--border); height: 54px; padding: 0 1rem; align-items: center; justify-content: space-between; }
                    .a-overlay { display: block; position: fixed; inset: 0; top: 54px; background: rgba(0,0,0,0.35); z-index: 15; }
                }
            `}</style>
            <div className="admin-bg">
                <div className="admin-blob-red" />
                <div className="admin-blob-yellow" />
            </div>
            <div className="a-layout">
                <div className="a-topbar">
                    <span style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, color: '#4285f4', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <DashboardIcon sx={{ fontSize: 20 }} /> Admin
                    </span>
                    <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {menuOpen ? <CloseIcon sx={{ fontSize: 20 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
                    </button>
                </div>

                {menuOpen && <div className="a-overlay" onClick={() => setMenuOpen(false)} />}

                <aside className={`a-sidebar ${menuOpen ? 'is-open' : ''}`}>
                    <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, color: '#4285f4', fontSize: '0.95rem', marginBottom: '1.5rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DashboardIcon sx={{ fontSize: 20 }} /> Yönetim Paneli
                    </div>
                    {navItems.map((n, i) => (
                        <NavBtn key={n.id} active={page === n.id} color={COLORS[i % COLORS.length]} onClick={() => navigate(n.id)} Icon={n.Icon}>
                            {n.title}
                        </NavBtn>
                    ))}
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <NavBtn color="#4285f4" Icon={LanguageIcon} onClick={() => { onNavigate('home'); setMenuOpen(false); }}>Siteye Git</NavBtn>
                        <NavBtn color="#ea4335" Icon={LogoutIcon} onClick={onLogout} danger>Çıkış</NavBtn>
                    </div>
                </aside>

                <main className="a-main">
                    {page === 'raffles' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <h1 style={pageTitleSt}>Çekilişler</h1>
                                <button onClick={openAdd} style={btnPrimary}>
                                    <AddIcon sx={{ fontSize: 18 }} /> Yeni Ekle
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <StatCard label="Çekiliş" value={raffles.length} Icon={CelebrationIcon} colorIndex={0} />
                                <StatCard label="Katılım" value={allEntries.length} Icon={GroupIcon} colorIndex={1} />
                                <StatCard label="Aktif" value={raffles.length} Icon={CheckCircleIcon} colorIndex={2} />
                            </div>
                            {raffles.length === 0 ? (
                                <Empty msg="Henüz çekiliş eklenmemiş." action={<button onClick={openAdd} style={btnPrimary}><AddIcon sx={{ fontSize: 18 }} /> İlk Çekilişi Ekle</button>} />
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.2rem' }}>
                                    {raffles.map((r, i) => (
                                        <RaffleAdminCard key={r.id} raffle={r} count={countMap[r.id] || 0}
                                            colorIndex={i}
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
                                        onFocus={e => e.target.style.borderColor = '#4285f4'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </FormRow>
                                <FormRow label="Açıklama">
                                    <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 80 }} placeholder="Hediye hakkında kısa bilgi..." value={fDesc} onChange={e => setFDesc(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = '#34a853'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </FormRow>
                                <FormRow label="Sponsor / Destekçi">
                                    <input style={inputSt} placeholder="Örn: XYZ Akademi" value={fSponsor} onChange={e => setFSponsor(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = '#f9ab00'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </FormRow>
                                <FormRow label="Görsel URL (opsiyonel)">
                                    <input style={inputSt} type="url" placeholder="https://..." value={fImage} onChange={e => setFImage(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = '#ea4335'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </FormRow>
                                {fImage && (
                                    <div style={{ marginBottom: '1.2rem' }}>
                                        <img src={fImage} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} onError={e => e.target.style.display = 'none'} />
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', padding: '0.9rem', opacity: saving ? 0.6 : 1 }}>
                                        <CheckCircleIcon sx={{ fontSize: 18 }} />
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
                                                {['Ad Soyad', 'E-posta', 'Çekiliş', 'Tarih'].map((h, i) => (
                                                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontFamily: 'Google Sans, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS[i % COLORS.length], whiteSpace: 'nowrap' }}>{h}</th>
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
            {drawRaffle && <WinnerOverlay participants={drawRaffle.list} raffleName={drawRaffle.raffle.name} raffleId={drawRaffle.raffle.id} onClose={() => setDrawRaffle(null)} onWinnerSaved={() => { setDrawRaffle(null); load(); }} />}

            {toast && (
                <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', border: `1px solid ${toast.type === 'error' ? '#ea4335' : '#34a853'}`, color: toast.type === 'error' ? '#ea4335' : '#34a853', borderRadius: 50, padding: '0.8rem 1.5rem', fontSize: '0.88rem', zIndex: 2000, animation: 'pop 0.3s ease', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {toast.type === 'error' ? '⚠️' : '✓'} {toast.msg}
                </div>
            )}
        </>
    );
}

function RaffleAdminCard({ raffle, count, onEdit, onDelete, onParticipants, onDraw, colorIndex = 0 }) {
    const color = COLORS[colorIndex % COLORS.length];
    return (
        <div
            onMouseEnter={e => e.currentTarget.style.borderColor = color}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${color}25`}
            style={{ background: 'var(--surface)', border: `1px solid ${color}25`, borderRadius: 16, padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', transition: 'border-color 0.2s' }}>
            {raffle.sponsor && <div style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: color }}>{raffle.sponsor}</div>}
            <div style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.05rem', fontWeight: 700 }}>{raffle.name}</div>
            {raffle.description && <div style={{ fontSize: '0.82rem', color: 'var(--muted2)', lineHeight: 1.55 }}>{raffle.description}</div>}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 50, padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: color, width: 'fit-content' }}>
                <GroupIcon sx={{ fontSize: 14 }} /> {count} katılımcı
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={onEdit} style={{ ...btnSmall, flex: 1, background: `${color}12`, color: color, border: `1px solid ${color}30`, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <EditIcon sx={{ fontSize: 14 }} /> Düzenle
                </button>
                <button onClick={onDelete} style={{ ...btnSmall, flex: 1, background: 'transparent', color: '#ea4335', border: '1px solid rgba(234,67,53,0.25)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <DeleteIcon sx={{ fontSize: 14 }} /> Sil
                </button>
            </div>
            <button onClick={onParticipants} style={{ width: '100%', padding: '0.6rem', background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 8, color: color, fontSize: '0.83rem', cursor: 'pointer', fontFamily: 'Google Sans, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <GroupIcon sx={{ fontSize: 16 }} /> Katılımcıları Gör
            </button>
            <button onClick={onDraw} style={{ width: '100%', padding: '0.75rem', background: color, border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Google Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <CasinoIcon sx={{ fontSize: 18 }} /> Çekilişi Başlat
            </button>
        </div>
    );
}

function NavBtn({ children, active, onClick, danger, color = '#4285f4', Icon }) {
    return (
        <button onClick={onClick} style={{ padding: '0.7rem 1rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.9rem', color: danger ? '#ea4335' : active ? color : 'var(--muted2)', background: active ? `${color}15` : 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'Google Sans, sans-serif', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {Icon && <Icon sx={{ fontSize: 18 }} />} {children}
        </button>
    );
}

function StatCard({ label, value, Icon, colorIndex = 0 }) {
    const color = COLORS[colorIndex % COLORS.length];
    return (
        <div style={{ background: 'var(--surface)', border: `2px solid ${color}30`, borderRadius: 16, padding: '1.2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Google Sans, sans-serif', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: color, marginBottom: '0.5rem' }}>
                {Icon && <Icon sx={{ fontSize: 16 }} />} {label}
            </div>
            <div style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '2rem', fontWeight: 700, color: color, letterSpacing: '-0.04em' }}>{value}</div>
        </div>
    );
}

function FormRow({ label, children }) {
    return (
        <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontFamily: 'Google Sans, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.4rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</label>
            {children}
        </div>
    );
}

function Empty({ msg, action }) {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
            <CelebrationIcon sx={{ fontSize: 48, color: 'var(--border2)', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1rem', marginBottom: action ? '1.5rem' : 0 }}>{msg}</p>
            {action}
        </div>
    );
}

const inputSt = { width: '100%', padding: '0.85rem 1rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'Google Sans, sans-serif', fontSize: '0.93rem', outline: 'none', transition: 'border-color 0.2s', marginBottom: 0 };
const btnPrimary = { padding: '0.6rem 1.2rem', background: '#1e1e1e', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'Google Sans, sans-serif', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s' };
const btnOutline = { padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 9, fontFamily: 'Google Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' };
const btnSmall = { padding: '0.5rem 0.85rem', borderRadius: 7, fontFamily: 'Google Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' };
const pageTitleSt = { fontFamily: 'Google Sans, sans-serif', fontSize: 'clamp(1.4rem,4vw,1.8rem)', fontWeight: 700, letterSpacing: '-0.03em' };