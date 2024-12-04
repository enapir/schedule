import React from "react";
import ScheduleTable from "./components/ScheduleTable";

function Dashboard() {
  return (
    <div className="p-10 md:px-20 lg:px-32">
      <p>
        電力会社（送配電事業者）に設置され，出力制御スケジュール情報を発電所に配信するシステム。
      </p>
      <ScheduleTable />
    </div>
  );
}

export default Dashboard;
