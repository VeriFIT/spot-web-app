declare module "*.mdx" {
  import type { ComponentType, ElementType } from "react";

  /**
   * A Markdown document. The tags it uses are looked up in `components`, so a
   * section can write `<Ltl>` or `<OpTable>` and get the application's own
   * component instead of the matching HTML element.
   */
  const MdxDocument: ComponentType<{
    components?: Record<string, ElementType>;
  }>;

  export default MdxDocument;
}
