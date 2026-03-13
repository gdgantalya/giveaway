export default function ParticipantsModal({ raffle, participants, onClose }) {
    if (!raffle) return null;

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column', animation: 'pop 0.3s cubic-bezier(.34,1.56,.64,1)' }}>

                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                    <div>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', fontWeight: 700 }}>{raffle.name}</h3>
                        <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{participants.length} katılımcı</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--surface2)', border: 'none', color: 'var(--muted2)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>✕</button>
                </div>

                {/* Table */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {participants.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}></div>
                            <p>Henüz katılımcı yok</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['#', 'Ad Soyad', 'E-posta', 'Tarih'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontFamily: 'Syne, sans-serif', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, i) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--muted)', fontSize: '0.78rem' }}>{i + 1}</td>
                                        <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.88rem', fontWeight: 500 }}>{p.name}</td>
                                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--muted2)', fontSize: '0.83rem' }}>{p.email}</td>
                                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--muted)', fontSize: '0.78rem' }}>
                                            {new Date(p.joinedAt).toLocaleDateString('tr-TR')}
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