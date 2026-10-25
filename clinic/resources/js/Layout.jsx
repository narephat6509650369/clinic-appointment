import { Link, usePage } from '@inertiajs/react';

const links = [['/appointments/today', 'นัดหมายวันนี้'], ['/patients', 'ผู้ป่วย'], ['/reports', 'รายงานสรุป']];

export default function Layout({ children }) {
    const { url, props } = usePage();
    return (
        <>
            <nav>
                <b>Luxury Clinic</b>
                {links.map(([href, label]) => (
                    <Link key={href} href={href} className={url.startsWith(href) ? 'on' : ''}>{label}</Link>
                ))}
            </nav>
            <main>
                {props.flash?.success && <div className="flash">{props.flash.success}</div>}
                {children}
            </main>
        </>
    );
}

export const Err = ({ m }) => (m ? <small className="err">{m}</small> : null);
