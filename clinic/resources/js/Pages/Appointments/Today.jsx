import { useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Layout, { Err } from '../../Layout';

const LABEL = { waiting: 'รอ', arrived: 'มาแล้ว', cancelled: 'ยกเลิก' };

// เลือกผู้ป่วยแบบ autocomplete (ผู้ป่วยอาจมีหลักแสนคน จึงไม่โหลดมาทั้งหมด)
function PatientPicker({ onChange, error }) {
    const [q, setQ] = useState('');
    const [list, setList] = useState([]);
    const [sel, setSel] = useState(null);

    useEffect(() => {
        if (q.trim().length < 2) { setList([]); return; }
        const t = setTimeout(() => fetch('/patients/search?q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' } })
            .then((r) => r.json()).then(setList), 250);
        return () => clearTimeout(t);
    }, [q]);

    if (sel) return (
        <label>ผู้ป่วย
            <div>{sel.hn} {sel.first_name} {sel.last_name} <button type="button" className="ghost" onClick={() => { setSel(null); onChange(''); }}>เปลี่ยน</button></div>
        </label>
    );
    return (
        <label>ผู้ป่วย (พิมพ์ชื่อ / HN / เบอร์)
            <input value={q} onChange={(e) => setQ(e.target.value)} />
            {list.map((p) => (
                <div key={p.id} className="opt" onClick={() => { setSel(p); onChange(p.id); setList([]); }}>
                    {p.hn} · {p.first_name} {p.last_name} · {p.phone}
                </div>
            ))}
            <Err m={error} />
        </label>
    );
}

export default function Today({ date, doctorId, doctors, appointments }) {
    const f = useForm({ patient_id: '', doctor_id: '', appointment_date: date, start_time: '', end_time: '' });
    const [pickerKey, setPickerKey] = useState(0);

    const filter = (patch) => router.get('/appointments/today', { date, doctor_id: doctorId, ...patch }, { preserveState: true, replace: true });
    const submit = (e) => {
        e.preventDefault();
        f.post('/appointments', { preserveScroll: true, onSuccess: () => { f.setData({ ...f.data, patient_id: '', start_time: '', end_time: '' }); setPickerKey((k) => k + 1); } });
    };
    const setStatus = (id, status) => router.patch(`/appointments/${id}/status`, { status }, { preserveScroll: true });

    return (
        <Layout>
            <h1>นัดหมาย</h1>
            <div className="card row">
                <label>วันที่<input type="date" value={date} onChange={(e) => filter({ date: e.target.value })} /></label>
                <label>แพทย์
                    <select value={doctorId} onChange={(e) => filter({ doctor_id: e.target.value })}>
                        <option value="">ทั้งหมด</option>
                        {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </label>
            </div>

            <div className="card">
                <table>
                    <thead><tr><th>เวลา</th><th>ผู้ป่วย</th><th>แพทย์</th><th>สถานะ</th><th>เปลี่ยนสถานะ</th></tr></thead>
                    <tbody>
                        {appointments.map((a) => (
                            <tr key={a.id}>
                                <td>{a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}</td>
                                <td>{a.patient.hn} {a.patient.first_name} {a.patient.last_name}</td>
                                <td>{a.doctor.name}</td>
                                <td><span className={`badge ${a.status}`}>{LABEL[a.status]}</span></td>
                                <td className="row">
                                    {Object.keys(LABEL).map((s) => (
                                        <button key={s} className="ghost" disabled={a.status === s} onClick={() => setStatus(a.id, s)}>{LABEL[s]}</button>
                                    ))}
                                </td>
                            </tr>
                        ))}
                        {appointments.length === 0 && <tr><td colSpan="5" className="muted">ไม่มีนัดในวันที่เลือก</td></tr>}
                    </tbody>
                </table>
            </div>

            <form className="card" onSubmit={submit}>
                <b>สร้างนัดหมายใหม่</b>
                <div className="row">
                    <PatientPicker key={pickerKey} onChange={(v) => f.setData('patient_id', v)} error={f.errors.patient_id} />
                    <label>แพทย์
                        <select value={f.data.doctor_id} onChange={(e) => f.setData('doctor_id', e.target.value)}>
                            <option value="">เลือกแพทย์</option>
                            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
                        </select>
                        <Err m={f.errors.doctor_id} />
                    </label>
                    <label>วันที่<input type="date" value={f.data.appointment_date} onChange={(e) => f.setData('appointment_date', e.target.value)} /><Err m={f.errors.appointment_date} /></label>
                    <label>เริ่ม<input type="time" value={f.data.start_time} onChange={(e) => f.setData('start_time', e.target.value)} /><Err m={f.errors.start_time} /></label>
                    <label>สิ้นสุด<input type="time" value={f.data.end_time} onChange={(e) => f.setData('end_time', e.target.value)} /><Err m={f.errors.end_time} /></label>
                    <button disabled={f.processing}>สร้างนัด</button>
                </div>
            </form>
        </Layout>
    );
}
