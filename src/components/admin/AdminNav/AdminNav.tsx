import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard", index: "01" },
  { href: "/admin/sync", label: "Sync logs", index: "02" },
  { href: "/admin/races", label: "Races", index: "03" },
];

export function AdminNav() {
  return (
    <aside className="admin-nav">
      <Link className="admin-nav__brand" href="/admin">
        <strong>R/N</strong>
        <span>Control room</span>
      </Link>
      <nav aria-label="관리자 메뉴">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            <span>{link.index}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="admin-nav__footer">
        <span className="admin-nav__signal" aria-hidden="true" />
        Mock data mode
      </div>
    </aside>
  );
}
