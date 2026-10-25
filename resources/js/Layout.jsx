import { Link, usePage } from '@inertiajs/react';

const Icon = ({ children }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const links = [
    ['/appointments/today', 'นัดหมายวันนี้', <Icon key="a"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 3v3M16 3v3" /></Icon>],
    ['/patients', 'ผู้ป่วย', <Icon key="p"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.7 2.7 2.4 3 5.2" /></Icon>],
    ['/reports', 'รายงานสรุป', <Icon key="r"><path d="M4 20V11M10 20V4M16 20v-6M2 20h20" /></Icon>],
];

export const SearchIcon = () => (
    <Icon><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Icon>
);

export const PageHead = ({ eyebrow, title, children }) => (
    <header className="page-head">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {children && <p>{children}</p>}
    </header>
);

export const Err = ({ m }) => (m ? <small className="err" role="alert">{m}</small> : null);

export default function Layout({ children }) {
    const { url, props } = usePage();
    const today = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="shell">
            <aside className="side">
                <Link href="/appointments/today" className="brand">
                    <span className="brand-mark" aria-hidden="true">L</span>
                    <span className="brand-name">Luxury Clinic<small>Appointment</small></span>
                </Link>
                <nav className="menu" aria-label="เมนูหลัก">
                    {links.map(([href, label, icon]) => (
                        <Link key={href} href={href} aria-current={url.startsWith(href) ? 'page' : undefined}>
                            {icon}{label}
                        </Link>
                    ))}
                </nav>
                <div className="side-foot"><b>วันนี้</b>{today}</div>
            </aside>
            <main className="content">
                {props.flash?.success && <div className="flash" role="status">{props.flash.success}</div>}
                {children}
            </main>
        </div>
    );
}
