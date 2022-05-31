import { useState } from "react";

const useLoading = (action) => {
  const [loading, setLoading] = useState(false);
  const doAction = (...args) => {
    setLoading(true);
    return action(...args).finally(() => setLoading(false));
  };
  return [doAction, loading];
};

export default useLoading;

// This hook takes an async function and returns an array containing that function and the loading status.

// We have also been able to abstract our useState logic to this component and we only need one initialization.

// We can use it in our code, like this:

// import "./styles.css";
// import React, { useEffect } from "react";
// import useLoading from "./useLoading";
// export default function App() {
//   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//   const fetchDevs = async () => {
//     console.log("this might take some time....");
//     await delay(4000);
//     console.log("Done!");
//   };
//   const fetchStacks = async () => {
//     console.log("this might take some time....");
//     await delay(5000);
//     console.log("Done!");
//   };
//   const [getDev, isLoadingDev] = useLoading(fetchDevs);
//   const [getStacks, isLoadingStack] = useLoading(fetchStacks);
//   useEffect(() => {
//     getDev();
//     getStacks();
//   }, []);
//   return (
//     <div className="app
//          container
//          d-flex
//          flex-column
//          justify-content-center
//          align-items-center"
//     >
//       <article className="d-flex flex-column my-2">
//         <p className="text-center">Welcome to Dev Hub</p>
//       </article>
//       <article className="d-flex flex-column">
//         <button className="m-2 p-3 btn btn-success btn-sm">
//           {isLoadingDev ? "Loading Devs..." : `View Devs`}
//         </button>
//         <button className="m-2 p-3 btn btn-success btn-sm">
//           {isLoadingStack ? "Loading Stacks..." : "View Stacks"}
//         </button>
//       </article>
//     </div>
//   );
// }
