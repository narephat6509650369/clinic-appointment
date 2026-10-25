<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $r)
    {
        $r->validate(['from' => 'nullable|date', 'to' => 'nullable|date|after_or_equal:from']);
        $from = $r->input('from', now()->startOfMonth()->toDateString());
        $to = $r->input('to', now()->toDateString());

        // ทุก query เป็น COUNT / GROUP BY บน index (registered_at, appointment_date+status) ไม่ดึงแถวมาประมวลผลใน PHP
        $byStatus = Appointment::whereBetween('appointment_date', [$from, $to])
            ->selectRaw('status, COUNT(*) AS c')->groupBy('status')->pluck('c', 'status');

        return Inertia::render('Reports/Index', [
            'from' => $from,
            'to' => $to,
            'newPatients' => Patient::whereBetween('registered_at', [$from, $to])->count(),
            'total' => $byStatus->sum(),
            'byStatus' => collect(Appointment::STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($byStatus[$s] ?? 0)]),
        ]);
    }
}
