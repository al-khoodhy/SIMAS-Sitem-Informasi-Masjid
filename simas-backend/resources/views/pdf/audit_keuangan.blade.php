<!DOCTYPE html>
<html>
<head>
    <title>Laporan Keuangan Masjid</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; }
        
        /* Layout Kop Surat */
        .header-container { width: 100%; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .logo-cell { width: 15%; text-align: left; vertical-align: middle; }
        .title-cell { width: 85%; text-align: center; vertical-align: middle; }
        .logo-img { width: 85px; height: auto; margin-left: 20px; } /* Atur ukuran logo di sini */
        
        .header-container h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .header-container p { margin: 2px 0; font-size: 12px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table, th, td { border: 1px solid #444; }
        th, td { padding: 6px 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { width: 40%; float: right; margin-bottom: 30px; }
        .signature-area { margin-top: 30px; width: 100%; }
        .signature-table { border: none !important; width: 100%; }
        .signature-table td { border: none !important; text-align: center; width: 50%; }
    </style>
</head>
<body>
    
    <table class="header-container" style="border: none;">
        <tr>
            <td class="logo-cell" style="border: none;">
                <img src="{{ $logo }}" class="logo-img">
            </td>
            <td class="title-cell" style="border: none; padding-right: 80px;"> <h2>MASJID JAMI' PULONITI</h2>
                <p>Alamat: Jl. Raya Puloniti No. 123, Kec. Bangsal, Mojokerto</p>
                <p><strong>Laporan Audit Keuangan (Pemasukan & Pengeluaran Kas)</strong></p>
                <p>Periode: {{ $periode }}</p>
            </td>
        </tr>
    </table>

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
                <td class="text-center">{{ \Carbon\Carbon::parse($t->tanggal_transaksi)->format('d/m/Y') }}</td>
                <td>{{ $t->kategori->nama_kategori ?? 'Umum' }}</td>
                <td>{{ $t->keterangan }}</td>
                <td class="text-right">{{ $t->tipe == 'masuk' ? number_format($t->nominal, 0, ',', '.') : '-' }}</td>
                <td class="text-right">{{ $t->tipe == 'keluar' ? number_format($t->nominal, 0, ',', '.') : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="summary-box">
        <tr>
            <th>Total Pemasukan</th>
            <td class="text-right">Rp {{ number_format($totalPemasukan, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <th>Total Pengeluaran</th>
            <td class="text-right text-red" style="color: red;">(Rp {{ number_format($totalPengeluaran, 0, ',', '.') }})</td>
        </tr>
        <tr style="background-color: #eee;">
            <th>SALDO AKHIR</th>
            <th class="text-right">Rp {{ number_format($saldoAkhir, 0, ',', '.') }}</th>
        </tr>
    </table>

    <div style="clear: both;"></div>

    <div class="signature-area">
        <table class="signature-table">
            <tr>
                <td>
                    <p>Mengetahui,</p>
                    <p><strong>Ketua Takmir</strong></p>
                    <br><br><br><br>
                    <p>( __________________________ )</p>
                </td>
                <td>
                    <p>Puloniti, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
                    <p><strong>Bendahara / Auditor</strong></p>
                    <br><br><br><br>
                    <p>( <strong>{{ $pencetak }}</strong> )</p>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>