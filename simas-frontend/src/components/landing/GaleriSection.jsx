import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import api from '../../api/axios';

export default function GaleriSection() {
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/public/gallery');
                setGalleries(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Konfigurasi Layout Grid untuk 7 Slot (sesuai urutan Seeder)
    const gridLayouts = [
        "col-span-2 row-span-2", // Slot 1 (Besar Kiri)
        "col-span-1 row-span-1", // Slot 2 (Kecil)
        "col-span-1 row-span-1", // Slot 3 (Kecil)
        "col-span-2 row-span-1", // Slot 4 (Lebar)
        "col-span-2 row-span-1", // Slot 5 (Lebar)
        "col-span-1 row-span-1", // Slot 6 (Kecil)
        "col-span-1 row-span-1", // Slot 7 (Kecil)
    ];

    // Helper untuk render gambar (Link luar vs Storage lokal)
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:8000/storage/${url}`;
    };

    if (loading) return <div className="py-20 text-center text-gray-500">Memuat Galeri...</div>;

    return (
        <section id="galeri" className="bg-gray-50 py-20 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-4">
                            <Camera className="w-4 h-4" /> Galeri Masjid
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Dokumentasi Kegiatan</h2>
                        <p className="text-gray-500 mt-3 max-w-2xl">Potret kebersamaan dan aktivitas ibadah jamaah di Masjid An-Nur Puloniti.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]">
                    {galleries.map((item, index) => (
                        <figure key={item.id} className={`relative group overflow-hidden rounded-2xl shadow-sm m-0 ${gridLayouts[index] || 'col-span-1 row-span-1'}`}>
                            <img 
                                src={getImageUrl(item.image_url)} 
                                alt={item.title} 
                                loading="lazy" 
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition duration-300"></div>
                            <figcaption className="absolute bottom-0 left-0 p-4 md:p-5 transform translate-y-2 group-hover:translate-y-0 transition duration-300">
                                {item.category && (
                                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">
                                        {item.category}
                                    </span>
                                )}
                                <h3 className="text-white font-bold text-sm md:text-lg leading-tight">
                                    {item.title}
                                </h3>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}