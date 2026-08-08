interface PitchingPageHeaderProps {
  title: string;
  description: string;
}

export function PitchingPageHeader({ title, description }: PitchingPageHeaderProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-text-main">{title}</h1>
      <p className="text-sm text-charcoal">{description}</p>
    </div>
  );
}
