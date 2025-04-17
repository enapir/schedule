import * as React from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Loader2Icon, MoreHorizontal } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GlobalApi from "../../../service/GlobalApi";
import { DATA_MODE_PRODUCTION, DATA_MODE_TEST } from "../../data/master";
import {
  cn,
  getCurrentTime,
  getFullFormatNo,
  getFullPowerPlantId,
} from "../../lib/utils";
import AddSchedule from "./AddSchedule";
import { DataTablePagination } from "./DataTablePagination";

function ScheduleTable() {
  const navigation = useNavigate();

  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [openAlert, setOpenAlert] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [scheduleId, setScheduleId] = React.useState();

  const [data, setData] = React.useState([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState("create");
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [dialogData, setDialogData] = React.useState({});

  const columns = [
    {
      id: "index",
      header: "＃",
      cell: ({ row }) => {
        return <div>{row.index + 1}</div>;
      },
    },
    {
      accessorKey: "dataMode",
      header: "データモード",
      cell: ({ row }) => {
        return (
          <div
            className={cn(
              "font-bold",
              row.getValue("dataMode") === DATA_MODE_TEST ? "text-gray-400" : ""
            )}
            style={{ textTransform: "uppercase" }}
          >
            {row.getValue("dataMode")}
          </div>
        );
      },
    },
    {
      accessorKey: "formatNo",
      header: "フォーマットＮｏ",
    },
    {
      accessorKey: "scheduleKbn",
      header: "スケジュール区分",
    },
    {
      accessorKey: "scheduleId",
      header: "スケジュールID",
    },
    {
      accessorKey: "powerPlantId",
      header: "発電所ID",
    },
    {
      accessorKey: "controlTimeStart",
      header: "制御年月日時分（開始）",
    },
    // {
    //   accessorKey: "controlCount",
    //   header: "制御済みデータ数",
    // },
    {
      accessorKey: "registerConfirmResult",
      header: "登録確認結果",
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const schedule = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  openEditDialog(schedule);
                }}
              >
                基本情報変更
              </DropdownMenuItem>
              {schedule.formatNo.substring(0, 3) !== "301" ? (
                <DropdownMenuItem
                  onClick={() =>
                    navigation("/dashboard/schedule/" + schedule.id + "/edit")
                  }
                >
                  出力制御率設定
                </DropdownMenuItem>
              ) : null}
              {(schedule.formatNo.substring(0, 3) === "201" &&
                schedule.controlCount === 13) ||
              (schedule.formatNo.substring(0, 3) === "202" &&
                schedule.controlCount === 1) ||
              (schedule.formatNo.substring(0, 3) === "203" &&
                schedule.controlCount === 1) ||
              schedule.formatNo.substring(0, 3) === "301" ? (
                <DropdownMenuItem
                  onClick={() => {
                    setScheduleId(schedule.id);
                    setSelectedRow(schedule);
                    onDownload(schedule.id);
                  }}
                >
                  伝送ファイル
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={() => {
                  setScheduleId(schedule.id);
                  setSelectedRow(schedule);
                  setOpenAlert(true);
                }}
                className="text-gray-400"
              >
                スケジュール削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  React.useEffect(() => {
    getScheduleList();
  }, []);

  const getScheduleList = () => {
    GlobalApi.GetScheduleList().then((resp) => {
      if (resp.data.success) {
        const scheduleList = resp.data.data?.records?.map((schedule) => ({
          id: schedule.id,
          dataMode: schedule.dataMode,
          formatNo: getFullFormatNo(schedule.formatNo),
          scheduleKbn: schedule.scheduleKbn,
          scheduleId: schedule.formatNo === "301" ? "-" : schedule.scheduleId,
          powerPlantId: getFullPowerPlantId(schedule.powerPlantId),
          controlTimeStart:
            schedule.formatNo === "301" ? "-" : schedule.controlTimeStart,
          controlCount:
            schedule.formatNo === "301" ? "-" : schedule.controlCount,
          registerConfirmResult: schedule.registerConfirmResult,
        }));
        setData(scheduleList);
      } else {
        setData([]);
      }
    });
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    setDialogData({ dataMode: DATA_MODE_PRODUCTION, formatNo: "201" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setDialogMode("edit");
    const formData = {
      id: row.id,
      dataMode: row.dataMode,
      formatNo: row.formatNo.substring(0, 3),
      scheduleKbn: row.scheduleKbn,
      scheduleId: row.scheduleId,
      powerPlantId: row.powerPlantId.replace(/-/g, ""),
      registerConfirmResult: row.registerConfirmResult,
    };
    setDialogData(formData);
    setSelectedRow(formData);
    setIsDialogOpen(true);
  };

  const onCloseDialog = () => {
    setDialogMode("");
    setDialogData({});
    setIsDialogOpen(false);
  };

  const onSave = async (schedule) => {
    setLoading(true);
    const data = {
      id: dialogMode === "create" ? null : schedule.id,
      dataMode: schedule.dataMode,
      formatNo: schedule.formatNo,
      scheduleKbn: schedule.scheduleKbn,
      scheduleId: schedule.scheduleId,
      powerPlantId: schedule.powerPlantId,
      registerConfirmResult: schedule.registerConfirmResult,
    };

    GlobalApi.SaveSchedule(data).then(
      (resp) => {
        setLoading(false);
        setDialogData({});
        setIsDialogOpen(false);
        if (resp?.data?.success) {
          if (dialogMode === "create" && data.formatNo !== "301") {
            navigation("/dashboard/schedule/" + resp.data.data.id + "/edit");
          } else {
            getScheduleList();
          }
        }
      },
      (error) => {
        setLoading(false);
        toast(error.response.data.msg);
      }
    );
  };

  const onDelete = () => {
    setLoading(true);
    GlobalApi.DeleteSchedule(scheduleId).then(
      (resp) => {
        toast("スケジュールが削除されました");
        getScheduleList();
        setLoading(false);
        setOpenAlert(false);
      },
      (error) => {
        setLoading(false);
      }
    );
  };

  const onDownload = (scheduleId) => {
    setLoading(true);
    GlobalApi.DownloadSchedule(scheduleId).then(
      (resp) => {
        // レスポンスデータから Blob を作成
        const blob = new Blob([resp.data], {
          type: "application/octet-stream",
        });

        const selectedSchedule = data.filter(
          (schedule) => schedule.id === scheduleId
        )[0];
        const fileName = `${selectedSchedule.formatNo.substring(0, 3)}_${
          selectedSchedule.scheduleKbn
        }_${selectedSchedule.powerPlantId.replace(
          /-/g,
          ""
        )}_${getCurrentTime()}.data`;
        // ダウンロードリンクを作成
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        // ダウンロードをトリガー
        link.click();
        // リンクを削除
        document.body.removeChild(link);

        toast("伝送ファイルがダウンロードされました");
        setLoading(false);
      },
      (error) => {
        setLoading(false);
      }
    );
  };

  return (
    <div>
      <AddSchedule
        isOpen={isDialogOpen}
        mode={dialogMode}
        data={dialogData}
        onSave={onSave}
        onClose={onCloseDialog}
      />
      <div className="flex items-center justify-end pb-2">
        <Button className="mr-2" onClick={openCreateDialog}>
          スケジュール作成
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  データなし
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      <AlertDialog open={openAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              スケジュールを削除してよろしいですか？
            </AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。これによりスケジュールは完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlert(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={loading}>
              {loading ? <Loader2Icon className="animate-spin" /> : "削除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ScheduleTable;
