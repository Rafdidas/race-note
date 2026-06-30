import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";

const links = [
  { href: "/", label: "시즌" },
  { href: "/f1/drivers", label: "드라이버" },
  { href: "/f1/teams", label: "팀" },
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
          <ThemeToggle />
          <span className="public-header__location">KST · SEOUL</span>
        </div>
      </div>
    </header>
  );
}
