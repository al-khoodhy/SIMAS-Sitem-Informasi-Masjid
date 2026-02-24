// src/pages/Perpustakaan.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Filter, DownloadCloud, AlertTriangle, ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

export default function Perpustakaan() {
    const [books, setBooks] = useState([]);
    const [filters, setFilters] = useState({ kategori: [], penulis: [] });
    const [loading, setLoading] = useState(true);
    
    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKategori, setSelectedKategori] = useState('semua');
    const [selectedPenulis, setSelectedPenulis] = useState('semua');
    
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, selectedKategori, selectedPenulis]);

    const fetchFilters = async () => {
        try { const res = await api.get('/public/buku/filters'); setFilters(res.data.data); } catch (err) { console.error(err); }
    };

    const fetchBooks = async (currentPage = page, search = searchTerm) => {
        setLoading(true);
        try {
            const params = { page: currentPage, search, kategori: selectedKategori, penulis: selectedPenulis };
            const res = await api.get('/public/buku', { params });
            setBooks(res.data.data || []);
            if(res.data.pagination) setTotalPages(res.data.pagination.last_page);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { setPage(1); fetchBooks(1, e.target.value); }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Topbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-gray-100">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition font-bold">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Beranda
                    </Link>
                    <div className="flex items-center font-bold text-primary gap-2">
                        <BookOpen className="w-5 h-5" /> Perpustakaan Digital
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 pt-8">
                {/* PERINGATAN HAK CIPTA */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl shadow-sm mb-8 flex items-start">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-yellow-800 text-sm md:text-base">Peringatan Hak Cipta & Penggunaan</h3>
                        <p className="text-yellow-700 text-xs md:text-sm mt-1 leading-relaxed">
                            Seluruh buku digital (e-book) yang tersedia di halaman ini dibagikan semata-mata untuk kepentingan pendidikan, dakwah, dan pembelajaran umat. <strong>Dilarang keras mengkomersialkan atau memperjualbelikan ulang materi ini tanpa seizin dari penulis atau penerbit asli.</strong>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Koleksi Buku & Kitab</h1>
                        <p className="text-gray-500 text-sm">Unduh dan pelajari berbagai keilmuan Islam secara gratis.</p>
                    </div>

                    {/* ALAT FILTER PENCARIAN */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                        <div className="relative w-full sm:w-48">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input type="text" placeholder="Cari judul..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="relative w-full sm:w-40 flex items-center border-l sm:border-l-2 sm:pl-3 border-gray-100">
                            <Filter className="w-4 h-4 text-gray-400 absolute left-3 sm:left-6 pointer-events-none" />
                            <select value={selectedKategori} onChange={(e) => {setSelectedKategori(e.target.value); setPage(1);}} className="w-full pl-8 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer appearance-none font-medium text-gray-700">
                                <option value="semua">Semua Kategori</option>
                                {filters.kategori.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                        <div className="relative w-full sm:w-48 flex items-center border-l sm:border-l-2 sm:pl-3 border-gray-100">
                            <select value={selectedPenulis} onChange={(e) => {setSelectedPenulis(e.target.value); setPage(1);}} className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer appearance-none font-medium text-gray-700">
                                <option value="semua">Semua Penulis</option>
                                {filters.penulis.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* GRID BUKU */}
                {loading ? (
                    <div className="py-20 text-center flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>
                ) : books.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-1">Buku Tidak Ditemukan</h3>
                        <p className="text-gray-500">Silakan coba kata kunci atau filter lain.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {books.map(buku => (
                            <div key={buku.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
                                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                    {buku.cover_image ? (
                                        <img src={`http://47.236.145.121/storage/${buku.cover_image}`} alt={buku.judul} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-200/50"><ImageIcon className="w-12 h-12 mb-2 opacity-50" /><span className="text-xs font-bold uppercase tracking-widest">No Cover</span></div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md">{buku.kategori}</div>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-gray-800 leading-tight line-clamp-2 mb-1 group-hover:text-primary transition">{buku.judul}</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-4 flex-1">Oleh: <span className="text-gray-700">{buku.penulis}</span></p>
                                    
                                    <a href={buku.link_gdrive} target="_blank" rel="noreferrer" className="w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 py-2 rounded-xl text-sm font-bold flex items-center justify-center transition">
                                        <DownloadCloud className="w-4 h-4 mr-1.5" /> Unduh PDF
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-gray-50 flex items-center shadow-sm"><ChevronLeft className="w-4 h-4 mr-1"/> Prev</button>
                        <span className="px-4 py-2 flex items-center font-bold text-gray-500">Hal {page} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-gray-50 flex items-center shadow-sm">Next <ChevronRight className="w-4 h-4 ml-1"/></button>
                    </div>
                )}
            </div>
        </div>
    );
}