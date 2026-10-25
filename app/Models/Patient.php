<?php

namespace App\Models;

use App\Support\Phone;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Patient extends Model
{
    protected $guarded = [];

    protected $casts = ['birth_date' => 'date:Y-m-d', 'registered_at' => 'date:Y-m-d'];

    /** สร้างผู้ป่วยพร้อม HN: ใช้ auto-increment id เป็นเลข HN จึงไม่ซ้ำแม้มีคนสมัครพร้อมกัน */
    public static function register(array $data): self
    {
        return DB::transaction(function () use ($data) {
            $p = static::create($data + ['registered_at' => now()->toDateString()]);
            $p->update(['hn' => sprintf('HN%06d', $p->id)]);
            return $p;
        });
    }

    /** ค้นหาด้วย HN / เบอร์ / ชื่อ — ทุกแบบเป็น prefix match ('abc%') เพื่อให้ใช้ index ได้ */
    public function scopeSearch($q, ?string $s)
    {
        $s = trim((string) $s);
        if ($s === '') {
            return $q;
        }
        $like = fn ($v) => addcslashes($v, '%_\\').'%';

        if (preg_match('/^hn\s*\d*$/i', $s)) {
            return $q->where('hn', 'like', $like(strtoupper(preg_replace('/\s+/', '', $s))));
        }
        if (preg_match('/^[\d\s\-+()]+$/', $s)) {
            return $q->where('phone', 'like', $like(Phone::clean($s)));
        }
        [$a, $b] = array_pad(preg_split('/\s+/', $s, 2), 2, null);
        return $q->where(function ($w) use ($a, $b, $like) {
            if ($b !== null) {
                $w->where('first_name', 'like', $like($a))->where('last_name', 'like', $like($b));
            } else {
                $w->where('first_name', 'like', $like($a))->orWhere('last_name', 'like', $like($a));
            }
        });
    }
}
