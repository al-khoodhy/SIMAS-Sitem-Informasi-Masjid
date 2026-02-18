<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use Illuminate\Http\Request;
use Carbon\Carbon; // Pastikan ini di-import untuk manipulasi waktu

class AgendaController extends Controller
{
    public function index()
    {
        // Hanya tampilkan agenda dari hari ini ke depan di Dasbor Admin agar tidak menumpuk
        $agendas = Agenda::where('waktu_pelaksanaan', '>=', now()->subDays(1))
                        ->orderBy('waktu_pelaksanaan', 'asc')
                        ->get();
        return response()->json(['success' => true, 'data' => $agendas]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'waktu_pelaksanaan' => 'required|date',
            'lokasi' => 'required|string|max:255',
            'is_recurring' => 'boolean',
            'recurrence_type' => 'nullable|in:daily,weekly,monthly,custom',
            'recurrence_interval' => 'nullable|integer|min:1',
            'recurrence_end_date' => 'nullable|date|after_or_equal:waktu_pelaksanaan'
        ]);

        // JIKA AGENDA BERULANG (RECURRING)
        if ($request->is_recurring && $request->recurrence_end_date) {
            $currentDate = Carbon::parse($request->waktu_pelaksanaan);
            $endDate = Carbon::parse($request->recurrence_end_date)->endOfDay();
            $agendasToInsert = [];

            // Looping untuk membuat jadwal sampai batas tanggal yang ditentukan
            while ($currentDate->lte($endDate)) {
                $agendasToInsert[] = [
                    'judul' => $request->judul,
                    'deskripsi' => $request->deskripsi,
                    'waktu_pelaksanaan' => $currentDate->format('Y-m-d H:i:s'),
                    'lokasi' => $request->lokasi,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Tambahkan waktu berdasarkan tipe pengulangan
                switch ($request->recurrence_type) {
                    case 'daily':
                        $currentDate->addDay();
                        break;
                    case 'weekly':
                        $currentDate->addWeek();
                        break;
                    case 'monthly':
                        $currentDate->addMonth();
                        break;
                    case 'custom':
                        $interval = $request->recurrence_interval ?? 1;
                        $currentDate->addDays($interval);
                        break;
                }
            }

            // Masukkan semua data ke database sekaligus (Batch Insert)
            Agenda::insert($agendasToInsert);
            return response()->json(['success' => true, 'message' => count($agendasToInsert) . ' Agenda berulang berhasil dibuat'], 201);
        } 
        
        // JIKA AGENDA HANYA 1 KALI (NORMAL)
        else {
            $agenda = Agenda::create($request->only(['judul', 'deskripsi', 'waktu_pelaksanaan', 'lokasi']));
            return response()->json(['success' => true, 'data' => $agenda], 201);
        }
    }

    public function update(Request $request, $id)
    {
        // Update hanya akan mengubah 1 jadwal spesifik yang dipilih (Best Practice)
        $agenda = Agenda::findOrFail($id);
        $agenda->update($request->only(['judul', 'deskripsi', 'waktu_pelaksanaan', 'lokasi']));
        return response()->json(['success' => true, 'data' => $agenda]);
    }

    public function destroy($id)
    {
        Agenda::destroy($id);
        return response()->json(['success' => true, 'message' => 'Agenda dihapus']);
    }
}