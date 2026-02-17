<!DOCTYPE html>
<html>
<head>
    <title>Laporan Keuangan Masjid</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h2, .header h3 { margin: 0; }
        table { w-full; border-collapse: collapse; margin-bottom: 20px; width: 100%; }
        table, th, td { border: 1px solid black; }
        th, td { padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { width: 40%; float: right; margin-bottom: 30px; }
        .signature-area { margin-top: 50px; width: 100%; display: table; }
        .signature-box { display: table-cell; width: 50%; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h2>MASJID JAMI' PULONITI</h2>
        <p>Laporan Audit Keuangan (Pemasukan & Pengeluaran Kas)</p>
        <p><strong>{{ $periode }}</strong></p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="12%">Tanggal</th>
                <th width="15%">Kategori</th>
                <th width="33%">Keterangan</th>
                <th width="20%" class="text-right">Pemasukan (Rp)</th>
                <th width="20%" class="text-right">Pengeluaran (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transaksi as $t)
            <tr>
                <td>{{ \Carbon\Carbon::parse($t->tanggal_transaksi)->format('d/m/Y') }}</td>
                <td>{{ $t->kategori->nama_kategori ?? '-' }}</td>
                <td>{{ $t->keterangan }}</td>
                <td class="text-right">{{ $t->tipe == 'masuk' ? number_format($t->nominal, 0, ',', '.') : '-' }}</td>
                <td class="text-right">{{ $t->tipe == 'keluar' ? number_format($t->nominal, 0, ',', '.') : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="summary-box">
        <tr><th>Total Pemasukan</th><td class="text-right">Rp {{ number_format($totalPemasukan, 0, ',', '.') }}</td></tr>
        <tr><th>Total Pengeluaran</th><td class="text-right">Rp {{ number_format($totalPengeluaran, 0, ',', '.') }}</td></tr>
        <tr><th>SALDO AKHIR</th><th class="text-right">Rp {{ number_format($saldoAkhir, 0, ',', '.') }}</th></tr>
    </table>

    <div style="clear: both;"></div>

    <div class="signature-area">
        <div class="signature-box">
            <p>Mengetahui,</p>
            <p><strong>Ketua Takmir</strong></p>
            <br><br><br>
            <p>(.......................................)</p>
        </div>
        <div class="signature-box">
            <p>Puloniti, {{ \Carbon\Carbon::now()->format('d F Y') }}</p>
            <p><strong>Bendahara / Auditor</strong></p>
            <br><br><br>
            <p>({{ $pencetak }})</p>
        </div>
    </div>
</body>
</html>