import { styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import ListItem from "@mui/material/ListItem";
import MenuItem from "@mui/material/MenuItem";

// The option widgets that the rewrite and translate panels share: a bordered
// group holding a set of related options, and the entries of the pop-up menus
// that pick one output syntax or one acceptance condition.

/** Bordered group of options that belong to the main task of the panel. */
export const OptionGroup = styled(FormControl)(({ theme }) => ({
  padding: 8,
  margin: 5,
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 4,
  borderColor: theme.palette.primary.main,
  "& legend": {
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: "white",
    color: theme.palette.primary.light,
  },
}));

/** Bordered group of options that only expert mode reveals. */
export const ExpertOptionGroup = styled(FormControl)(({ theme }) => ({
  padding: 8,
  margin: 5,
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 4,
  borderColor: theme.palette.secondary.main,
  "& legend": {
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: "white",
    color: theme.palette.secondary.light,
  },
  "& legend.Mui-focused": {
    color: theme.palette.secondary.main,
  },
}));

/** The closed state of a syntax or acceptance menu. */
export const ChoiceListItem = styled(ListItem)(({ theme }) => ({
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
