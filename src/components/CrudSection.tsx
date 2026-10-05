import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Plus, Edit3, Trash2, Download, ChevronLeft, ChevronRight,
  X, AlertTriangle, CheckCircle2, Filter, ArrowUpDown, Sparkles, RefreshCw,
  Power, Save, Flame
} from 'lucide-react';
import { db } from '../lib/storage';
import { ModernOptionSelector } from './ModernOptionSelector';

export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'date' | 'arrayLines';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
}

export interface ColumnDef {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface CrudSectionProps {
  table: string;
  title: string;
  icon?: string | React.ReactNode;
  description?: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  filterOutletCode?: string;
  onDataChanged?: () => void;
  customActions?: (row: any) => React.ReactNode;
}

export const CrudSection: React.FC<CrudSectionProps> = ({
  table,
  title,
  icon,
  description,
  columns,
  fields,
  filterOutletCode,
  onDataChanged,
  customActions,
}) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const pageSize = 8;

  const loadData = useCallback(() => {
    setLoading(true);
    const data = db.getTable<any>(table);
    setRows(data);
    setLoading(false);
    if (onDataChanged) onDataChanged();
  }, [table, onDataChanged]);

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(table, loadData);
    return () => unsub();
  }, [loadData, table]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const openAdd = () => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        initial[f.name] = f.defaultValue;
      } else if (f.type === 'select') {
        initial[f.name] = f.options?.[0] ?? '';
      } else if (f.type === 'date') {
        initial[f.name] = new Date().toISOString().slice(0, 10);
      } else {
        initial[f.name] = '';
      }
    });

    // Preset outlet if filtered
    if (filterOutletCode && filterOutletCode !== 'ALL' && fields.some((f) => f.name === 'kode_outlet')) {
      initial['kode_outlet'] = filterOutletCode;
    }

    setForm(initial);
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === 'arrayLines') {
        initial[f.name] = Array.isArray(row[f.name]) ? row[f.name].join('\n') : (row[f.name] || '');
      } else {
        initial[f.name] = row[f.name] ?? '';
      }
    });
    setForm(initial);
    setEditId(row.id);
    setModalOpen(true);
  };

  const save = () => {
    const payload: Record<string, any> = {};
    for (const f of fields) {
      if (f.required && !form[f.name]) {
        alert(`Harap lengkapi kolom "${f.label}"`);
        return;
      }
      if (f.type === 'arrayLines') {
        payload[f.name] = String(form[f.name] || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === 'number') {
        payload[f.name] = Number(form[f.name]) || 0;
      } else {
        payload[f.name] = form[f.name];
      }
    }

    if (editId) {
      db.updateRow(table, editId, payload);
      showToast('Data berhasil diperbarui!');
    } else {
      db.insertRow(table, payload);
      showToast('Data baru berhasil disimpan!');
    }

    setModalOpen(false);
    loadData();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    db.deleteRow(table, deleteId);
    setDeleteId(null);
    showToast('Data berhasil dihapus!');
    loadData();
  };

  const toggleActive = (row: any) => {
    if (!('status_aktif' in row)) return;
    const next = row.status_aktif === 'Aktif' ? 'Nonaktif' : 'Aktif';
    db.updateRow(table, row.id, { status_aktif: next });
    loadData();
  };

  // Filter & Search
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // Outlet filter
      if (filterOutletCode && filterOutletCode !== 'ALL' && 'kode_outlet' in r) {
        if (r.kode_outlet !== filterOutletCode) return false;
      }
      // Text search
      if (!search.trim()) return true;
      const haystack = JSON.stringify(r).toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [rows, filterOutletCode, search]);

  // Sort
  const sortedRows = useMemo(() => {
    if (!sortCol) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortCol] ?? '';
      const valB = b[sortCol] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRows, sortCol, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colKey);
      setSortAsc(true);
    }
  };

  const exportCSV = () => {
    if (!rows.length) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    const keys = columns.map((c) => c.key);
    let csv = '\uFEFF' + columns.map((c) => `"${c.label}"`).join(',') + '\n';
    filteredRows.forEach((r) => {
      csv +=
        keys
          .map((k) => {
            const raw = Array.isArray(r[k]) ? r[k].join('; ') : String(r[k] ?? '');
            return `"${raw.replace(/"/g, '""')}"`;
          })
          .join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Export_${table}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File CSV berhasil diunduh!');
  };

  const renderBadge = (key: string, val: any) => {
    const s = String(val ?? '-');
    if (key === 'status_aktif' || key === 'status') {
      if (s === 'Aktif' || s === 'Selesai') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">● {s}</span>;
      }
      if (s === 'Direncanakan' || s === 'Proses' || s === 'Dalam kajian') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">● {s}</span>;
      }
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600">● {s}</span>;
    }
    if (key === 'prioritas') {
      if (s === 'Tinggi') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><Flame size={12} className="text-rose-600" /> <span>Tinggi</span></span>;
      if (s === 'Sedang') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Sedang</span>;
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600">Rendah</span>;
    }
    if (key === 'hasil') {
      if (s === 'Sesuai Standar') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={12} className="text-emerald-600" /> <span>Sesuai Standar</span></span>;
      if (s === 'Perlu Perbaikan') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200"><AlertTriangle size={12} className="text-amber-600" /> <span>Perlu Perbaikan</span></span>;
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">{s}</span>;
    }
    if (key === 'divisi') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {s}
        </span>
      );
    }
    return s;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-4 sm:p-5 space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-800 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-sm shadow-2xs text-[#96171B]">
              {icon}
            </div>
          )}
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredRows.length} Data
              </span>
            </h2>
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input
              className="w-full bg-[#FAF9F7] border border-slate-200/90 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
              placeholder="Cari entri data..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <button
            onClick={exportCSV}
            title="Ekspor Data ke CSV"
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download size={13} />
            <span className="hidden md:inline text-xs">CSV</span>
          </button>

          <button
            onClick={openAdd}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.99] shrink-0"
          >
            <Plus size={14} />
            <span className="text-xs">Tambah</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-[#96171B]" size={20} />
          <span>Memuat data...</span>
        </div>
      ) : !filteredRows.length ? (
        <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          Tidak ada data ditemukan untuk kriteria pencarian saat ini.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/90">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-600 font-bold text-[10.5px] uppercase tracking-wider border-b border-slate-200/90">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => handleSort(c.key)}
                    className="py-2.5 px-3.5 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{c.label}</span>
                      <ArrowUpDown size={11} className="text-slate-400" />
                    </div>
                  </th>
                ))}
                <th className="py-2.5 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className="py-2.5 px-3.5 align-middle font-medium text-slate-800 text-xs">
                      {c.render ? (
                        c.render(r[c.key], r)
                      ) : Array.isArray(r[c.key]) ? (
                        <div className="max-w-xs truncate" title={r[c.key].join(', ')}>
                          {r[c.key].join(', ')}
                        </div>
                      ) : (
                        renderBadge(c.key, r[c.key])
                      )}
                    </td>
                  ))}
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap align-middle">
                    <div className="flex items-center justify-end gap-1">
                      {customActions && customActions(r)}

                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit Data"
                      >
                        <Edit3 size={13} />
                      </button>

                      {'status_aktif' in r && (
                        <button
                          onClick={() => toggleActive(r)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            r.status_aktif === 'Aktif'
                              ? 'hover:bg-rose-50 text-rose-600'
                              : 'hover:bg-emerald-50 text-emerald-600'
                          }`}
                          title={`Ubah Status (Saat ini: ${r.status_aktif})`}
                        >
                          <Power size={13} />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Data"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            Halaman <b>{currentPage}</b> dari <b>{totalPages}</b> ({filteredRows.length} entri)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={13} />
              <span>Sebelumnya</span>
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Form Edit / Add Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl p-6 w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-xl space-y-4 animate-in fade-in zoom-in-95 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span>{editId ? 'Edit' : 'Tambah'} {title}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>

                  {f.type === 'select' ? (
                    <ModernOptionSelector
                      value={form[f.name] || ''}
                      onChange={(val) => setForm({ ...form, [f.name]: val })}
                      options={f.options || []}
                      placeholder={`-- Pilih ${f.label} --`}
                      size="sm"
                    />
                  ) : f.type === 'textarea' || f.type === 'arrayLines' ? (
                    <textarea
                      className="w-full bg-[#FAF9F7] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
                      rows={f.type === 'arrayLines' ? 3 : 2.5}
                      placeholder={f.type === 'arrayLines' ? 'Tuliskan satu item per baris...' : f.placeholder}
                      value={form[f.name] || ''}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  ) : (
                    <input
                      className="w-full bg-[#FAF9F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      placeholder={f.placeholder}
                      value={form[f.name] || ''}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                onClick={save}
              >
                <Save size={13} />
                <span>Simpan Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 w-full max-w-sm text-center shadow-xl space-y-4 animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Konfirmasi Hapus Data</h4>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                onClick={() => setDeleteId(null)}
              >
                Batal
              </button>
              <button
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                onClick={confirmDelete}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
