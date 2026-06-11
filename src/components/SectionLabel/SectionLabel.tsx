type SectionLabelProps = {
  index: string;
  children: React.ReactNode;
};

export function SectionLabel({ index, children }: SectionLabelProps) {
  return (
    <div className="section-label">
      <span className="section-label__index">{index}</span>
      <span className="section-label__divider">/</span>
      <span>{children}</span>
    </div>
  );
}
