import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  DATA_MODE_PRODUCTION,
  DATA_MODE_TEST,
  FORMAT_NO_LIST,
} from "../../data/master";
import { cn } from "../../lib/utils";
import { MonthPicker } from "../schedule/components/MonthPicker";

function AddSchedule({ isOpen, mode, data, onSave, onClose }) {
  const [formData, setFormData] = useState(data);
  const [dataMode, setDataMode] = useState(
    data.dataMode || DATA_MODE_PRODUCTION
  );
  const [formatNo, setFormatNo] = useState(data.formatNo || "");
  const [scheduleKbn, setScheduleKbn] = useState();
  const [scheduleKbnFree, setScheduleKbnFree] = useState();
  const [scheduleId, setScheduleId] = useState(data.scheduleId || "");
  const [powerPlantId, setPowerPlantId] = useState(data.powerPlantId || "");

  useEffect(() => {
    setFormData(data);
    setFormatNo(data.formatNo || "");
    setDataMode(data.dataMode);
    if (data.dataMode === DATA_MODE_PRODUCTION) {
      setScheduleKbn(
        data.formatNo === "202"
          ? "20" + data.scheduleKbn
          : data.scheduleKbn || ""
      );
    } else {
      setScheduleKbnFree(data.scheduleKbn);
    }
    setScheduleId(data.scheduleId || "");
    setPowerPlantId(data.powerPlantId || "");
  }, [data]);

  const handleDataModeChange = (dataMode) => {
    setDataMode(dataMode);
    setFormData({ ...formData, dataMode: dataMode });
  };

  const handleFormatNoChange = (formatNo) => {
    setFormatNo(formatNo);
    let newKbn = null;
    if (formatNo === "203") {
      newKbn = "0000";
    } else {
      newKbn = "";
    }
    setScheduleKbn(newKbn);
    setFormData({ ...formData, formatNo: formatNo, scheduleKbn: newKbn });
  };

  const handleScheduleKbnChange = (scheduleKbn) => {
    setScheduleKbn(scheduleKbn);
    setFormData({ ...formData, scheduleKbn: scheduleKbn });
  };

  const handleScheduleKbn202Change = (value) => {
    if (!value) return;

    const yymm = format(value, "yyyyMM");
    setScheduleKbn(yymm);
    setFormData({ ...formData, scheduleKbn: yymm });
  };

  const handleScheduleKbnFreeChange = (e) => {
    const scheduleKbnFree = e.target.value;
    setScheduleKbnFree(scheduleKbnFree);
    setFormData({ ...formData, scheduleKbn: scheduleKbnFree });
  };

  const handleScheduleIdChange = (e) => {
    const value = e.target.value;
    if (!/^\d+$/.test(value)) return;
    setScheduleId(value);
    setFormData({ ...formData, scheduleId: value });
  };

  const handlePowerPlantIdChange = (e) => {
    const value = e.target.value;
    if (!/^\d+$/.test(value)) return;
    setPowerPlantId(value);
    setFormData({ ...formData, powerPlantId: value });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div>
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-[600px] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>スケジュールを作成する</DialogTitle>
            <DialogDescription>
              スケジュールの基本情報を正しく設定してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">データモード</Label>
              <RadioGroup
                value={dataMode}
                className="flex col-span-3"
                onValueChange={handleDataModeChange}
                disabled={mode === "edit"}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={DATA_MODE_PRODUCTION}
                    id={DATA_MODE_PRODUCTION}
                  />
                  <Label htmlFor={DATA_MODE_PRODUCTION}>本番</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={DATA_MODE_TEST} id={DATA_MODE_TEST} />
                  <Label htmlFor={DATA_MODE_TEST}>テスト</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formatNo" className="text-right">
                フォーマットＮｏ
              </Label>
              <Select
                name="formatNo"
                value={formatNo}
                onValueChange={handleFormatNoChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="フォーマットＮｏを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {FORMAT_NO_LIST.filter((format) => !format.disabled).map(
                      (format) => (
                        <SelectItem value={format.value} key={format.value}>
                          {format.label}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {dataMode === DATA_MODE_PRODUCTION ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduleKbn" className="text-right">
                  スケジュール区分
                </Label>
                {formatNo === "201" ? (
                  <Select
                    name="scheduleKbn"
                    value={scheduleKbn}
                    onValueChange={handleScheduleKbnChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="スケジュール区分を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Array.from({ length: 10 }, (_, index) => index).map(
                          (flag) => (
                            <SelectItem value={"999" + flag} key={"999" + flag}>
                              {"999" + flag}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : null}
                {formatNo === "202" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 w-full justify-start text-left font-normal",
                          !scheduleKbn && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleKbn ? (
                          `${scheduleKbn.substring(
                            0,
                            4
                          )}年${scheduleKbn.substring(4, 6)}月`
                        ) : (
                          <span>年月を選択してください</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <MonthPicker
                        onMonthSelect={(date) =>
                          handleScheduleKbn202Change(date)
                        }
                        selectedMonthStr={scheduleKbn}
                        minDate={new Date(new Date().getFullYear() - 5, 0)}
                        maxDate={new Date(new Date().getFullYear() + 5, 11)}
                      />
                    </PopoverContent>
                  </Popover>
                ) : null}
                {formatNo === "203" ? (
                  <Input
                    name="scheduleKbn"
                    className="col-span-3"
                    value="0000"
                    disabled={true}
                  />
                ) : null}
                {formatNo === "301" ? (
                  <Input
                    name="scheduleKbn"
                    className="col-span-3"
                    value="8888"
                    disabled={true}
                  />
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduleKbnFree" className="text-right">
                  スケジュール区分
                </Label>
                <Input
                  maxLength="6"
                  name="scheduleKbnFree"
                  className="my-2 col-span-3"
                  value={scheduleKbnFree}
                  onChange={handleScheduleKbnFreeChange}
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduleId" className="text-right">
                スケジュールID
              </Label>
              <Input
                maxLength="10"
                name="scheduleId"
                className="my-2 col-span-3"
                value={scheduleId}
                onChange={handleScheduleIdChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="powerPlantId" className="text-right">
                発電所ID
              </Label>
              <Input
                maxLength="26"
                name="powerPlantId"
                className="my-2 col-span-3"
                value={powerPlantId}
                onChange={handlePowerPlantIdChange}
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-5">
              <Button onClick={onClose} variant="ghost">
                取消
              </Button>
              <Button onClick={handleSave}>確定</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddSchedule;
