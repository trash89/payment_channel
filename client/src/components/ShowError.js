import Typography from "@mui/material/Typography";
import { useState, useEffect } from "react";
const ShowError = ({ flag, error }) => {
  const [local, setLocal] = useState(error);

  useEffect(() => {
    const timeoutID = window.setTimeout(() => {
      setLocal("");
    }, 5000);

    return () => {
      window.clearTimeout(timeoutID);
    };
  }, []);

  return (
    <>
      {flag ? (
        <Typography color="red">
          {local?.reason ? local?.reason : local?.message}
        </Typography>
      ) : (
        <></>
      )}
    </>
  );
};

export default ShowError;
