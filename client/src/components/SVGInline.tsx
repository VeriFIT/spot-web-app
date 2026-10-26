// Helper component to render SVG strings
export function SVGInline({ svg, className }: { svg?: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg ?? "" }} />;
}
