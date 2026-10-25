import React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import { getVersions, versionsUrl } from "../api/client";

export function Versions(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [versions, setVersions] = React.useState([]);

  // The list is fetched once; abort it if the menu goes away before it lands.
  React.useEffect(() => {
    const controller = new AbortController();
    getVersions(versionsUrl(), controller.signal)
      .then((vers) => {
        if (controller.signal.aborted) return;
        setVersions([...vers, ["React", React.version, "https://reactjs.org/"]]);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setVersions([[error.message, null, null]]);
      });
    return () => controller.abort();
  }, []);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const { classes } = props;
  return (
    <div>
      <Button className={classes.versions} color="secondary" onClick={handleOpen}>
        Versions
      </Button>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Table className={classes.versiontable}>
          <TableBody>
            {versions.map(([tool, version, url]) => {
              return (
                <TableRow key={tool}>
                  <TableCell component="th" scope="row">
                    <a href={url}>{tool}</a>
                  </TableCell>
                  <TableCell>{version}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Menu>
    </div>
  );
}
