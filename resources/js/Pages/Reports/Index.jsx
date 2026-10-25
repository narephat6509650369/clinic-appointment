import { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout, { Err, PageHead } from '../../Layout';

const LABEL = { waiting: 'รอ', arrived: 'มาแล้ว', cancelled: 'ยกเลิก' };

export default function Index({ from, to, newPatients, total, byStatus, errors }) {
    const [range, setRange] = useState({ from, to });
    const go = (e) => { e.preventDefault(); router.get('/reports', range, { preserveState: true }); };
    const pct = (c) => (total > 0 ? Math.round((c / total) * 100) : 0);

    return (
        <Layout>
            <PageHead eyebrow="Reports" title="รายงานสรุป">ภาพรวมผู้ป่วยใหม่และนัดหมายตามช่วงเวลาที่เลือก</PageHead>

            <form className="card row" onSubmit={go}>
                <label>ตั้งแต่<input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
                <label>ถึง<input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /><Err m={errors?.to} /></label>
                <button>แสดงรายงาน</button>
            </form>

            <div className="stats">
                <div className="card stat hero"><span>ผู้ป่วยใหม่</span><b>{newPatients.toLocaleString()}</b><small style={{ color: '#bcd3cd' }}>ลงทะเบียนในช่วงนี้</small></div>
                <div className="card stat gold"><span>นัดทั้งหมด</span><b>{total.toLocaleString()}</b><small>ทุกสถานะรวมกัน</small></div>
                {Object.entries(byStatus).map(([s, c]) => (
                    <div key={s} className={`card stat ${s}`}>
                        <span>นัด{LABEL[s]}</span>
                        <b>{c.toLocaleString()}</b>
                        <small>{pct(c)}% ของนัดทั้งหมด</small>
                    </div>
                ))}
            </div>

            {total > 0 && (
                <div className="card" style={{ marginTop: 18 }}>
                    <div className="card-title">สัดส่วนสถานะนัดหมาย</div>
                    <div className="bar" role="img" aria-label={Object.entries(byStatus).map(([s, c]) => `${LABEL[s]} ${pct(c)}%`).join(', ')}>
                        {Object.entries(byStatus).map(([s, c]) => c > 0 && <i key={s} className={s} style={{ width: `${(c / total) * 100}%` }} />)}
                    </div>
                    <div className="chips">
                        {Object.entries(byStatus).map(([s, c]) => <span key={s} className="chip"><span className={`badge ${s}`}>{LABEL[s]}</span><b>{c.toLocaleString()}</b></span>)}
                    </div>
                </div>
            )}
        </Layout>
    );
}
