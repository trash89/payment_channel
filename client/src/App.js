import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimpleAuction, BlindAuction, SharedLayout, Error } from "./pages";
import { useIsMounted } from "./hooks";

function App() {
  const isMounted = useIsMounted();
  if (!isMounted) return <></>;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route index element={<SimpleAuction />} />
            <Route path="/simpleauction" element={<SimpleAuction />} />
            <Route path="/blindauction" element={<BlindAuction />} />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
