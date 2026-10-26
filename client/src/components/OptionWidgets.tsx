import { styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import ListItemButton from "@mui/material/ListItemButton";
import MenuItem from "@mui/material/MenuItem";

// The option widgets that the rewrite and translate panels share: a bordered
// group holding a set of related options, and the entries of the pop-up menus
// that pick one output syntax or one acceptance condition.

// Both groups are rendered as a `<fieldset>`, so the options inside them are
// grouped semantically and the legend is announced. Material's `styled` drops
// the polymorphic `component` prop, hence the assertions to `FormControl`.

/** A bordered group of options, drawn in `color`. */
function optionGroup(color: "primary" | "secondary") {
  return styled(FormControl)(({ theme }) => ({
    padding: 8,
    margin: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 4,
    borderColor: theme.palette[color].main,
    "& legend": {
      paddingLeft: 8,
      paddingRight: 8,
      backgroundColor: "white",
      color: theme.palette[color].light,
    },
    // Only the expert legend is drawn in a stronger colour while focused; the
    // primary one already uses its light shade.
    ...(color === "secondary"
      ? { "& legend.Mui-focused": { color: theme.palette.secondary.main } }
      : {}),
  })) as typeof FormControl;
}

/** Bordered group of options that belong to the main task of the panel. */
export const OptionGroup = optionGroup("primary");

/** Bordered group of options that only expert mode reveals. */
export const ExpertOptionGroup = optionGroup("secondary");

/** The closed state of a syntax or acceptance menu. */
export const ChoiceListItem = styled(ListItemButton)(({ theme }) => ({
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 4,
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

/** One entry of an open syntax or acceptance menu. */
export const ChoiceMenuItem = styled(MenuItem)(({ theme }) => ({
  "&:focus": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));
