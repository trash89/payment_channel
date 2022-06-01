import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimplePaymentChannelContainer, SharedLayout, Error } from "./pages";
import { useIsMounted } from "./hooks";

function App() {
  const isMounted = useIsMounted();
  if (!isMounted) return <></>;
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route index element={<SimplePaymentChannelContainer />} />
            <Route
              path="/simplepc"
              element={<SimplePaymentChannelContainer />}
            />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
