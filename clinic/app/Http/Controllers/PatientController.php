<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Support\Phone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $r)
    {
        return Inertia::render('Patients/Index', [
            'q' => $r->input('q', ''),
            // paginate เสมอ ไม่โหลดทั้งตาราง
            'patients' => Patient::search($r->input('q'))->orderByDesc('id')->paginate(15)->withQueryString(),
        ]);
    }

    /** JSON สำหรับ autocomplete ตอนสร้างนัด */
    public function search(Request $r)
    {
        return Patient::search($r->input('q'))->orderBy('id')->limit(10)
            ->get(['id', 'hn', 'first_name', 'last_name', 'phone']);
    }

    public function store(Request $r)
    {
        $p = Patient::register($this->validated($r));
        return back()->with('success', "เพิ่มผู้ป่วย {$p->hn} แล้ว");
    }

    public function update(Request $r, Patient $patient)
    {
        $patient->update($this->validated($r));
        return back()->with('success', "แก้ไขข้อมูล {$patient->hn} แล้ว");
    }

    private function validated(Request $r): array
    {
        $r->merge(['phone' => Phone::normalize($r->input('phone'))]); // เก็บเป็น 0812345678 เสมอ
        return $r->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'required',
            'birth_date' => 'required|date|before_or_equal:today',
        ], ['phone.required' => 'เบอร์โทรไม่ถูกต้อง (ต้องเป็นเบอร์ไทย 9–10 หลัก)']);
    }
}
