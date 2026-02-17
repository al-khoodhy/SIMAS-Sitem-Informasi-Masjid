<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h2>MASJID JAMI' PULONITI</h2>
        <p>Laporan Audit Penyaluran Zakat Fitrah & Mal</p>
        <p><strong>Tahun: {{ $tahun }}</strong></p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Tanggal Disalurkan</th>
                <th>Nama Mustahik (Penerima)</th>
                <th>Jenis Zakat</th>
                <th>Bentuk/Nominal</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($penyaluran as $p)
            <tr>
                <td>{{ \Carbon\Carbon::parse($p->tanggal_penyaluran)->format('d/m/Y') }}</td>
                <td>{{ $p->mustahik->nama_lengkap }} ({{ $p->mustahik->rt }})</td>
                <td style="text-transform: capitalize;">Zakat {{ $p->jenis_zakat }}</td>
                <td>{{ $p->bentuk_barang ? $p->bentuk_barang : 'Rp '.number_format($p->nominal_uang, 0, ',', '.') }}</td>
                <td>Selesai</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <p><em>Dokumen ini dicetak oleh sistem secara otomatis pada {{ $tanggal_cetak }} oleh {{ $pencetak }}</em></p>
</body>
</html>