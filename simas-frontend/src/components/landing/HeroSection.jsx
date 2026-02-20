export default function HeroSection() {
    return (
        <header className="relative bg-primary overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 text-center relative z-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                    Selamat Datang di Portal Resmi <br/> Masjid An-Nur Puloniti
                </h1>
                <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    Membangun umat yang berakhlak mulia melalui pendidikan, majelis ilmu, dan transparansi pengelolaan dana umat secara digital.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="#donasi" className="bg-white text-primary font-bold px-8 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                        Salurkan Donasi
                    </a>
                    <a href="#agenda" className="bg-transparent border border-white text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all">
                        Lihat Jadwal Kajian
                    </a>
                </div>
            </div>
        </header>
    );
}