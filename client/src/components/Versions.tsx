import React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/material/styles";

import { getVersions, versionsUrl } from "../api/client";
import type { VersionInfo } from "../api/types";

/** The button that opens the version list, at the right of the panel header. */
const VersionsButton = styled(Button)({
  float: "right",
  marginTop: "8px",
});

export function Versions() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [versions, setVersions] = React.useState<VersionInfo[]>([]);

  // The list is fetched once; abort it if the menu goes away before it lands.
  React.useEffect(() => {
    const controller = new AbortController();
    getVersions(versionsUrl(), controller.signal)
      .then((vers) => {
        if (controller.signal.aborted) return;
        setVersions([...vers, ["React", React.version, "https://reactjs.org/"]]);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setVersions([
          [error instanceof Error ? error.message : String(error), null, null],
        ]);
      });
    return () => controller.abort();
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <VersionsButton color="secondary" onClick={handleOpen}>
        Versions
      </VersionsButton>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Table>
          <TableBody>
            {versions.map(([tool, version, url]) => {
              return (
                <TableRow key={tool}>
                  <TableCell component="th" scope="row">
                    <a href={url ?? undefined}>{tool}</a>
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
