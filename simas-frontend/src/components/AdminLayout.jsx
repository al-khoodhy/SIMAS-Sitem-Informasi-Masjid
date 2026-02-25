// src/components/AdminLayout.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Wallet, 
    Newspaper, 
    Package, 
    LogOut, 
    Menu, 
    HandHeart, 
    BookOpen, 
    HandCoins, 
    Settings, 
    UserCog, 
    User, 
    Image,
    BadgeCheck,
    CalendarDays,
    Users,
    Megaphone
} from 'lucide-react';
import api from '../api/axios';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
            navigate('/');
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

        // =========================
        // DASHBOARD
        // =========================
        { 
            title: 'Dashboard', 
            icon: LayoutDashboard, 
            path: '/dashboard', 
            roles: ['developer', 'panitia', 'remaja'] 
        },
    
        // =========================
        // OPERASIONAL
        // =========================
        { 
            title: user.role === 'remaja' ? 'Tugas Penyaluran' : 'Manajemen Zakat',
            icon: HandHeart, 
            path: '/zakat', 
            roles: ['developer', 'panitia', 'remaja'] 
        },
        { 
            title: 'Data Muzakki', 
            icon: HandCoins, 
            path: '/muzakki', 
            roles: ['developer', 'panitia', 'remaja'] 
        },
        { 
            title: 'Verifikasi Donasi', 
            icon: BadgeCheck, 
            path: '/verifikasi-donasi', 
            roles: ['developer', 'panitia'] 
        },
        { 
            title: 'Keuangan', 
            icon: Wallet, 
            path: '/keuangan', 
            roles: ['developer', 'panitia'] 
        },
    
        // =========================
        // DATA & ASET
        // =========================
        { 
            title: 'Inventaris', 
            icon: Package, 
            path: '/inventaris', 
            roles: ['developer', 'panitia', 'remaja'] 
        },
        { 
            title: 'E-Library', 
            icon: BookOpen, 
            path: '/manajemen-buku', 
            roles: ['developer', 'panitia'] 
        },
    
        // =========================
        // PUBLIKASI
        // =========================
        { 
            title: 'Agenda', 
            icon: CalendarDays, 
            path: '/agenda', 
            roles: ['developer', 'panitia'] 
        },
        { 
            title: 'Manajemen Berita', 
            icon: Newspaper, 
            path: '/berita', 
            roles: ['developer', 'panitia', 'remaja'] 
        },
        { 
            title: 'Manajemen Galeri', 
            icon: Image, 
            path: '/manajemen-galeri', 
            roles: ['developer', 'panitia'] 
        },
    
        // =========================
        // ADMINISTRASI
        // =========================
        { 
            title: 'Manajemen Pengguna', 
            icon: Users, 
            path: '/pengguna', 
            roles: ['developer'] 
        },
        { 
            title: 'Backup Database', 
            icon: Megaphone, 
            path: '/backup-database', 
            roles: ['developer'] 
        },
        { 
            title: 'Pengaturan Sistem', 
            icon: Settings, 
            path: '/pengaturan-keuangan', 
            roles: ['developer', 'panitia'] 
        },
    
        // =========================
        // PROFIL
        // =========================
        { 
            title: 'Profil Saya', 
            icon: User, 
            path: '/profile', 
            roles: ['developer', 'panitia', 'remaja'] 
        },
                // =========================
        // PROFIL
        // =========================
        { 
            title: 'Pengumuman', 
            icon: Megaphone, 
            path: '/manajemen-pengumuman', 
            roles: ['developer', 'panitia', 'remaja'] 
        },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col z-20`}>
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    {isSidebarOpen && <span className="font-extrabold text-primary text-2xl tracking-tight">SIMAS</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        // Sembunyikan menu jika role user tidak ada di array 'roles'
                        if (!item.roles.includes(user.role)) return null;

                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} 
                                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold' : 'text-gray-600 hover:bg-green-50 hover:text-primary font-medium'}`}>
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                {isSidebarOpen && <span>{item.title}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center justify-center space-x-3 p-3 w-full rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition font-bold">
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
                {/* Header (Top Bar) */}
                <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex justify-between items-center z-10">
                    <div className="text-gray-500 font-medium text-sm hidden md:block">
                        {/* Menampilkan tanggal hari ini */}
                        {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                    </div>

                    {/* Area Profil (Bisa diklik menuju pengaturan profil) */}
                    <Link to="/profile" className="flex items-center hover:bg-gray-50 p-2 rounded-xl transition cursor-pointer ml-auto">
                        <div className="text-right mr-3 hidden sm:block">
                            <p className="text-sm font-bold text-gray-800 leading-tight">{user.name}</p>
                            <p className="text-xs font-semibold text-primary capitalize bg-green-50 px-2 py-0.5 rounded-md inline-block mt-1">{user.role}</p>
                        </div>
                        
                        {/* Render Avatar jika ada, jika tidak render inisial */}
                        {user.avatar ? (
                            <img 
                                src={`http://47.236.145.121/storage/${user.avatar}`} 
                                alt="Profil" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-sm"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold border border-primary/20 shadow-sm text-lg uppercase">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </Link>
                </header>
                
                {/* Dinamis Konten (Outlet) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
}