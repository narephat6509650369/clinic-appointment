import { useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Layout, { Err } from '../../Layout';

export default function Index({ patients, q }) {
    const [search, setSearch] = useState(q || '');
    const [editId, setEditId] = useState(null);
    const f = useForm({ first_name: '', last_name: '', phone: '', birth_date: '' });

    // debounce 300ms แล้วค่อยยิงค้นหาไปที่ server (ค้นหาฝั่ง DB ไม่ใช่ใน browser)
    useEffect(() => {
        if (search === (q || '')) return;
        const t = setTimeout(() => router.get('/patients', { q: search }, { preserveState: true, replace: true }), 300);
        return () => clearTimeout(t);
    }, [search]);

    const submit = (e) => {
        e.preventDefault();
        const opt = { preserveScroll: true, onSuccess: () => { f.reset(); setEditId(null); } };
        editId ? f.put(`/patients/${editId}`, opt) : f.post('/patients', opt);
    };
    const edit = (p) => {
        setEditId(p.id);
        f.setData({ first_name: p.first_name, last_name: p.last_name, phone: p.phone, birth_date: p.birth_date });
        window.scrollTo({ top: 0 });
    };
    const field = (name, label, type = 'text') => (
        <label>{label}
            <input type={type} value={f.data[name]} onChange={(e) => f.setData(name, e.target.value)} />
            <Err m={f.errors[name]} />
        </label>
    );

    return (
        <Layout>
            <h1>ผู้ป่วย</h1>
            <form className="card" onSubmit={submit}>
                <div className="row">
                    {field('first_name', 'ชื่อ')}
                    {field('last_name', 'นามสกุล')}
                    {field('phone', 'เบอร์โทร (081-234-5678 / +66812345678)')}
                    {field('birth_date', 'วันเกิด', 'date')}
                    <button disabled={f.processing}>{editId ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ป่วย'}</button>
                    {editId && <button type="button" className="ghost" onClick={() => { setEditId(null); f.reset(); f.clearErrors(); }}>ยกเลิก</button>}
                </div>
            </form>

            <div className="card">
                <label>ค้นหาด้วยชื่อ, HN หรือเบอร์โทร
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="เช่น สมศรี, HN000001, 0812345678" />
                </label>
                <table>
                    <thead><tr><th>HN</th><th>ชื่อ-นามสกุล</th><th>เบอร์โทร</th><th>วันเกิด</th><th>ลงทะเบียน</th><th /></tr></thead>
                    <tbody>
                        {patients.data.map((p) => (
                            <tr key={p.id}>
                                <td>{p.hn}</td><td>{p.first_name} {p.last_name}</td><td>{p.phone}</td>
                                <td>{p.birth_date}</td><td>{p.registered_at}</td>
                                <td><button className="ghost" onClick={() => edit(p)}>แก้ไข</button></td>
                            </tr>
                        ))}
                        {patients.data.length === 0 && <tr><td colSpan="6" className="muted">ไม่พบผู้ป่วย</td></tr>}
                    </tbody>
                </table>
                <div className="pager">
                    {patients.links.map((l, i) => l.url
                        ? <a key={i} href={l.url} className={l.active ? 'cur' : ''} onClick={(e) => { e.preventDefault(); router.get(l.url, {}, { preserveState: true }); }} dangerouslySetInnerHTML={{ __html: l.label }} />
                        : <span key={i} className="muted" dangerouslySetInnerHTML={{ __html: l.label }} />)}
                </div>
            </div>
        </Layout>
    );
}
