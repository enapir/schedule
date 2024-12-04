import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/custom/Header";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <>
      <Header />
      <Outlet />
      <Toaster />
    </>
  );
}

export default App;
