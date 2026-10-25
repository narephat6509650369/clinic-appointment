import { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout, { Err } from '../../Layout';

const LABEL = { waiting: 'รอ', arrived: 'มาแล้ว', cancelled: 'ยกเลิก' };

export default function Index({ from, to, newPatients, total, byStatus, errors }) {
    const [range, setRange] = useState({ from, to });
    const go = (e) => { e.preventDefault(); router.get('/reports', range, { preserveState: true }); };

    return (
        <Layout>
            <h1>รายงานสรุป</h1>
            <form className="card row" onSubmit={go}>
                <label>ตั้งแต่<input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
                <label>ถึง<input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /><Err m={errors?.to} /></label>
                <button>แสดงรายงาน</button>
            </form>
            <div className="stats">
                <div className="card stat"><b>{newPatients.toLocaleString()}</b>ผู้ป่วยใหม่</div>
                <div className="card stat"><b>{total.toLocaleString()}</b>นัดทั้งหมด</div>
                {Object.entries(byStatus).map(([s, c]) => (
                    <div key={s} className="card stat"><b>{c.toLocaleString()}</b>นัด{LABEL[s]}</div>
                ))}
            </div>
        </Layout>
    );
}
