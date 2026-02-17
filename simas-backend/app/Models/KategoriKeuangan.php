<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriKeuangan extends Model
{
    protected $table = 'kategori_keuangan';
    protected $fillable = ['nama_kategori', 'jenis'];

    public function transaksi()
    {
        return $this->hasMany(TransaksiKeuangan::class, 'kategori_id');
    }
}