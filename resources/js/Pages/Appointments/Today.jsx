import { useEffect, useId, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Layout, { Err, PageHead } from '../../Layout';

const LABEL = { waiting: 'รอ', arrived: 'มาแล้ว', cancelled: 'ยกเลิก' };

// เลื่อนวันที่ทีละ n วัน (คำนวณแบบ local ไม่ให้เพี้ยนเพราะ timezone)
const shiftDate = (iso, n) => {
    const [y, m, d] = iso.split('-').map(Number);
    const t = new Date(y, m - 1, d + n);
    return [t.getFullYear(), String(t.getMonth() + 1).padStart(2, '0'), String(t.getDate()).padStart(2, '0')].join('-');
};
const longDate = (iso) => {
    const [y, m, d] = (iso || '').split('-').map(Number);
    return y ? new Date(y, m - 1, d).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
};

// เลือกผู้ป่วยแบบ autocomplete (ผู้ป่วยอาจมีหลักแสนคน จึงไม่โหลดมาทั้งหมด)
function PatientPicker({ onChange, error }) {
    const id = useId();
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
        <div className="picker">
            <span>ผู้ป่วย</span>
            <div className="picked">
                <span><b>{sel.hn}</b>{sel.first_name} {sel.last_name}</span>
                <button type="button" className="ghost sm" onClick={() => { setSel(null); onChange(''); }}>เปลี่ยน</button>
            </div>
        </div>
    );
    return (
        <div className="picker">
            <label htmlFor={id}>ผู้ป่วย (พิมพ์ชื่อ / HN / เบอร์)</label>
            <input id={id} value={q} autoComplete="off" onChange={(e) => setQ(e.target.value)} />
            {list.length > 0 && (
                <ul className="options">
                    {list.map((p) => (
                        <li key={p.id}>
                            <button type="button" onClick={() => { setSel(p); onChange(p.id); setList([]); }}>
                                {p.first_name} {p.last_name}
                                <small>{p.hn} · {p.phone}</small>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <Err m={error} />
        </div>
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

    const count = (s) => appointments.filter((a) => a.status === s).length;

    return (
        <Layout>
            <PageHead eyebrow="Schedule" title="นัดหมาย">จัดการคิวนัดของคลินิกในแต่ละวัน</PageHead>

            <div className="split">
                <section aria-label="รายการนัดหมาย">
                    <div className="card">
                        <div className="toolbar">
                            <div className="daynav">
                                <button type="button" className="ghost" aria-label="วันก่อนหน้า" onClick={() => filter({ date: shiftDate(date, -1) })}>‹</button>
                                <label>วันที่<input type="date" value={date} onChange={(e) => filter({ date: e.target.value })} /></label>
                                <button type="button" className="ghost" aria-label="วันถัดไป" onClick={() => filter({ date: shiftDate(date, 1) })}>›</button>
                            </div>
                            <label className="doc">แพทย์
                                <select value={doctorId} onChange={(e) => filter({ doctor_id: e.target.value })}>
                                    <option value="">ทั้งหมด</option>
                                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </label>
                        </div>
                        <h2 className="day-label">{longDate(date)}</h2>
                        <div className="chips">
                            <span className="chip">ทั้งหมด<b>{appointments.length}</b></span>
                            {Object.keys(LABEL).map((s) => <span key={s} className="chip">{LABEL[s]}<b>{count(s)}</b></span>)}
                        </div>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="empty"><b>ไม่มีนัดในวันที่เลือก</b>สร้างนัดหมายใหม่ได้จากฟอร์มด้านข้าง</div>
                    ) : (
                        <ul className="appts">
                            {appointments.map((a) => (
                                <li key={a.id} className="appt" data-status={a.status}>
                                    <div className="appt-time"><b>{a.start_time.slice(0, 5)}</b><span>ถึง {a.end_time.slice(0, 5)}</span></div>
                                    <div>
                                        <div className="appt-name">{a.patient.first_name} {a.patient.last_name}</div>
                                        <div className="appt-sub"><span className="num">{a.patient.hn}</span> · {a.doctor.name}</div>
                                    </div>
                                    <span className={`badge ${a.status}`}>{LABEL[a.status]}</span>
                                    <div className="seg" role="group" aria-label="เปลี่ยนสถานะ">
                                        {Object.keys(LABEL).map((s) => (
                                            <button key={s} type="button" aria-pressed={a.status === s} onClick={() => a.status !== s && setStatus(a.id, s)}>{LABEL[s]}</button>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <form className="card aside" onSubmit={submit}>
                    <div className="card-title">สร้างนัดหมายใหม่</div>
                    <div className="stack">
                        <PatientPicker key={pickerKey} onChange={(v) => f.setData('patient_id', v)} error={f.errors.patient_id} />
                        <label>แพทย์
                            <select value={f.data.doctor_id} onChange={(e) => f.setData('doctor_id', e.target.value)}>
                                <option value="">เลือกแพทย์</option>
                                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
                            </select>
                            <Err m={f.errors.doctor_id} />
                        </label>
                        <label>วันที่<input type="date" value={f.data.appointment_date} onChange={(e) => f.setData('appointment_date', e.target.value)} /><Err m={f.errors.appointment_date} /></label>
                        <div className="two">
                            <label>เริ่ม<input type="time" value={f.data.start_time} onChange={(e) => f.setData('start_time', e.target.value)} /><Err m={f.errors.start_time} /></label>
                            <label>สิ้นสุด<input type="time" value={f.data.end_time} onChange={(e) => f.setData('end_time', e.target.value)} /><Err m={f.errors.end_time} /></label>
                        </div>
                        <button disabled={f.processing}>สร้างนัด</button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
