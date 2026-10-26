import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import type { ComponentProps, ComponentType, ElementType } from "react";

import { CloseIcon } from "../../components/icons";
import { Ltl } from "../../components/Ltl";
import { Op, OpTable } from "./OpTable";
import { Term, Terms } from "./Terms";
import About from "./sections/about.mdx";
import Acceptance from "./sections/acceptance.mdx";
import LtlInfix from "./sections/ltl-infix.mdx";
import LtlPrefix from "./sections/ltl-prefix.mdx";
import OperationModes from "./sections/operation-modes.mdx";
import PslInfix from "./sections/psl-infix.mdx";

/** The help panel, which sits beside the formula panels. */
const HelpPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1),
  paddingTop: theme.spacing(1),
  width: 640 - 16,
  [theme.breakpoints.down("sm")]: {
    marginLeft: 0,
    marginRight: 0,
  },
  "& h5": { color: theme.palette.primary.main },
}));

/** The row holding the close button and the title. */
const HelpIcons = styled("div")(({ theme }) => ({
  overflow: "auto",
  marginRight: theme.spacing(1),
}));

const CloseButton = styled(IconButton)({ float: "right" });

/** The title of the panel. */
const HelpTitle = styled(Typography)({ padding: 4 });

/**
 * A collapsible section. Its border stays visible while it is open, and the
 * sections sit flush against each other.
 */
const HelpAccordion = styled(Accordion)({
  "&.Mui-expanded": {
    margin: 0,
    "&:before": { opacity: 1 },
  },
});

/** A paragraph of a section, spaced like the rest of the prose. */
function MdxParagraph(props: ComponentProps<typeof Typography>) {
  return <Typography variant="body1" gutterBottom {...props} />;
}

/** A sub-heading of a section, in the accent colour like a label. */
function MdxSubheading(props: ComponentProps<typeof Typography>) {
  return <Typography variant="body2" color="primary" {...props} />;
}

/** The components the Markdown sections are written against. */
const components: Record<string, ElementType> = {
  p: MdxParagraph,
  h3: MdxSubheading,
  Ltl,
  OpTable,
  Op,
  Terms,
  Term,
};

type Section = {
  title: string;
  Body: ComponentType<{ components?: Record<string, ElementType> }>;
};

/** The sections of the panel, in the order they are shown. */
const SECTIONS: Section[] = [
  { title: "About", Body: About },
  { title: "Operation modes", Body: OperationModes },
  { title: "LTL Infix Syntax", Body: LtlInfix },
  { title: "LTL Prefix Syntax", Body: LtlPrefix },
  { title: "PSL Infix Syntax", Body: PslInfix },
  { title: "Acceptance conditions", Body: Acceptance },
];

export function Help({ onClose }: { onClose: () => void }) {
  return (
    <HelpPaper>
      <HelpIcons>
        <CloseButton color="primary" onClick={onClose} aria-label="close">
          <CloseIcon />
        </CloseButton>
        <HelpTitle variant="h5" color="primary" align="center" gutterBottom>
          Help
        </HelpTitle>
      </HelpIcons>

      {SECTIONS.map(({ title, Body }) => (
        <HelpAccordion key={title}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography component="span" variant="h6">
              {title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Body components={components} />
          </AccordionDetails>
        </HelpAccordion>
      ))}
    </HelpPaper>
  );
}
