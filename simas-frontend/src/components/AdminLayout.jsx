// src/components/AdminLayout.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Users, Newspaper, Package, LogOut, Menu, HandHeart } from 'lucide-react';
import api from '../api/axios';
import { Settings, UserCog } from 'lucide-react';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
            navigate('/'); // Usir ke halaman login jika belum login
        } else {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.log(error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    if (!user) return null;

    // RBAC: Menentukan menu berdasarkan Role
    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['developer', 'panitia', 'remaja'] },
        { title: 'Manajemen Pengguna', icon: UserCog, path: '/pengguna', roles: ['developer'] },
        { title: 'Keuangan', icon: Wallet, path: '/keuangan', roles: ['developer', 'panitia'] },
        
        { title: 'Agenda', icon: Newspaper, path: '/agenda', roles: ['developer', 'panitia'] },
        { 
            title: user.role === 'remaja' ? 'Tugas Penyaluran' : 'Manajemen Zakat', 
            icon: HandHeart, 
            path: '/zakat', 
            roles: ['developer', 'panitia', 'remaja'] 
        },
        
        { title: 'Manajemen Berita', icon: Newspaper, path: '/berita', roles: ['developer', 'panitia', 'remaja'] },
        { title: 'Inventaris', icon: Package, path: '/inventaris', roles: ['developer', 'panitia', 'remaja'] },
        { title: 'Pengaturan Kas', icon: Settings, path: '/pengaturan-keuangan', roles: ['developer', 'panitia'] },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r shadow-sm transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b flex items-center justify-between">
                    {isSidebarOpen && <span className="font-bold text-primary text-xl tracking-tight">SIMAS</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        // Sembunyikan menu jika role user tidak ada di array 'roles'
                        if (!item.roles.includes(user.role)) return null;

                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} 
                                className={`flex items-center space-x-3 p-3 rounded-lg transition ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <item.icon className="w-5 h-5" />
                                {isSidebarOpen && <span className="font-medium">{item.title}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="flex items-center space-x-3 p-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition">
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="font-medium">Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b shadow-sm p-4 flex justify-end items-center">
                    <div className="text-right mr-3">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                    </div>
                </header>
                
                {/* Dinamis Konten (Outlet) */}
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
}