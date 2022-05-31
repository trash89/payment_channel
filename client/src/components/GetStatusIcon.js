import CircularProgress from "@mui/material/CircularProgress";
import { FaCheck, FaExclamation } from "react-icons/fa";
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // idle

const GetStatusIcon = ({ status }) => {
  if (status === "idle") return <AccessTimeIcon />;
  if (status === "error") return <FaExclamation />;
  if (status === "loading") return <CircularProgress size={15} />;
  if (status === "success") return <FaCheck />;
};

export default GetStatusIcon;
