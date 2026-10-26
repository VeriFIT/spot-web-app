import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { CloseIcon } from "../../components/icons";
import { Ltl } from "../../components/Ltl";

/** The help panel, which sits beside the formula panels. */
const HelpPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1),
  paddingTop: theme.spacing(1),
  width: 640 - 16,
  [theme.breakpoints.down("sm")]: {
    marginLeft: 0,
    marginRight: 0,
  },
  "& h2": { color: theme.palette.primary.main },
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

/** Grid of the notations accepted for one category of operators. */
const OpTableBox = styled("div")({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  width: "100%",
  justifyContent: "space-around",
});

const OpPair = styled("div")({
  display: "block",
  padding: 2,
  margin: 2,
  backgroundColor: "#EEEEEE",
});

const OpDesc = styled("div")({ float: "left" });
const OpSyn = styled("div")({ float: "right" });

function OpTable(array, width) {
  return (
    <OpTableBox>
      {array.map((value) => {
        return (
          <OpPair key={value[0]} style={{ width: width }}>
            <OpDesc>{value[0]}:</OpDesc>
            <OpSyn>{value[1]}</OpSyn>
          </OpPair>
        );
      })}
    </OpTableBox>
  );
}

export function Help(props) {
  return (
    <HelpPaper>
      <HelpIcons>
        <CloseButton color="primary" onClick={props.onClose} aria-label="close">
          <CloseIcon />
        </CloseButton>
        <HelpTitle variant="headline" color="primary" align="center" gutterBottom>
          Help
        </HelpTitle>
      </HelpIcons>

      <HelpAccordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">About</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="div">
            <Typography variant="body1" gutterBottom>
              This web application is built using the services of{" "}
              <a href="https://spot.lre.epita.fr/">Spot</a> running on a shared computer.
              For serious uses, you can answer similar questions using the{" "}
              <a href="https://spot.lre.epita.fr/tools.html">command-line tools</a>, or by{" "}
              <a href="https://spot.lre.epita.fr/tut.html">
                writing some C++ or Python code
              </a>
              .
            </Typography>
            <Typography variant="body1" gutterBottom>
              The source code for this application can be found{" "}
              <a href="https://gitlab.lre.epita.fr/spot/spot-web-app/">on our gitlab</a>,
              and is distributed under the{" "}
              <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU GPL v3</a>{" "}
              license.
            </Typography>
            <Typography variant="body1" gutterBottom>
              For any question not answered in this small help text, or for reporting any
              bug, please send an email to{" "}
              <a href="mailto:spot@lrde.epita.fr">the Spot mailing list</a>.
            </Typography>
          </Typography>
        </AccordionDetails>
      </HelpAccordion>

      <HelpAccordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Operation modes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="div" variant="body1">
            The application has four modes of operation that you can select at its top:
            <dl>
              <dt>
                <Typography variant="body2">Rewrite</Typography>
              </dt>
              <dd>
                for rewriting a formula (changing syntaxes, simplifying, removing some
                operators)
              </dd>
              <dt>
                <Typography variant="body2">Study</Typography>
              </dt>
              <dd>for computing various properties of a formula</dd>
              <dt>
                <Typography variant="body2">Compare</Typography>
              </dt>
              <dd>for comparing two LTL formulas</dd>
              <dt>
                <Typography variant="body2">Translate</Typography>
              </dt>
              <dd>for constructing an automaton equivalent to a given formula</dd>
            </dl>
          </Typography>
        </AccordionDetails>
      </HelpAccordion>

      <HelpAccordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">LTL Infix Syntax</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="div">
            <Typography variant="body1" gutterBottom>
              To accommodate the syntaxes of different tools, Spot supports alternative
              representations for many operators. For the semantics of all operators see{" "}
              <a href="https://spot.lre.epita.fr/tl.pdf">this document</a>.
            </Typography>
            <Typography variant="body2" color="primary">
              Atomic propositions
            </Typography>
            <Typography variant="body1" gutterBottom>
              Use alphanumeric identifiers or double-quoted strings for atomic
              propositions, and parentheses for grouping. Identifiers cannot start with
              the letter of a prefix operator (<Ltl f="F" />, <Ltl f="G" />, or{" "}
              <Ltl f="X" />
              ): for instance <Ltl f="GFa" /> means <Ltl f="G(F(a))" />. Use{" "}
              <Ltl f='"GFa"' />, with double quotes, if you really want to refer to{" "}
              <Ltl f="GFa" /> as a proposition. Conversely, infix letter operators are not
              assumed to be operators if they are part of an identifier: <Ltl f="aUb" />{" "}
              is an atomic proposition, unlike <Ltl f="a&nbsp;U&nbsp;b" /> and{" "}
              <Ltl f="(a)U(b)" />.
            </Typography>
            <Typography variant="body2" color="primary">
              Boolean constants
            </Typography>
            <Typography variant="body1" gutterBottom>
              Use <Ltl f="1" /> or <Ltl f="0" />, or also <Ltl f="true" /> or{" "}
              <Ltl f="false" /> (case insensitive).
            </Typography>
            <Typography variant="body2" color="primary">
              Boolean operators
            </Typography>
            <Typography component="div" variant="body1" gutterBottom>
              The following Boolean operators are supported:
              {OpTable(
                [
                  [
                    "and",
                    <>
                      <Ltl f="&amp;" />, <Ltl f="&amp;&amp;" />, <Ltl f="/\" /*"*/ />
                    </>,
                  ],
                  [
                    "or",
                    <>
                      <Ltl f="|" />, <Ltl f="||" />, <Ltl f="\/" />, <Ltl f="+" />
                    </>,
                  ],
                  [
                    "implies",
                    <>
                      <Ltl f="->" />, <Ltl f="-->" />, <Ltl f="=>" />
                    </>,
                  ],
                  [
                    "equivalent",
                    <>
                      <Ltl f="<->" />, <Ltl f="<-->" />, <Ltl f="<=>" />
                    </>,
                  ],
                  [
                    "not",
                    <>
                      <Ltl f="!" /> (prefix), <Ltl f="~" /> (prefix)
                    </>,
                  ],
                  [
                    "exclusive or",
                    <>
                      <Ltl f="^" />, <Ltl f="xor" />
                    </>,
                  ],
                ],
                "180px"
              )}
              For compatibility with{" "}
              <a href="http://www.ist.tugraz.at/staff/bloem/wring.html">Wring</a>
              , atomic propositions can be followed by <Ltl f="=1" /> or <Ltl f="=0" /> to
              specify their polarity. For instance <Ltl f="a=0 U b=1" /> is equivalent to{" "}
              <Ltl f="!a U b" />.
            </Typography>
            <Typography variant="body2" color="primary">
              Temporal Operators
            </Typography>
            <Typography component="div" variant="body1" gutterBottom>
              The following binary operators are supported:
              {OpTable(
                [
                  ["strong until", <Ltl key="U" f="U" />],
                  ["weak until", <Ltl key="W" f="W" />],
                  ["strong release", <Ltl key="M" f="M" />],
                  [
                    "weak release",
                    <>
                      <Ltl f="R" />, <Ltl f="V" />
                    </>,
                  ],
                ],
                "120px"
              )}
              The following unary (prefix) operators are supported:
              {OpTable(
                [
                  [
                    "next",
                    <>
                      <Ltl f="X" />, <Ltl f="()" />
                    </>,
                  ],
                  [
                    "eventually",
                    <>
                      <Ltl f="F" />, <Ltl f="<>" />
                    </>,
                  ],
                  [
                    "globally",
                    <>
                      <Ltl f="G" />, <Ltl f="[]" />
                    </>,
                  ],
                ],
                "120px"
              )}
              Additionally, <Ltl f="X[n]" />, <Ltl f="F[n..m]" />, and <Ltl f="G[n..m]" />{" "}
              are syntactic sugar for differents types of repetition of the <Ltl f="X" />{" "}
              operator. For instance <Ltl f="F[3..5]p" /> is short for{" "}
              <Ltl f="XXX(p|X(p|Xp))" />.
            </Typography>
          </Typography>
        </AccordionDetails>
      </HelpAccordion>

      <HelpAccordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">LTL Prefix Syntax</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="div">
            <Typography variant="body1" gutterBottom>
              If (and only if!) parsing the input formula using the infix syntax failed,
              the application will attempt to parse the formula using a prefix syntax
              (Polish notation) that should be a superset of what tools like{" "}
              <a href="http://www.tcs.hut.fi/Software/maria/tools/lbt/">LBT</a>,{" "}
              <a href="http://www.tcs.hut.fi/Software/lbtt/">LBTT</a>,{" "}
              <a href="http://tcs.legacy.ics.tkk.fi/users/tlatvala/scheck/">scheck</a> or{" "}
              <a href="http://www.ltl2dstar.de/">ltl2dstar</a> can read.
            </Typography>
            <Typography component="div" variant="body1">
              The following prefix operators are supported:
              {OpTable(
                [
                  ["true", <Ltl key="t" f="t" />],
                  ["false", <Ltl key="f" f="f" />],
                  ["not", <Ltl key="!" f="!" />],
                  ["and", <Ltl key="&" f="&" />],
                  ["or", <Ltl key="|" f="|" />],
                  ["implication", <Ltl key="i" f="i" />],
                  ["equivalence", <Ltl key="e" f="e" />],
                  ["xor", <Ltl key="^" f="^" />],
                  ["next", <Ltl key="X" f="X" />],
                  ["eventually", <Ltl key="F" f="F" />],
                  ["globally", <Ltl key="G" f="G" />],
                  ["strong until", <Ltl key="U" f="U" />],
                  ["weak release", <Ltl key="V" f="V" />],
                  ["strong release", <Ltl key="M" f="M" />],
                  ["weak until", <Ltl key="W" f="W" />],
                ],
                "120px"
              )}
              Double-quoted strings, as well as identifiers that do not look like
              operators, are assumed to be atomic propositions.
            </Typography>
          </Typography>
        </AccordionDetails>
      </HelpAccordion>

      <HelpAccordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">PSL Infix Syntax</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="div">
            <Typography variant="body1" gutterBottom>
              A subset of PSL can be used to express linear properties that are more
              expressive than LTL. For the semantics of all operators see{" "}
              <a href="https://spot.lre.epita.fr/tl.pdf">this document</a>.
            </Typography>
            <Typography variant="body1" gutterBottom>
              If you put the application in "expert mode", clicking on the dice will
              generate a random PSL formula instead of generating a random LTL formula.
            </Typography>
            <Typography variant="body2" color="primary">
              Semi-Extended Regular Expression (SERE)
            </Typography>
            <Typography variant="body1" gutterBottom>
              Those semi-extended regular expressions match finite prefixes, and are
              constructed above Boolean expressions built using the standard Boolean
              operators. A new constant, <Ltl f="[*0]" /> represents the empty word.
            </Typography>
            <Typography variant="body2">
              The following binary operators are supported:
            </Typography>
            <Typography component="div" variant="body1" gutterBottom>
              {OpTable(
                [
                  [
                    "concatenation",
                    <>
                      <Ltl f=";" />, <Ltl f="##1" />
                    </>,
                  ],
                  [
                    "fusion",
                    <>
                      <Ltl f=":" />, <Ltl f="##0" />
                    </>,
                  ],
                  [
                    "union",
                    <>
                      <Ltl f="|" />, <Ltl f="||" />, <Ltl f="\/" />, <Ltl f="+" />
                    </>,
                  ],
                  ["intersection", <Ltl key="&amp;&amp;" f="&amp;&amp;" />],
                  ["NLM-intersection", <Ltl key="&amp;" f="&amp;" />],
                ],
                "140px"
              )}
              The "Non-length-matching intersection" accepts words that match one operand
              and that have a prefix matching the other operand.
            </Typography>
            <Typography component="div" variant="body2">
              The following postfix unary operators are supported:
              {OpTable(
                [
                  [
                    "Kleene star",
                    <>
                      <Ltl f="*" />, <Ltl f="[*]" />, <Ltl f="[*i..j]" />
                    </>,
                  ],
                  ["Kleene plus", <Ltl key="[+]" f="[+]" />],
                  [
                    "fusion star",
                    <>
                      <Ltl f="[:*]" />, <Ltl f="[:*i..j]" />
                    </>,
                  ],
                  ["fusion plus", <Ltl key="[:+]" f="[:+]" />],
                  ["goto", <Ltl key="[->i..j]" f="[->i..j]" />],
                  ["nonconseq. rep.", <Ltl key="[=i..j]" f="[=i..j]" />],
                ],
                "200px"
              )}
            </Typography>
            <Typography component="div" variant="body2">
              The following prefix unary operator is used as a function:
              {OpTable(
                [
                  [
                    "first match",
                    <>
                      <Ltl f="first_match(…)" />
                    </>,
                  ],
                ],
                "200px"
              )}
            </Typography>
            <Typography variant="body2" color="primary">
              SERE-LTL Bindings Operators
            </Typography>
            <Typography component="div" variant="body1" gutterBottom>
              In the following, <Ltl f="r" /> denotes a SERE, and <Ltl f="f" /> denotes
              any PSL or LTL formula.
              {OpTable(
                [
                  [
                    "universal suffix implication (a.k.a. trigger)",
                    <>
                      <Ltl f="{r}[]->f" />, <Ltl f="{r}|->f" />, <Ltl f="{r}(f)" />
                    </>,
                  ],
                  [
                    "existential suffix implication (a.k.a. seq)",
                    <Ltl key="{r}<>->f" f="{r}<>->f" />,
                  ],
                  [
                    "non-overlapping universal suffix implication",
                    <>
                      <Ltl f="{r}[]=>f" />, <Ltl f="{r}|=>f" />
                    </>,
                  ],
                  [
                    "non-overlapping existential suffix implication",
                    <Ltl key="{r}<>=>f" f="{r}<>=>f" />,
                  ],
                  ["weak closure", <Ltl key="{r}" f="{r}" />],
                  ["strong closure", <Ltl key="{r}!" f="{r}!" />],
                ],
                "300px"
              )}
            </Typography>
          </Typography>
        </AccordionDetails>
      </HelpAccordion>

      <HelpAccordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Acceptance conditions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography component="div">
            <Typography component="div" variant="body1" gutterBottom>
              Formulas can be translated into ω-automata with various types of acceptance
              conditions (Generalized Büchi acceptance is selected by default).
              <dl>
                <dt>
                  <Typography variant="body2">monitor</Typography>
                </dt>
                <dd>
                  In a monitor, the only words that are rejected are those that cannot be
                  read by the automaton. Such automata will accept any finite prefix that
                  can be extended into an infinite word accepted by the formula. Only
                  safety properties can be recognized precisely. If a non-safety formula
                  is translated into a monitor, the resulting automaton will accept a
                  superset of the specified language.
                </dd>
                <dt>
                  <Typography variant="body2">Büchi acceptance</Typography>
                </dt>
                <dd>
                  Büchi automata have a set of accepting states represented with double
                  circles. An infinite word is accepted if it visits some accepting state
                  infinitely often. (For historical reason, only state-based Büchi
                  acceptance is supported.)
                </dd>
                <dt>
                  <Typography variant="body2">co-Büchi acceptance</Typography>
                </dt>
                <dd>
                  Co-Büchi automata have a set of <i>rejecting states</i> represented with
                  double circles (when state-based acceptance is used) or{" "}
                  <i>rejecting transitions</i> annotated with a "⓿". An infinite word is
                  accepted if it visits elements of the rejecting set a finite number of
                  times.
                </dd>
                <dt>
                  <Typography variant="body2">generalized Büchi acceptance</Typography>
                </dt>
                <dd>
                  In generalized Büchi automata, multiple sets of states or transitions
                  are used. States or transitions are annotated by circled numbers (like
                  ⓿) denoting the sets they belong to. A run is accepted if it visits a
                  state or transitions of each set infinitely often.
                </dd>
                <dt>
                  <Typography variant="body2">parity acceptance</Typography>
                </dt>
                <dd>
                  In automata with parity acceptance, multiple sets of states or
                  transitions are used. States or transitions are annotated by circled
                  numbers (like ⓿) denoting the sets they belong to. A run is accepted if
                  the maximum or minimum set number visited infinitely often is odd or
                  even. The choice between min or max, and odd or even, is indicated at
                  the top of the automaton and can be forced with some options. The{" "}
                  <b>colored</b> option forces each transitions (or state) to belong to
                  exactly one acceptance set; this is usually what people working with
                  parity automata are expecting.
                </dd>
                <dt>
                  <Typography variant="body2">Emerson-Lei acceptance</Typography>
                </dt>
                <dd>
                  When using Emerson-Lei acceptance, the acceptance condition produced can
                  be any positive boolean formula over terms like <b>Fin(⓿)</b> (meaning
                  that elements of set ⓿ should be seen <i>finitely</i> often) or{" "}
                  <b>Inf(⓿)</b> (<i>infinitely</i> often). Multiple acceptance sets are
                  used.
                </dd>
              </dl>
              By default, automata with transition-based acceptance are produced, except
              for monitors (where it makes no sense) and Büchi automata (for historical
              reasons). The translation constraint "force state-based acc." can be used to
              force the produced automata to use state-based acceptance, possibly
              increasing the number of states. However, even when automata are displayed
              as state-based, they are stored using transition-based acceptance
              internally: this can be seen using the "force transition-based acc."{" "}
              <i>display</i> option. This explains why these two options are not mutually
              exclusive.
            </Typography>
          </Typography>
        </AccordionDetails>
      </HelpAccordion>
    </HelpPaper>
  );
}
