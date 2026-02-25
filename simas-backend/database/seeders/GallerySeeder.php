<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Gallery;

class GallerySeeder extends Seeder
{
    public function run()
    {
        $data = [
            [
                'slot_number' => 1,
                'title' => 'Kajian Akbar Ramadhan',
                'category' => 'MAJELIS ILMU',
                'image_url' => 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80&fm=webp'
            ],
            [
                'slot_number' => 2,
                'title' => 'Tahsin Al-Quran',
                'category' => null,
                'image_url' => 'https://images.unsplash.com/photo-1604868187858-8686d1494eb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&fm=webp'
            ],
            [
                'slot_number' => 3,
                'title' => 'Shalat Berjamaah',
                'category' => null,
                'image_url' => 'https://images.unsplash.com/photo-1584553421528-7690327f29f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&fm=webp'
            ],
            [
                'slot_number' => 4,
                'title' => 'Kegiatan Belajar TPQ',
                'category' => 'PENDIDIKAN',
                'image_url' => 'https://images.unsplash.com/photo-1590076214871-3312a0237da0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp'
            ],
            [
                'slot_number' => 5,
                'title' => 'Penyaluran Zakat',
                'category' => 'SOSIAL',
                'image_url' => 'https://images.unsplash.com/photo-1593113589914-075568e0723f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&fm=webp'
            ],
            [
                'slot_number' => 6,
                'title' => 'Kerja Bakti',
                'category' => null,
                'image_url' => 'https://images.unsplash.com/photo-1519817650390-64a93db51149?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&fm=webp'
            ],
            [
                'slot_number' => 7,
                'title' => "I'tikaf",
                'category' => null,
                'image_url' => 'https://images.unsplash.com/photo-1610465223321-7294fb8e9ee2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&fm=webp'
            ],
        ];

        foreach ($data as $item) {
            Gallery::create($item);
        }
    }
}