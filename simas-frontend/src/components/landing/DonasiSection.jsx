import { formatRupiah } from '../../utils/formatters';

export default function DonasiSection({ campaignsData }) {
    return (
        <section id="donasi" className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Target Pengadaan & Wakaf</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Mari bersama-sama mewujudkan fasilitas ibadah yang nyaman bagi seluruh jamaah Masjid An-Nur Puloniti.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {!campaignsData || campaignsData.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-gray-100">Belum ada program donasi aktif saat ini.</div>
                    ) : (
                        campaignsData.map(cam => {
                            const persen = Math.min((cam.terkumpul_nominal / cam.target_nominal) * 100, 100).toFixed(1);
                            return (
                                <article key={cam.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden group">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{cam.judul}</h3>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">{cam.deskripsi}</p>
                                        <div className="mb-2 flex justify-between text-sm font-bold"><span className="text-primary">{formatRupiah(cam.terkumpul_nominal)}</span><span className="text-gray-400">/ {formatRupiah(cam.target_nominal)}</span></div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden"><div className="bg-primary h-2.5 rounded-full" style={{ width: `${persen}%` }}></div></div>
                                        <p className="text-xs text-gray-500 text-right mb-6">{persen}% Terkumpul</p>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Transfer Rekening BSI</p>
                                            <p className="font-bold text-gray-800 tracking-wider text-lg">7123 4567 890</p>
                                            <p className="text-xs text-gray-500 mt-1">a.n Masjid An-Nur Puloniti</p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}