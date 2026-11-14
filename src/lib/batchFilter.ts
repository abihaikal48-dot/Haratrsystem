import { OnboardingBatch } from '../types';

export interface BatchFilterableRecord {
  id?: string;
  tanggal?: string;
  created_at?: string;
  batch_id?: string;
  nama_batch?: string;
  batch_name?: string;
  kru_id?: string;
  nama_kru?: string;
  kru_nama?: string;
  anggota_kru_ids?: string[];
  anggota_kru_nama?: string[];
}

const normalizeText = (val?: string | null): string =>
  (val || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();

const extractYMD = (tanggal?: string, createdAt?: string): string => {
  const raw = (tanggal || createdAt || '').trim();
  if (!raw) return '';
  const match = raw.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
};

const isGenericOrEmptyBatchId = (batchId?: string): boolean => {
  const n = normalizeText(batchId);
  return !n || n === 'all' || n === 'umum' || n === 'onboarding umum';
};

/**
 * Mencocokkan rekaman penilaian terhadap Batch Onboarding terpilih
 * menggunakan kombinasi: ID/Nama Batch, Rentang Tanggal Pelaksanaan, dan Daftar Peserta Batch.
 */
export function matchesSelectedBatch(
  item: BatchFilterableRecord,
  selectedBatchId: string,
  batches: OnboardingBatch[]
): boolean {
  if (!selectedBatchId || selectedBatchId === 'ALL') {
    return true;
  }

  const selectedBatch = batches.find(
    (b) =>
      b.id === selectedBatchId ||
      normalizeText(b.nama_batch) === normalizeText(selectedBatchId) ||
      normalizeText(b.nomor_batch) === normalizeText(selectedBatchId)
  );

  const itemBatchId = (item.batch_id || '').trim();
  const itemBatchName = normalizeText(item.nama_batch || item.batch_name);

  if (!selectedBatch) {
    return (
      itemBatchId === selectedBatchId ||
      itemBatchName === normalizeText(selectedBatchId)
    );
  }

  const targetId = selectedBatch.id;
  const targetName = normalizeText(selectedBatch.nama_batch);
  const targetNomor = normalizeText(selectedBatch.nomor_batch);

  // 1. Kecocokan langsung ID batch
  if (itemBatchId && itemBatchId === targetId) {
    return true;
  }

  // 2. Kecocokan nama / nomor batch (jika cukup spesifik)
  if (itemBatchName) {
    if (
      itemBatchName === targetName ||
      (targetNomor && (itemBatchName === targetNomor || itemBatchName.includes(targetNomor))) ||
      (targetName && itemBatchName.includes(targetName))
    ) {
      return true;
    }
  }

  // Cek apakah item secara eksplisit menunjuk ke batch lain yang valid
  const explicitOtherBatch = itemBatchId
    ? batches.find((b) => b.id === itemBatchId && b.id !== targetId)
    : undefined;

  // 3. Cek rentang tanggal pelaksanaan batch
  const itemDateYMD = extractYMD(item.tanggal, item.created_at);
  const inDateRange = Boolean(
    itemDateYMD &&
      selectedBatch.tanggal_mulai &&
      selectedBatch.tanggal_selesai &&
      itemDateYMD >= selectedBatch.tanggal_mulai &&
      itemDateYMD <= selectedBatch.tanggal_selesai
  );

  // 4. Cek keanggotaan peserta dalam batch terpilih
  const pesertaList = Array.isArray(selectedBatch.peserta) ? selectedBatch.peserta : [];
  const pesertaIds = new Set(
    pesertaList.map((p) => (p.kru_id || '').trim()).filter(Boolean)
  );
  const pesertaNames = new Set(
    pesertaList.map((p) => normalizeText(p.nama_kru)).filter(Boolean)
  );

  const itemKruId = (item.kru_id || '').trim();
  const itemKruName = normalizeText(item.nama_kru || item.kru_nama);

  let inSelectedParticipants = false;
  if (itemKruId && pesertaIds.has(itemKruId)) {
    inSelectedParticipants = true;
  } else if (itemKruName && pesertaNames.has(itemKruName)) {
    inSelectedParticipants = true;
  } else if (Array.isArray(item.anggota_kru_ids) && item.anggota_kru_ids.some((id) => pesertaIds.has(id))) {
    inSelectedParticipants = true;
  } else if (
    Array.isArray(item.anggota_kru_nama) &&
    item.anggota_kru_nama.some((n) => pesertaNames.has(normalizeText(n)))
  ) {
    inSelectedParticipants = true;
  }

  // Jika item memiliki batch_id milik batch lain secara eksplisit:
  // hanya lolos jika BOTH tanggal dan peserta cocok dengan batch terpilih (kasus rekaman salah default batch saat input)
  if (explicitOtherBatch) {
    return inDateRange && inSelectedParticipants;
  }

  // Jika batch_id kosong / generik / tidak terikat ke batch lain:
  if (isGenericOrEmptyBatchId(itemBatchId) || !explicitOtherBatch) {
    // Jika tanggal masuk rentang batch terpilih -> cocok
    if (inDateRange) {
      return true;
    }

    // Jika peserta terdaftar di batch terpilih dan tanggalnya tidak masuk ke rentang eksklusif batch lain
    if (inSelectedParticipants) {
      if (!itemDateYMD) return true;
      const belongsToDifferentBatchDate = batches.some(
        (b) =>
          b.id !== targetId &&
          b.tanggal_mulai &&
          b.tanggal_selesai &&
          itemDateYMD >= b.tanggal_mulai &&
          itemDateYMD <= b.tanggal_selesai
      );
      if (!belongsToDifferentBatchDate) {
        return true;
      }
    }
  }

  return false;
}
