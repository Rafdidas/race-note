import Link from "next/link";

const links = [
  { href: "/#this-week", label: "This Week" },
  { href: "/calendar", label: "Calendar" },
  { href: "/series", label: "Series" },
];

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header__inner container">
        <Link className="public-header__brand" href="/" aria-label="RaceNote 홈">
          R/N
          <span>RaceNote</span>
        </Link>

        <nav className="public-header__nav" aria-label="주요 메뉴">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="public-header__meta">
          <span className="public-header__signal" aria-hidden="true" />
          KST · SEOUL
        </div>
      </div>
    </header>
  );
}
