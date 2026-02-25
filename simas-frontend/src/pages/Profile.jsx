import { useState, useRef } from 'react';
import { Camera, User, Save } from 'lucide-react';
import api from '../api/axios';

export default function Profile() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `http://47.236.145.121/storage/${user.avatar}` : null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (password) formData.append('password', password);
        if (avatar) formData.append('avatar', avatar);
        
        // Laravel butuh method spoofing untuk PUT dengan FormData
        formData.append('_method', 'PUT');

        try {
            // Tembak API update profile (Bisa menggunakan POST karena method spoofing)
            const res = await api.post('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Simpan data user terbaru ke localStorage
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            alert("Profil berhasil diperbarui!");
            window.location.reload(); // Refresh agar foto di header berubah
        } catch (error) {
            alert(error.response?.data?.message || "Gagal memperbarui profil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Pengaturan Profil</h2>
            
            <form onSubmit={handleUpdate} className="space-y-6">
                {/* Upload Foto */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden group">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-16 h-16 text-gray-400 m-auto mt-7" />
                        )}
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition"
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="text-sm font-bold text-primary mt-3 hover:underline">Ubah Foto Profil</button>
                </div>

                {/* Input Text */}
                <div><label className="block text-sm font-bold mb-1">Nama Lengkap</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary" /></div>
                <div><label className="block text-sm font-bold mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary" /></div>
                <div><label className="block text-sm font-bold mb-1">Password Baru <span className="text-gray-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span></label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary" /></div>

                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary transition flex justify-center items-center">
                    {loading ? 'Menyimpan...' : <><Save className="w-5 h-5 mr-2"/> Simpan Perubahan</>}
                </button>
            </form>
        </div>
    );
}