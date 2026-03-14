import { useState } from 'react';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import LaptopIcon from '@mui/icons-material/Laptop';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PaletteIcon from '@mui/icons-material/Palette';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PublicIcon from '@mui/icons-material/Public';
import FlightIcon from '@mui/icons-material/Flight';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const ICONS = [SchoolIcon, LaptopIcon, MenuBookIcon, PaletteIcon, FitnessCenterIcon, MusicNoteIcon, PublicIcon, FlightIcon, CameraAltIcon, SportsEsportsIcon];
const COLORS = ['#4285f4', '#ea4335', '#34a853', '#f9ab00', '#4285f4', '#34a853', '#ea4335', '#f9ab00', '#4285f4', '#34a853', '#ea4335', '#f9ab00'];

export default function RaffleCard({ raffle, index, count, onJoin }) {
    const [hovered, setHovered] = useState(false);
    const [imgErr, setImgErr] = useState(false);
    const color = COLORS[index % COLORS.length];
    const PlaceholderIcon = ICONS[index % ICONS.length];
    const isCompleted = raffle.status === 'completed' && raffle.winner;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--surface)',
                border: `1px solid ${isCompleted ? 'rgba(52,168,83,0.4)' : hovered ? color : 'var(--border)'}`,
                borderRadius: 20,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.25s ease',
                transform: hovered ? 'translateY(-7px)' : 'translateY(0)',
                boxShadow: hovered ? `0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px ${isCompleted ? 'rgba(52,168,83,0.15)' : color + '30'}` : 'none',
                animation: `fadeUp 0.5s cubic-bezier(.22,1,.36,1) ${index * 0.07}s both`,
                opacity: isCompleted ? 0.92 : 1,
            }}
        >
            {/* Tamamlandı rozeti */}
            {isCompleted && (
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: '#34a853', color: '#fff', borderRadius: 50, padding: '0.25rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'Google Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircleIcon sx={{ fontSize: 13 }} /> Tamamlandı
                </div>
            )}

            <div style={{ position: 'relative' }}>
                {raffle.imageUrl && !imgErr
                    ? <img src={raffle.imageUrl} alt={raffle.name} onError={() => setImgErr(true)}
                        style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block', filter: isCompleted ? 'grayscale(30%)' : 'none' }} />
                    : <div style={{ width: '100%', height: 210, background: isCompleted ? 'linear-gradient(135deg, rgba(52,168,83,0.1), rgba(52,168,83,0.2))' : `linear-gradient(135deg, ${color}15, ${color}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlaceholderIcon sx={{ fontSize: 64, color: isCompleted ? '#34a853' : color, opacity: 0.7 }} />
                    </div>
                }
            </div>

            <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {raffle.sponsor && (
                    <span style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: isCompleted ? '#34a853' : color }}>
                        {raffle.sponsor}
                    </span>
                )}
                <h2 style={{ fontFamily: 'Google Sans, sans-serif', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.02em' }}>{raffle.name}</h2>
                {raffle.description && <p style={{ fontSize: '0.84rem', color: 'var(--muted2)', lineHeight: 1.65, flex: 1 }}>{raffle.description}</p>}

                {/* KAZANAN KUTUSU */}
                {isCompleted && (
                    <div style={{ background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.25)', borderRadius: 12, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem' }}>
                        <EmojiEventsIcon sx={{ fontSize: 24, color: '#f9ab00', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: '0.68rem', fontFamily: 'Google Sans, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#34a853', marginBottom: '0.15rem' }}>Kazanan</div>
                            <div style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{raffle.winner.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted2)' }}>{raffle.winner.email}</div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--muted)', paddingTop: '0.9rem', borderTop: '1px solid var(--border)', marginTop: '0.3rem' }}>
                    <GroupIcon sx={{ fontSize: 15, color: 'var(--muted)' }} />
                    {count} katılımcı
                </div>

                {/* Tamamlandıysa buton gösterme, değilse göster */}
                {isCompleted ? (
                    <div style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#34a853', fontFamily: 'Google Sans, sans-serif', fontSize: '0.88rem', fontWeight: 700 }}>
                        <CheckCircleIcon sx={{ fontSize: 18 }} /> Çekiliş Tamamlandı
                    </div>
                ) : (
                    <button onClick={() => onJoin(raffle)} style={{
                        marginTop: '0.5rem', padding: '0.8rem',
                        background: hovered ? color : `${color}18`,
                        color: hovered ? '#ffffff' : color,
                        border: `1px solid ${color}40`,
                        borderRadius: 10, fontFamily: 'Google Sans, sans-serif', fontSize: '0.88rem', fontWeight: 700,
                        cursor: 'pointer', width: '100%', transition: 'all 0.25s ease', letterSpacing: '0.02em',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    }}>
                        <ConfirmationNumberIcon sx={{ fontSize: 18 }} />
                        Çekilişe Katıl
                    </button>
                )}
            </div>
        </div>
    );
}