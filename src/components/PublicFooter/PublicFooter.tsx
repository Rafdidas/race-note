import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__inner container">
        <div>
          <strong>R/N</strong>
          <p className="type-korean">이번 주 모터스포츠를 위한 짧고 정확한 브리핑.</p>
        </div>
        <div className="public-footer__links">
          <Link href="/calendar">Calendar</Link>
          <Link href="/series">Series Guide</Link>
          <span>© 2026 RaceNote</span>
        </div>
      </div>
    </footer>
  );
}
