// src/pages/ManajemenPengguna.jsx
import { useState, useEffect } from 'react';
import { UserCog, Plus, Search, Edit, Trash2, X, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import api from '../api/axios';

export default function ManajemenPengguna() {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // State Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Data user yang sedang login (untuk proteksi hapus diri sendiri)
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: 'remaja', password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users'); 
            setUsersList(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data user", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        setEditId(null);
        setFormData({ name: '', email: '', phone: '', role: 'remaja', password: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            password: '' // Kosongkan agar tidak terubah jika tidak diisi
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Yakin ingin menghapus akses untuk ${name}? Semua data yang terkait mungkin akan terpengaruh.`)) return;

        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
            alert("Pengguna berhasil dihapus!");
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menghapus pengguna.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            if (editId) {
                await api.put(`/users/${editId}`, formData);
                alert("Data pengguna berhasil diperbarui!");
            } else {
                await api.post('/users', formData);
                alert("Pengguna baru berhasil ditambahkan!");
            }
            
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const filteredUsers = usersList.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Visual Role Badge
    const getRoleBadge = (role) => {
        switch (role) {
            case 'developer':
                return <span className="flex items-center text-purple-700 bg-purple-100 px-2 py-1 rounded-md text-xs font-bold"><ShieldAlert className="w-3 h-3 mr-1"/> Developer</span>;
            case 'panitia':
                return <span className="flex items-center text-blue-700 bg-blue-100 px-2 py-1 rounded-md text-xs font-bold"><ShieldCheck className="w-3 h-3 mr-1"/> Panitia</span>;
            case 'remaja':
                return <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-bold"><User className="w-3 h-3 mr-1"/> Remaja</span>;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
                    <p className="text-sm text-gray-500">Kelola akses akun Panitia dan Remaja Masjid.</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition whitespace-nowrap font-medium text-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pengguna
                </button>
            </div>

            {/* Tabel Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari nama atau email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-white" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Nama Lengkap</th>
                                <th className="px-6 py-3">Kontak (Email / WA)</th>
                                <th className="px-6 py-3 text-center">Hak Akses (Role)</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">Memuat data pengguna...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">Pengguna tidak ditemukan.</td></tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {u.name}
                                            {u.id === currentUser.id && <span className="ml-2 text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Anda</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-700">{u.email}</div>
                                            <div className="text-xs text-gray-500">{u.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center flex justify-center mt-1">
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleEdit(u)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" title="Edit Akun">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {/* Disable tombol hapus jika itu adalah akun sendiri */}
                                                <button 
                                                    onClick={() => handleDelete(u.id, u.name)} 
                                                    disabled={u.id === currentUser.id}
                                                    className={`p-1.5 rounded transition ${u.id === currentUser.id ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`} 
                                                    title={u.id === currentUser.id ? "Tidak bisa hapus diri sendiri" : "Hapus Akun"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM TAMBAH / EDIT PENGGUNA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {editId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Contoh: Ahmad Rizki" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Untuk Login) <span className="text-red-500">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="email@masjid.com" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                                        <input type="number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="0812..." className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hak Akses (Role) <span className="text-red-500">*</span></label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white" required>
                                        <option value="remaja">Remaja Masjid (Konten, Inventaris, Lapangan)</option>
                                        <option value="panitia">Panitia / Bendahara (Akses Keuangan & Zakat)</option>
                                        <option value="developer">Developer (Akses Pengaturan & Pengguna)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password {editId ? <span className="text-gray-400 font-normal">(Kosongkan jika tidak ingin diubah)</span> : <span className="text-red-500">*</span>}
                                    </label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleInputChange} 
                                        required={!editId} // Wajib diisi hanya saat tambah baru
                                        minLength="6"
                                        placeholder="Minimal 6 karakter" 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" 
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">Batal</button>
                            <button type="submit" form="userForm" disabled={submitLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary transition font-medium text-sm flex items-center disabled:opacity-50 shadow-sm">
                                {submitLoading ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Buat Akun')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}