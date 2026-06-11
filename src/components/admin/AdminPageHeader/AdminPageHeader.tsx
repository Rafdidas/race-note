type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p className="type-korean">{description}</p>
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </header>
  );
}
