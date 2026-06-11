import { SectionLabel } from "@/components/SectionLabel/SectionLabel";

type PageHeaderProps = {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
};

export function PageHeader({ index, eyebrow, title, description, meta }: PageHeaderProps) {
  return (
    <header className="page-header container">
      <SectionLabel index={index}>{eyebrow}</SectionLabel>
      <div className="page-header__grid">
        <h1>{title}</h1>
        <div className="page-header__copy">
          <p className="type-korean">{description}</p>
          {meta && <span>{meta}</span>}
        </div>
      </div>
    </header>
  );
}
