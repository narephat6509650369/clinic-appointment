import { useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Layout, { Err, PageHead, SearchIcon } from '../../Layout';

// label ของ pagination จาก Laravel เป็น HTML entity (&laquo; Previous / Next &raquo;) → แปลงเป็นข้อความธรรมดา
const pageLabel = (label) => label
    .replace(/&laquo;\s*Previous/i, '‹ ก่อนหน้า')
    .replace(/Next\s*&raquo;/i, 'ถัดไป ›')
    .replace(/&hellip;/g, '…');

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const field = (name, label, type = 'text', hint) => (
        <label>{label}
            <input type={type} placeholder={hint} value={f.data[name]} onChange={(e) => f.setData(name, e.target.value)} />
            <Err m={f.errors[name]} />
        </label>
    );

    return (
        <Layout>
            <PageHead eyebrow="Patients" title="ผู้ป่วย">ลงทะเบียน ค้นหา และแก้ไขข้อมูลผู้ป่วย</PageHead>

            <form className={`card ${editId ? 'editing' : ''}`} onSubmit={submit}>
                <div className="card-title">{editId ? 'แก้ไขข้อมูลผู้ป่วย' : 'เพิ่มผู้ป่วยใหม่'}</div>
                <div className="row">
                    {field('first_name', 'ชื่อ')}
                    {field('last_name', 'นามสกุล')}
                    {field('phone', 'เบอร์โทร', 'text', '081-234-5678 หรือ +66812345678')}
                    {field('birth_date', 'วันเกิด', 'date')}
                    <button disabled={f.processing}>{editId ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ป่วย'}</button>
                    {editId && <button type="button" className="ghost" onClick={() => { setEditId(null); f.reset(); f.clearErrors(); }}>ยกเลิก</button>}
                </div>
            </form>

            <div className="card">
                <label>ค้นหาด้วยชื่อ, HN หรือเบอร์โทร
                    <div className="search">
                        <SearchIcon />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="เช่น สมศรี, HN000001, 0812345678" />
                    </div>
                </label>

                <div className="table-wrap">
                    <table>
                        <thead><tr><th>HN</th><th>ชื่อ-นามสกุล</th><th>เบอร์โทร</th><th>วันเกิด</th><th>ลงทะเบียน</th><th><span className="sr">จัดการ</span></th></tr></thead>
                        <tbody>
                            {patients.data.map((p) => (
                                <tr key={p.id}>
                                    <td data-label="HN"><span className="hn">{p.hn}</span></td>
                                    <td data-label="ชื่อ-นามสกุล"><b>{p.first_name} {p.last_name}</b></td>
                                    <td data-label="เบอร์โทร" className="num">{p.phone}</td>
                                    <td data-label="วันเกิด" className="num">{p.birth_date}</td>
                                    <td data-label="ลงทะเบียน" className="num muted">{p.registered_at}</td>
                                    <td data-label=""><button className="ghost sm" onClick={() => edit(p)}>แก้ไข</button></td>
                                </tr>
                            ))}
                            {patients.data.length === 0 && <tr><td colSpan="6" className="empty-cell">ไม่พบผู้ป่วย</td></tr>}
                        </tbody>
                    </table>
                </div>

                <nav className="pager" aria-label="เลขหน้า">
                    {patients.links.map((l, i) => l.url
                        ? <a key={i} href={l.url} className={l.active ? 'cur' : ''} aria-current={l.active ? 'page' : undefined} onClick={(e) => { e.preventDefault(); router.get(l.url, {}, { preserveState: true }); }}>{pageLabel(l.label)}</a>
                        : <span key={i}>{pageLabel(l.label)}</span>)}
                </nav>
            </div>
        </Layout>
    );
}
