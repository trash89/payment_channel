import { Outlet } from "react-router-dom";
import MenuAppBar from "../components/MenuAppBar";
const SharedLayout = () => {
  return (
    <>
      <MenuAppBar />
      <Outlet />
    </>
  );
};
export default SharedLayout;
