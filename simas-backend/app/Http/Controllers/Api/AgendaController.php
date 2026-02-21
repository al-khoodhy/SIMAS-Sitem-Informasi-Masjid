<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use Illuminate\Http\Request;
use Carbon\Carbon; // Pastikan ini di-import untuk manipulasi waktu

class AgendaController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Agenda::query();

        // FITUR SERVER-SIDE SEARCH (Berdasarkan Judul atau Lokasi)
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('judul', 'like', '%' . $request->search . '%')
                  ->orWhere('lokasi', 'like', '%' . $request->search . '%');
            });
        }

        // SERVER-SIDE PAGINATION (Ambil 10 data per halaman, urut dari yang terdekat/terbaru)
        $agendas = $query->orderBy('waktu_pelaksanaan', 'desc')->paginate(10);

        return response()->json([
            'success' => true, 
            'data' => $agendas->items(),
            'pagination' => [
                'current_page' => $agendas->currentPage(),
                'last_page' => $agendas->lastPage(),
                'total' => $agendas->total()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'waktu_pelaksanaan' => 'required|date',
            'waktu_selesai' => 'nullable|date|after_or_equal:waktu_pelaksanaan',
            'lokasi' => 'required|string|max:255',
            'is_recurring' => 'boolean',
            'recurrence_type' => 'nullable|string',
            'recurrence_interval' => 'nullable|integer',
            'recurrence_end_date' => 'nullable|date'
        ]);

        // Tangkap data dan pastikan string kosong menjadi null
        $waktuSelesai = $request->filled('waktu_selesai') ? $request->waktu_selesai : null;
        $recurrenceEndDate = $request->filled('recurrence_end_date') ? $request->recurrence_end_date : null;

        if ($request->is_recurring && $recurrenceEndDate) {
            $currentDate = \Carbon\Carbon::parse($request->waktu_pelaksanaan);
            $endDate = \Carbon\Carbon::parse($recurrenceEndDate)->endOfDay();
            
            // Hitung durasi acara dalam menit
            $durationMinutes = 0;
            if ($waktuSelesai) {
                $durationMinutes = $currentDate->diffInMinutes(\Carbon\Carbon::parse($waktuSelesai));
            }

            $agendasToInsert = [];

            while ($currentDate->lte($endDate)) {
                $waktuSelesaiBatch = $waktuSelesai ? $currentDate->copy()->addMinutes($durationMinutes)->format('Y-m-d H:i:s') : null;

                $agendasToInsert[] = [
                    'judul' => $request->judul,
                    'deskripsi' => $request->deskripsi,
                    'waktu_pelaksanaan' => $currentDate->format('Y-m-d H:i:s'),
                    'waktu_selesai' => $waktuSelesaiBatch,
                    'lokasi' => $request->lokasi,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                switch ($request->recurrence_type) {
                    case 'daily': $currentDate->addDay(); break;
                    case 'weekly': $currentDate->addWeek(); break;
                    case 'monthly': $currentDate->addMonth(); break;
                    case 'custom': $currentDate->addDays($request->recurrence_interval ?? 1); break;
                    default: $currentDate->addWeek(); break; // Default fallback
                }
            }

            \App\Models\Agenda::insert($agendasToInsert);
            return response()->json(['success' => true, 'message' => count($agendasToInsert) . ' Agenda berhasil dibuat'], 201);
        } 
        
        else {
            // Pembuatan agenda tunggal (tanpa pengulangan)
            $agenda = \App\Models\Agenda::create([
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'waktu_pelaksanaan' => $request->waktu_pelaksanaan,
                'waktu_selesai' => $waktuSelesai,
                'lokasi' => $request->lokasi
            ]);
            return response()->json(['success' => true, 'message' => 'Agenda berhasil dibuat', 'data' => $agenda], 201);
        }
    }

    public function update(Request $request, $id)
    {
        $agenda = \App\Models\Agenda::findOrFail($id);
        
        $waktuSelesai = $request->filled('waktu_selesai') ? $request->waktu_selesai : null;

        $agenda->update([
            'judul' => $request->judul,
            'deskripsi' => $request->deskripsi,
            'waktu_pelaksanaan' => $request->waktu_pelaksanaan,
            'waktu_selesai' => $waktuSelesai,
            'lokasi' => $request->lokasi
        ]);
        
        return response()->json(['success' => true, 'message' => 'Agenda diperbarui']);
    }

    public function destroy($id)
    {
        Agenda::destroy($id);
        return response()->json(['success' => true, 'message' => 'Agenda dihapus']);
    }
    // Fungsi Hapus Massal
    public function massDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:agendas,id'
        ]);

        Agenda::whereIn('id', $request->ids)->delete();
        
        return response()->json([
            'success' => true, 
            'message' => count($request->ids) . ' Agenda berhasil dihapus'
        ]);
    }
}