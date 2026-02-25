// src/pages/DatabaseBackup.jsx
import { useState, useEffect } from 'react';
import { Database, Download, Trash2, Clock, CheckCircle, Save, Settings, AlertTriangle } from 'lucide-react';
import api from '../api/axios';

export default function DatabaseBackup() {
    const [tables, setTables] = useState([]);
    const [backups, setBackups] = useState([]);
    const [schedule, setSchedule] = useState({ is_active: false, frequency: 'daily', time: '00:00', tables: [] });
    
    // State Manual Backup
    const [selectedManualTables, setSelectedManualTables] = useState([]);
    const [isManualBackingUp, setIsManualBackingUp] = useState(false);
    
    // State Auto Backup
    const [isSavingSchedule, setIsSavingSchedule] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [tablesRes, backupsRes, schedRes] = await Promise.all([
                api.get('/database/tables'),
                api.get('/database/backups'),
                api.get('/database/schedule')
            ]);
            setTables(tablesRes.data.data);
            setBackups(backupsRes.data.data);
            if (schedRes.data.data) {
                setSchedule(schedRes.data.data);
            }
        } catch (error) {
            console.error("Gagal memuat data database");
        }
    };

    // --- MANUAL BACKUP LOGIC ---
    const handleToggleManualTable = (table) => {
        setSelectedManualTables(prev => prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]);
    };

    const handleManualBackup = async () => {
        setIsManualBackingUp(true);
        try {
            // Jika kosong, berarti backup semua
            const payload = selectedManualTables.length > 0 ? { tables: selectedManualTables } : {};
            await api.post('/database/manual-backup', payload);
            alert("Backup Manual Berhasil Dieksekusi!");
            
            // Refresh list file
            const res = await api.get('/database/backups');
            setBackups(res.data.data);
            setSelectedManualTables([]);
        } catch (error) {
            alert("Gagal melakukan backup. Pastikan mysqldump berjalan di server.");
        } finally {
            setIsManualBackingUp(false);
        }
    };

    // --- AUTO BACKUP LOGIC ---
    const handleToggleAutoTable = (table) => {
        let current = schedule.tables || [];
        const updated = current.includes(table) ? current.filter(t => t !== table) : [...current, table];
        setSchedule({ ...schedule, tables: updated });
    };

    const handleSaveSchedule = async () => {
        setIsSavingSchedule(true);
        try {
            await api.post('/database/schedule', schedule);
            alert("Jadwal Backup Otomatis Berhasil Disimpan!");
        } catch (error) {
            alert("Gagal menyimpan jadwal.");
        } finally {
            setIsSavingSchedule(false);
        }
    };

    // --- FILE MANAGEMENT ---
    const handleDownload = async (filename) => {
        try {
            const res = await api.get(`/database/backups/${filename}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) { alert("Gagal mengunduh file."); }
    };

    const handleDelete = async (filename) => {
        if(!window.confirm(`Hapus file backup ${filename}?`)) return;
        try {
            await api.delete(`/database/backups/${filename}`);
            setBackups(backups.filter(b => b.name !== filename));
        } catch (error) { alert("Gagal menghapus file."); }
    };

    return (
        <div className="pb-10 font-sans">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-800 flex items-center"><Database className="w-6 h-6 mr-2 text-primary"/> Database Center (Developer Only)</h1>
                <p className="text-sm text-gray-500">Pusat kendali pencadangan dan pemulihan data aplikasi.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* PANEL KIRI: MANUAL BACKUP */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-500"/> Backup Manual</h3>
                    <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">Pilih tabel tertentu untuk dibackup, atau biarkan kosong untuk membackup <strong className="text-gray-700">seluruh database</strong>.</p>
                    
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-4 custom-scrollbar bg-gray-50/50">
                        {tables.map(table => (
                            <label key={table} className="flex items-center p-2 hover:bg-green-50 cursor-pointer rounded transition">
                                <input type="checkbox" checked={selectedManualTables.includes(table)} onChange={() => handleToggleManualTable(table)} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mr-3" />
                                <span className="text-sm font-medium text-gray-700">{table}</span>
                            </label>
                        ))}
                    </div>
                    
                    <button onClick={handleManualBackup} disabled={isManualBackingUp} className="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-bold shadow-md transition disabled:opacity-50 flex justify-center items-center">
                        {isManualBackingUp ? 'Memproses Database...' : 'Eksekusi Backup Sekarang'}
                    </button>
                </div>

                {/* PANEL KANAN: AUTO SCHEDULE BACKUP */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500"/> Automasi Terjadwal</h3>
                        <label className="flex items-center cursor-pointer relative">
                            <input type="checkbox" className="sr-only peer" checked={schedule.is_active} onChange={e => setSchedule({...schedule, is_active: e.target.checked})} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-bold text-gray-700">{schedule.is_active ? 'Aktif' : 'Mati'}</span>
                        </label>
                    </div>

                    <div className={`transition-opacity ${schedule.is_active ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Frekuensi</label>
                                <select value={schedule.frequency} onChange={e => setSchedule({...schedule, frequency: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm bg-white outline-none">
                                    <option value="daily">Harian</option><option value="weekly">Mingguan</option><option value="monthly">Bulanan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Waktu Eksekusi</label>
                                <input type="time" value={schedule.time} onChange={e => setSchedule({...schedule, time: e.target.value})} className="w-full border p-2.5 rounded-lg text-sm bg-white outline-none" />
                            </div>
                        </div>

                        <label className="block text-xs font-bold text-gray-700 mb-2">Tabel yang Diotomatisasi (Kosong = Semua)</label>
                        <div className="max-h-28 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-4 custom-scrollbar bg-gray-50/50">
                            {tables.map(table => (
                                <label key={`auto_${table}`} className="flex items-center p-1.5 hover:bg-blue-50 cursor-pointer rounded transition">
                                    <input type="checkbox" checked={(schedule.tables || []).includes(table)} onChange={() => handleToggleAutoTable(table)} className="w-4 h-4 text-blue-600 rounded border-gray-300 mr-3" />
                                    <span className="text-sm font-medium text-gray-700">{table}</span>
                                </label>
                            ))}
                        </div>

                        <button onClick={handleSaveSchedule} disabled={isSavingSchedule} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md transition disabled:opacity-50 flex justify-center items-center">
                            {isSavingSchedule ? 'Menyimpan...' : <><Settings className="w-4 h-4 mr-2"/> Simpan Konfigurasi</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* TABEL HASIL BACKUP */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">Arsip File Database (.sql)</h3>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{backups.length} File Tersimpan</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-white border-b border-gray-100 text-xs uppercase text-gray-400 font-bold">
                            <tr><th className="px-6 py-4">Nama File</th><th className="px-6 py-4">Ukuran</th><th className="px-6 py-4">Waktu Dibuat</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {backups.length === 0 ? <tr><td colSpan="4" className="text-center py-10 text-gray-500 italic">Belum ada file backup yang dibuat.</td></tr> : 
                             backups.map((b, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-700 flex items-center"><Database className="w-4 h-4 mr-2 text-primary"/>{b.name}</td>
                                    <td className="px-6 py-4 font-medium">{b.size}</td>
                                    <td className="px-6 py-4">{b.time}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleDownload(b.name)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition" title="Download SQL"><Download className="w-4 h-4"/></button>
                                            <button onClick={() => handleDelete(b.name)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition" title="Hapus Permanen"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}