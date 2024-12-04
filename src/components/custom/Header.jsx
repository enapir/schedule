import packageJson from "@/../package.json";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";

function Header() {
  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="p-3 px-5 flex justify-between shadow-md">
      <Link to={"/dashboard"} className="flex justify-start items-center">
        <h2 className="font-bold text-lg">スケジュール情報配信システム</h2>
        <span className="ml-1 text-gray-400">v{packageJson.version}</span>
      </Link>
      <div className="flex gap-2 items-center">
        {pathname !== "/dashboard" ? (
          <Link to={"/dashboard"}>
            <Button variant="outline">ホームへ</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default Header;
