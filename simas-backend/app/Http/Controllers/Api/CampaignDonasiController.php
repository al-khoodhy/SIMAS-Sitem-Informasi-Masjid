<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampaignDonasi;
use Illuminate\Http\Request;

class CampaignDonasiController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => CampaignDonasi::orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'target_nominal' => 'required|numeric|min:1',
            'tanggal_selesai' => 'nullable|date'
        ]);
        $campaign = CampaignDonasi::create($request->all());
        return response()->json(['success' => true, 'data' => $campaign], 201);
    }

    public function update(Request $request, $id)
    {
        $campaign = CampaignDonasi::findOrFail($id);
        $request->validate(['judul' => 'required', 'deskripsi' => 'required', 'target_nominal' => 'required|numeric', 'status' => 'required|in:aktif,terpenuhi,ditutup']);
        $campaign->update($request->all());
        return response()->json(['success' => true, 'data' => $campaign]);
    }

    public function destroy($id)
    {
        $campaign = CampaignDonasi::findOrFail($id);
        if ($campaign->transaksi()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'Tidak bisa dihapus karena sudah ada dana masuk.'], 400);
        }
        $campaign->delete();
        return response()->json(['success' => true, 'message' => 'Campaign dihapus']);
    }
}