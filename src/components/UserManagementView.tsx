import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Shield, Plus, Edit3, Trash2,
  CheckCircle2, Key, RefreshCw, Sparkles, Mail, Lock, User
} from 'lucide-react';
import { db } from '../lib/storage';
import { AppUser, UserRole } from '../types';
import { PageHeaderBanner } from './PageHeaderBanner';
import { ModernOptionSelector } from './ModernOptionSelector';

export const UserManagementView: React.FC<{ currentUser: AppUser; onUserChanged: () => void }> = ({
  currentUser,
  onUserChanged,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{ nama: string; email: string; role: UserRole; status_aktif: 'Aktif' | 'Nonaktif' }>({
    nama: '',
    email: '',
    role: 'Trainer',
    status_aktif: 'Aktif',
  });

  const loadData = () => {
    setUsers(db.getTable<AppUser>('app_users'));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('app_users', loadData);
    return () => unsub();
  }, []);

  const openAdd = () => {
    setForm({ nama: '', email: '', role: 'Trainer', status_aktif: 'Aktif' });
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setForm({ nama: user.nama, email: user.email, role: user.role, status_aktif: user.status_aktif });
    setEditId(user.id);
    setModalOpen(true);
  };

  const save = () => {
    if (!form.nama.trim() || !form.email.trim()) {
      alert('Lengkapi nama dan email pengguna!');
      return;
    }

    if (editId) {
      db.updateRow('app_users', editId, form);
      db.addLog('UBAH', 'User Management', `Data pengguna ${form.nama} diperbarui.`);
    } else {
      db.insertRow('app_users', form);
      db.addLog('TAMBAH', 'User Management', `User baru ${form.nama} (${form.role}) ditambahkan.`);
    }
    setModalOpen(false);
    loadData();
  };

  const switchUser = (user: AppUser) => {
    db.setCurrentUser(user);
    db.addLog('UBAH', 'User Management', `Beralih sesi aktif ke user ${user.nama}.`);
    onUserChanged();
  };

  const deleteUser = (id: string, nama: string) => {
    if (users.length <= 1) {
      alert('Tidak dapat menghapus user terakhir dalam sistem.');
      return;
    }
    if (confirm(`Hapus akun user "${nama}" dari sistem?`)) {
      db.deleteRow('app_users', id);
      db.addLog('HAPUS', 'User Management', `Akun user ${nama} dihapus.`);
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Unified Minimalist Page Header */}
      <PageHeaderBanner
        category="SISTEM & HAK AKSES"
        title="Manajemen Pengguna & Otoritas"
        description="Kelola akun pengguna, peran otorisasi tim (Admin HQ, Lead Trainer, Area Supervisor, Kepala Outlet, SPV Rekrutmen), dan pergantian sesi aktif."
        icon={<Shield size={22} />}
        rightElement={
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Plus size={15} />
            <span>Tambah Pengguna</span>
          </button>
        }
      />

      {/* User Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isCurrent = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 space-y-4 relative ${
                isCurrent
                  ? 'border-[#96171B]/50 ring-2 ring-[#96171B]/15 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              {isCurrent && (
                <span className="absolute top-4 right-4 text-[9.5px] bg-[#96171B] text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  SESI AKTIF
                </span>
              )}

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-2xs">
                  {u.nama.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden pr-8">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{u.nama}</h3>
                  <div className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail size={12} className="shrink-0" />
                    <span>{u.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80">
                  {u.role}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.status_aktif === 'Aktif'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  ● {u.status_aktif}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {!isCurrent ? (
                  <button
                    type="button"
                    onClick={() => switchUser(u)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Key size={13} />
                    <span>Beralih Akun</span>
                  </button>
                ) : (
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Sedang Digunakan</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(u)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Profil"
                  >
                    <Edit3 size={14} />
                  </button>
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => deleteUser(u.id, u.nama)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Akun"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Lengkap *</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="contoh: Haikal Abi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#96171B]/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Alamat Email Kerja *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contoh: haikal.abi@harachicken.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#96171B]/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Peran / Role Otoritas *</label>
                <ModernOptionSelector
                  value={form.role}
                  onChange={(val) => setForm({ ...form, role: (val as UserRole) || 'Trainer' })}
                  options={[
                    { value: 'Admin', label: 'Admin (Akses Penuh Semua Fitur)' },
                    { value: 'Trainer', label: 'Trainer (Kurikulum & Penilaian Kompetensi)' },
                    { value: 'Area Supervisor', label: 'Area Supervisor (Audit & Monitoring Wilayah)' },
                    { value: 'Kepala Outlet', label: 'Kepala Outlet (Operasional Cabang)' },
                    { value: 'SPV Rekrutmen', label: 'SPV Rekrutmen (Talent Tracker & Penempatan Kru)' },
                  ]}
                  inlineChips={false}
                  size="sm"
                  clearable={false}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status Akun *</label>
                <ModernOptionSelector
                  value={form.status_aktif}
                  onChange={(val) => setForm({ ...form, status_aktif: (val as 'Aktif' | 'Nonaktif') || 'Aktif' })}
                  options={[
                    { value: 'Aktif', label: 'Aktif' },
                    { value: 'Nonaktif', label: 'Nonaktif' },
                  ]}
                  inlineChips={false}
                  size="sm"
                  clearable={false}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={save}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white cursor-pointer shadow-xs"
              >
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
