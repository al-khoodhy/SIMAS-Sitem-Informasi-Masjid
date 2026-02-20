import { Camera } from 'lucide-react';

export default function GaleriSection() {
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
                    <figure className="relative group overflow-hidden rounded-2xl col-span-2 row-span-2 shadow-sm m-0">
                        <img src="https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80&fm=webp" alt="Kajian Akbar" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition duration-300"></div>
                        <figcaption className="absolute bottom-0 left-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition duration-300">
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">MAJELIS ILMU</span>
                            <h3 className="text-white font-bold text-lg md:text-xl leading-tight">Kajian Akbar Ramadhan Bersama Jamaah</h3>
                        </figcaption>
                    </figure>

                    <figure className="relative group overflow-hidden rounded-2xl col-span-1 row-span-1 shadow-sm m-0">
                        <img src="https://images.unsplash.com/photo-1604868187858-8686d1494eb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&fm=webp" alt="Al-Quran" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition duration-300"></div>
                        <figcaption className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white font-bold text-sm">Tahsin Al-Quran</h3>
                        </figcaption>
                    </figure>

                    <figure className="relative group overflow-hidden rounded-2xl col-span-1 row-span-1 shadow-sm m-0">
                        <img src="https://images.unsplash.com/photo-1584553421528-7690327f29f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&fm=webp" alt="Sholat Berjamaah" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition duration-300"></div>
                        <figcaption className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white font-bold text-sm">Shalat Berjamaah</h3>
                        </figcaption>
                    </figure>

                    <figure className="relative group overflow-hidden rounded-2xl col-span-2 row-span-1 shadow-sm m-0">
                        <img src="https://images.unsplash.com/photo-1590076214871-3312a0237da0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp" alt="TPQ Anak" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-100 transition duration-300"></div>
                        <figcaption className="absolute bottom-0 left-0 p-4">
                            <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded mb-1.5 inline-block">PENDIDIKAN</span>
                            <h3 className="text-white font-bold text-sm md:text-base">Kegiatan Belajar TPQ Anak-Anak</h3>
                        </figcaption>
                    </figure>

                    <figure className="relative group overflow-hidden rounded-2xl col-span-2 row-span-1 shadow-sm m-0">
                        <img src="https://images.unsplash.com/photo-1593113589914-075568e0723f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp" alt="Zakat" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700 object-top" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-100 transition duration-300"></div>
                        <figcaption className="absolute bottom-0 left-0 p-4">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded mb-1.5 inline-block">SOSIAL</span>
                            <h3 className="text-white font-bold text-sm md:text-base">Penyaluran Zakat & Sembako Warga</h3>
                        </figcaption>
                    </figure>

                    <figure className="relative group overflow-hidden rounded-2xl col-span-1 row-span-1 shadow-sm m-0">
                        <img src="https://images.unsplash.com/photo-1519817650390-64a93db51149?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&fm=webp" alt="Gotong Royong" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition duration-300"></div>
                        <figcaption className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white font-bold text-sm">Kerja Bakti</h3>
                        </figcaption>
                    </figure>

                    <figure className="relative group overflow-hidden rounded-2xl col-span-1 row-span-1 shadow-sm m-0">
                        <img src="https://images.unsplash.com/photo-1610465223321-7294fb8e9ee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&fm=webp" alt="Ramadhan" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition duration-300"></div>
                        <figcaption className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white font-bold text-sm">I'tikaf</h3>
                        </figcaption>
                    </figure>
                </div>
            </div>
        </section>
    );
}