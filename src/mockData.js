// Mock data - Firebase yerine localStorage kullanır
// Firebase entegrasyonu için sadece bu dosyayı değiştirmeniz yeterli

const RAFFLES_KEY = 'mock_raffles';
const ENTRIES_KEY = 'mock_entries';

// Başlangıç verileri
const INITIAL_RAFFLES = [
    {
        id: 'r1',
        name: 'Yabancı Dil Kursu',
        description: '3 aylık online İngilizce kursu. Başlangıç ve orta seviye için uygun, haftada 3 gün canlı ders.',
        sponsor: 'LinguaPlus Akademi',
        imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80',
        createdAt: Date.now() - 5000,
    },
    {
        id: 'r2',
        name: 'Profesyonel Fotoğraf Makinesi',
        description: 'Canon EOS R50 aynasız fotoğraf makinesi + 18-45mm kit lens. Vlog ve fotoğrafçılık için mükemmel.',
        sponsor: 'TechStore',
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80',
        createdAt: Date.now() - 4000,
    },
    {
        id: 'r3',
        name: '1 Yıllık Spotify Premium',
        description: 'Reklamsız müzik, offline dinleme ve yüksek kaliteli ses. Aile planı seçeneği de mevcut.',
        sponsor: 'Spotify',
        imageUrl: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=600&q=80',
        createdAt: Date.now() - 3000,
    },
    {
        id: 'r4',
        name: 'UI/UX Tasarım Bootcamp',
        description: 'Figma ile profesyonel arayüz tasarımı. 8 haftalık yoğun program, sertifikalı eğitim.',
        sponsor: 'DesignHub',
        imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
        createdAt: Date.now() - 2000,
    },
    {
        id: 'r5',
        name: 'Mekanik Klavye',
        description: 'Keychron K2 Pro kablosuz mekanik klavye, RGB aydınlatma, Mac ve Windows uyumlu.',
        sponsor: 'Keychron TR',
        imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
        createdAt: Date.now() - 1000,
    },
    {
        id: 'r6',
        name: 'Kişisel Gelişim Kitap Seti',
        description: '10 kitaplık özenle seçilmiş kişisel gelişim ve liderlik kitapları koleksiyonu.',
        sponsor: 'Kitapyurdu',
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
        createdAt: Date.now(),
    },
];

const INITIAL_ENTRIES = [
    { id: 'e1', raffleId: 'r1', raffleName: 'Yabancı Dil Kursu', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', joinedAt: Date.now() - 3600000 },
    { id: 'e2', raffleId: 'r1', raffleName: 'Yabancı Dil Kursu', name: 'Zeynep Kaya', email: 'zeynep@example.com', joinedAt: Date.now() - 7200000 },
    { id: 'e3', raffleId: 'r2', raffleName: 'Profesyonel Fotoğraf Makinesi', name: 'Mehmet Demir', email: 'mehmet@example.com', joinedAt: Date.now() - 1800000 },
    { id: 'e4', raffleId: 'r3', raffleName: '1 Yıllık Spotify Premium', name: 'Ayşe Çelik', email: 'ayse@example.com', joinedAt: Date.now() - 900000 },
    { id: 'e5', raffleId: 'r1', raffleName: 'Yabancı Dil Kursu', name: 'Can Öztürk', email: 'can@example.com', joinedAt: Date.now() - 600000 },
];

function initData() {
    if (!localStorage.getItem(RAFFLES_KEY)) {
        localStorage.setItem(RAFFLES_KEY, JSON.stringify(INITIAL_RAFFLES));
    }
    if (!localStorage.getItem(ENTRIES_KEY)) {
        localStorage.setItem(ENTRIES_KEY, JSON.stringify(INITIAL_ENTRIES));
    }
}

export function getRaffles() {
    initData();
    const data = JSON.parse(localStorage.getItem(RAFFLES_KEY) || '[]');
    return data.sort((a, b) => b.createdAt - a.createdAt);
}

export function getEntries() {
    initData();
    const data = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
    return data.sort((a, b) => b.joinedAt - a.joinedAt);
}

export function addRaffle(data) {
    const raffles = getRaffles();
    const newRaffle = { ...data, id: 'r_' + Date.now(), createdAt: Date.now() };
    raffles.push(newRaffle);
    localStorage.setItem(RAFFLES_KEY, JSON.stringify(raffles));
    return newRaffle;
}

export function updateRaffle(id, data) {
    const raffles = getRaffles();
    const idx = raffles.findIndex(r => r.id === id);
    if (idx !== -1) {
        raffles[idx] = { ...raffles[idx], ...data };
        localStorage.setItem(RAFFLES_KEY, JSON.stringify(raffles));
    }
}

export function deleteRaffle(id) {
    const raffles = getRaffles().filter(r => r.id !== id);
    localStorage.setItem(RAFFLES_KEY, JSON.stringify(raffles));
    const entries = getEntries().filter(e => e.raffleId !== id);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function addEntry(data) {
    const entries = getEntries();
    const newEntry = { ...data, id: 'e_' + Date.now(), joinedAt: Date.now() };
    entries.push(newEntry);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    return newEntry;
}

export function hasEntered(raffleId, email) {
    return getEntries().some(
        e => e.raffleId === raffleId && e.email.toLowerCase() === email.toLowerCase()
    );
}

export function getEntriesForRaffle(raffleId) {
    return getEntries().filter(e => e.raffleId === raffleId);
}

export function getCountMap() {
    const entries = getEntries();
    const map = {};
    entries.forEach(e => { map[e.raffleId] = (map[e.raffleId] || 0) + 1; });
    return map;
}