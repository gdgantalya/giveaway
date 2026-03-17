import { db } from './firebase';
import {
    collection, getDocs, addDoc, deleteDoc, updateDoc,
    doc, query, where, orderBy
} from 'firebase/firestore';

// ── RAFFLES ──────────────────────────────────────────

export async function getRaffles() {
    const snap = await getDocs(query(collection(db, 'raffles'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addRaffle(data) {
    const ref = await addDoc(collection(db, 'raffles'), {
        ...data,
        isActive: true,
        createdAt: new Date(),
    });
    return { id: ref.id, ...data };
}

export async function updateRaffle(id, data) {
    await updateDoc(doc(db, 'raffles', id), data);
}

export async function deleteRaffle(id) {
    // Önce bağlı entry'leri sil, sonra raffle'ı sil
    const snap = await getDocs(query(collection(db, 'entries'), where('raffleId', '==', id)));
    await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'entries', d.id))));
    await deleteDoc(doc(db, 'raffles', id));
}

export async function toggleRaffleActive(id, isActive) {
    await updateDoc(doc(db, 'raffles', id), { isActive });
}

// ── ENTRIES ──────────────────────────────────────────

export async function getEntries() {
    const snap = await getDocs(query(collection(db, 'entries'), orderBy('joinedAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getEntriesForRaffle(raffleId) {
    const snap = await getDocs(query(collection(db, 'entries'), where('raffleId', '==', raffleId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCountMap() {
    const snap = await getDocs(collection(db, 'entries'));
    const map = {};
    snap.docs.forEach(d => {
        const raffleId = d.data().raffleId;
        map[raffleId] = (map[raffleId] || 0) + 1;
    });
    return map;
}

export async function addEntry(data) {
    const ref = await addDoc(collection(db, 'entries'), {
        ...data,
        joinedAt: new Date(),
    });
    return { id: ref.id, ...data };
}

export async function hasEntered(raffleId, email) {
    const snap = await getDocs(query(
        collection(db, 'entries'),
        where('raffleId', '==', raffleId),
        where('email', '==', email.toLowerCase().trim())
    ));
    return !snap.empty;
}

// ── WINNER ───────────────────────────────────────────

export async function saveWinner(raffleId, winner) {
    await updateDoc(doc(db, 'raffles', raffleId), {
        winner: { name: winner.name, email: winner.email },
        completedAt: new Date(),
        status: 'completed',
    });
}

export async function clearWinner(raffleId) {
    await updateDoc(doc(db, 'raffles', raffleId), {
        winner: null,
        completedAt: null,
        status: 'active',
    });
}

// ── ATTENDEES (E-posta Whitelist) ────────────────────

export async function getAttendees() {
    const snap = await getDocs(collection(db, 'attendees'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addAttendees(emails) {
    const col = collection(db, 'attendees');
    await Promise.all(emails.map(email =>
        addDoc(col, { email: email.toLowerCase().trim() })
    ));
}

export async function clearAttendees() {
    const snap = await getDocs(collection(db, 'attendees'));
    await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'attendees', d.id))));
}

export async function isAttendee(email) {
    const snap = await getDocs(query(
        collection(db, 'attendees'),
        where('email', '==', email.toLowerCase().trim())
    ));
    return !snap.empty;
}