import type { Metadata } from "next";

export const metadata: Metadata = { title: "Login" };

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <div className="admin-login__panel">
        <div className="admin-login__brand">
          <strong>R/N</strong>
          <span>Control room access</span>
        </div>
        <div>
          <span className="admin-login__index">A/00 · Admin login</span>
          <h1>RaceNote<br />Admin</h1>
          <p className="type-korean">운영 화면은 관리자 세션 연결 전까지 목업 모드로 제공됩니다.</p>
        </div>
        <form className="admin-login__form">
          <label htmlFor="admin-password">Password</label>
          <input disabled id="admin-password" name="password" placeholder="Authentication pending" type="password" />
          <button className="admin-button admin-button--primary" disabled type="submit">Login</button>
        </form>
      </div>
    </main>
  );
}
