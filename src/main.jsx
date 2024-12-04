import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./dashboard/index.jsx";
import EditSchedule from "./dashboard/schedule/[scheduleId]/edit/index.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace={true} />,
  },
  {
    element: <App />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/schedule/:scheduleId/edit",
        element: <EditSchedule />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
