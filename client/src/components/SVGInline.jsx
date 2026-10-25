// Helper component to render SVG strings
export function SVGInline({ svg, className }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}
