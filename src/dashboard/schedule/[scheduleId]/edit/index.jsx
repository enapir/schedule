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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MonthPicker } from "@/dashboard/schedule/components/MonthPicker";
import { format } from "date-fns";
import { Calendar as CalendarIcon, LoaderCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import GlobalApi from "../../../../../service/GlobalApi";
import {
  cn,
  convertToCalendarData,
  generateCalendarData,
  generateCalendarDataByDay,
  getControlRateLabel,
  getFirst203RateIndex,
  getFullFormatNo,
  getFullPowerPlantId,
  isValid203Rates,
  isValidControlRate,
  isValidTime,
  mergeRatesIntoDates,
} from "../../../../lib/utils";

function EditSchedule() {
  const navigation = useNavigate();
  const { scheduleId } = useParams();
  const [loading, setLoading] = useState();
  const [scheduleInfo, setScheduleInfo] = useState();
  const [controlStartMonth, setControlStartMonth] = useState();
  const [controlStartMonthTemp, setControlStartMonthTemp] = useState();
  const [openAlertWhenChangeStartMonth, setOpenAlertWhenChangeStartMonth] =
    useState(false);
  const [controlRates, setControlRates] = useState({});
  const [controlRatesTemp, setControlRatesTemp] = useState({});
  const [controlTime, setControlTime] = useState("");
  const [controlTimeFocused, setControlTimeFocused] = useState("");
  const [fixedScheduleUpdateFlag, setFixedScheduleUpdateFlag] = useState("");
  const [nextAccessDate, setNextAccessDate] = useState("");

  useEffect(() => {
    GetScheduleInfo();
  }, []);

  useEffect(() => {
    const controlTime = scheduleInfo?.scheduleDetailList[0]?.controlTime;
    if (controlTime) {
      onChangeControlStart(
        new Date(
          controlTime.substring(0, 4),
          controlTime.substring(4, 6) - 1,
          controlTime.substring(6, 8),
          controlTime.substring(8, 10),
          controlTime.substring(10, 12)
        )
      );
      if (scheduleInfo?.schedule?.formatNo === "203") {
        setControlTime(controlTime);
        setFixedScheduleUpdateFlag(
          scheduleInfo?.scheduleDetailList[0]?.fixedScheduleUpdateFlag
        );
        setNextAccessDate(scheduleInfo?.scheduleDetailList[0]?.nextAccessDate);
      }
    }
  }, [scheduleInfo]);

  const GetScheduleInfo = () => {
    GlobalApi.GetSchedule(scheduleId).then(
      (resp) => {
        const schedule = resp.data.data;
        if (schedule.schedule === null) {
          navigation("/dashboard");
          toast("指定するスケジュールが存在しません。");
        } else {
          setScheduleInfo(schedule);
        }
      },
      (error) => {
        Ï;
        toast("スケジュールを取得失敗しました。");
      }
    );
  };

  const onChangeControlStart = (dateTime) => {
    if (scheduleInfo?.schedule?.formatNo === "203") {
      onChangeStartTime(dateTime);
    } else {
      onChangeStartMonth(dateTime);
    }
  };

  const onChangeStartMonth = (dateTime) => {
    if (format(dateTime, "yyyy-MM") === controlStartMonth) return;
    if (Object.keys(controlRates).length === 0) {
      const startMonth = format(dateTime, "yyyy-MM");
      setControlStartMonth(startMonth);
      const allRates = generateCalendarData(
        startMonth,
        scheduleInfo?.schedule?.formatNo === "201" ? 13 : 1
      );
      scheduleInfo?.scheduleDetailList?.forEach((scheduleDetail) => {
        if (scheduleDetail.controlTime in allRates) {
          allRates[scheduleDetail.controlTime] = convertToCalendarData(
            scheduleDetail.controlRates.split(","),
            scheduleDetail.controlTime
          );
        }
      });
      setControlRates(allRates);
    } else {
      setControlStartMonthTemp(dateTime);
      setOpenAlertWhenChangeStartMonth(true);
    }
  };

  const onChangeStartTime = (dateTime) => {
    if (scheduleInfo?.schedule?.formatNo !== "203") {
      if (format(dateTime, "yyyyMMdd") === controlTime?.substring(0, 8)) return;
      if (Object.keys(controlRates).length === 0) {
        const startDay = format(dateTime, "yyyyMMdd");
        let allRates = generateCalendarDataByDay(startDay);
        if (scheduleInfo?.scheduleDetailList) {
          const scheduleDetail = scheduleInfo?.scheduleDetailList[0];
          allRates = mergeRatesIntoDates(
            allRates,
            scheduleDetail?.controlTime,
            scheduleDetail?.controlRates.split(",")
          );
        }
        setControlRates(allRates);
      } else {
        setControlStartMonthTemp(dateTime);
        setOpenAlertWhenChangeStartMonth(true);
      }
    } else {
      const startDay = format(dateTime, "yyyyMMddHHmm");
      let allRates = generateCalendarDataByDay(startDay);
      if (scheduleInfo?.scheduleDetailList) {
        const scheduleDetail = scheduleInfo?.scheduleDetailList[0];
        if (scheduleDetail?.controlTime) {
          allRates = mergeRatesIntoDates(
            allRates,
            scheduleDetail?.controlTime,
            scheduleDetail?.controlRates.split(",")
          );
        }
      }
      setControlRates(allRates);
    }
  };

  useEffect(() => {
    setControlRatesTemp(controlRates);
    setControlRates({});
  }, [controlStartMonthTemp]);

  const onConfirmRefresh = () => {
    onChangeControlStart(controlStartMonthTemp);
    setOpenAlertWhenChangeStartMonth(false);
  };

  const onCancelRefresh = () => {
    setControlRates(controlRatesTemp);
    setOpenAlertWhenChangeStartMonth(false);
  };

  const handleControlRateChange = (e, monthKey, day, timeIndex) => {
    let preRate = null;
    if (controlRates[monthKey]) {
      const dayData = controlRates[monthKey].find((item) => item?.day === day);
      if (dayData && timeIndex >= 0 && timeIndex < dayData.timeSlots.length) {
        preRate = dayData.timeSlots[timeIndex];
      }
    }
    if (preRate === e.target.value) {
      return;
    }

    let rate = e.target.value;
    if (
      !isValidControlRate(rate) &&
      scheduleInfo?.schedule.formatNo !== "203"
    ) {
      rate = 100;
    }

    setControlRates((prevData) => {
      // ディープコピーして変更を適用
      const newData = { ...prevData };
      if (newData[monthKey]) {
        const dayData = newData[monthKey].find((item) => item?.day === day);
        if (dayData && timeIndex >= 0 && timeIndex < dayData.timeSlots.length) {
          dayData.timeSlots[timeIndex] = rate;
        }
      }
      return newData; // 更新したデータを返却
    });
  };

  const onSave = () => {
    if (scheduleInfo?.schedule?.formatNo === "203") {
      if (!isValidTime(controlTime, 12)) {
        toast(
          `制御開始目の年月日時分がyyyyMMddHHmmのフォーマットで入力してください`
        );
        return;
      }
      if (!/\d{10}(00|30)$/.test(controlTime)) {
        toast(`制御開始目の年月日時分が30分単位で入力してください`);
        return;
      }
      if (!/^\d+$/.test(fixedScheduleUpdateFlag)) {
        toast(`固定スケジュール更新フラグが1桁の数字で入力してください`);
        return;
      }
      if (!isValidTime(nextAccessDate, 14)) {
        toast(
          `次回アクセス日時がyyyyMMddHHmmssのフォーマットで入力してください`
        );
        return;
      }
    }

    setLoading(true);
    const data = {
      scheduleRelId: scheduleInfo.schedule.id,
      scheduleDetailRatesList: [],
    };

    const scheduleDetailRatesList = [];
    Object.entries(controlRates).forEach(([monthKey, monthData]) => {
      // 月ごとのtimeSlotsを結合
      const combinedTimeSlots = monthData
        .filter((dayData) => dayData && dayData.timeSlots) // nullを除外
        .flatMap((dayData) => dayData.timeSlots); // 各日のtimeSlotsを平坦化
      scheduleDetailRatesList.push({
        controlTime: monthKey,
        controlRates: combinedTimeSlots.join(","), // カンマ区切り文字列に変換
        fixedScheduleUpdateFlag: fixedScheduleUpdateFlag,
        nextAccessDate: nextAccessDate,
      });
    });

    if (scheduleInfo?.schedule?.formatNo === "203") {
      // データ数チェック
      if (!isValid203Rates(scheduleDetailRatesList[0].controlRates)) {
        setLoading(false);
        toast(`出力制御率を連続的に入力してください`);
        return;
      } else if (
        controlTime.substring(8, 10) * 2 +
          (controlTime.substring(10, 12) === "00" ? 0 : 1) !==
        getFirst203RateIndex(scheduleDetailRatesList[0].controlRates)
      ) {
        setLoading(false);
        toast(`出力制御率を${controlTime}から入力してください`);
        return;
      } else {
        scheduleDetailRatesList[0].controlRates =
          scheduleDetailRatesList[0].controlRates.replace(/^,+|,+$|,{2,}/g, "");
      }
    }

    data.scheduleDetailRatesList = scheduleDetailRatesList;

    GlobalApi.SaveAllScheduleControls(data).then(
      (resp) => {
        setLoading(false);
        toast("スケジュールの出力制御率が保存されました");
      },
      (error) => {
        setLoading(false);
        toast("サーバーエラーです。もう一度お試しください。");
      }
    );
  };

  const handleChangeControlTime = (e) => {
    if (controlTimeFocused === e.target.value) return;
    let controlTime = e.target.value;
    const format = "yyyyMMddhhmm";
    if (controlTime.length < format.length) {
      if (!/^\d+$/.test(controlTime)) {
        setControlTime(controlTime.substring(0, controlTime.length - 1));
        return false;
      } else {
        setControlTime(controlTime);
        return true;
      }
    }
    setControlTime(controlTime);
    if (!isValidTime(controlTime, 12)) {
      toast(
        `制御開始目の年月日時分が${format}のフォーマットで入力してください`
      );
    } else if (!/\d{10}(00|30)$/.test(controlTime)) {
      toast(`制御開始目の年月日時分が30分単位で入力してください`);
    } else {
      onChangeControlStart(
        new Date(
          controlTime.substring(0, 4),
          controlTime.substring(4, 6) - 1,
          controlTime.substring(6, 8),
          controlTime.substring(8, 10),
          controlTime.substring(10, 12)
        )
      );
    }
  };

  const handleChangeFixedScheduleUpdateFlag = (e) => {
    let fixedScheduleUpdateFlag = e.target.value;
    if (!/^\d+$/.test(fixedScheduleUpdateFlag)) {
      toast(`固定スケジュール更新フラグが1桁の数字で入力してください`);
      fixedScheduleUpdateFlag = "";
    }
    setFixedScheduleUpdateFlag(fixedScheduleUpdateFlag);
  };

  const handleChangeNextAccessDate = (e) => {
    let nextAccessDate = e.target.value;
    const format = "yyyyMMddhhmmss";
    if (nextAccessDate.length <= format.length) {
      if (!/^\d+$/.test(nextAccessDate)) {
        setNextAccessDate(
          nextAccessDate.substring(0, nextAccessDate.length - 1)
        );
        return false;
      } else {
        setNextAccessDate(nextAccessDate);
        return true;
      }
    }
    if (!isValidTime(nextAccessDate, 14)) {
      toast(`次回アクセス日時が${format}のフォーマットで入力してください`);
      nextAccessDate = "";
    }
    setNextAccessDate(nextAccessDate);
  };

  const [expandedMonth, setExpandedMonth] = useState(0);
  const ControlRatesCalendarInput = ({
    calendarData,
    handleControlRateChange,
  }) => {
    const inputRefs = useRef([]);

    const handleInputChange = (e, monthKey, day, timeIndex, refIndex) => {
      handleControlRateChange(e, monthKey, day, timeIndex);

      // setTimeout(() => {
      //   // フォーカスを再取得
      //   if (inputRefs.current[refIndex]) {
      //     inputRefs.current[refIndex].focus();
      //   }
      // }, 0);
    };

    return (
      <div className="space-y-4">
        {Object.entries(calendarData).map(([monthKey, days], index) => {
          const year = monthKey.slice(0, 4);
          const month = monthKey.slice(4, 6);

          return (
            <Card key={index} className="p-4">
              {scheduleInfo?.schedule?.formatNo !== "203" ? (
                <CardHeader
                  className="cursor-pointer text-lg font-bold"
                  onClick={() =>
                    setExpandedMonth(index === expandedMonth ? -1 : index)
                  }
                >
                  {`${year}年${month}月`}
                </CardHeader>
              ) : null}
              {expandedMonth === index && (
                <CardContent>
                  <div className="grid grid-cols-7 gap-4">
                    {/* 曜日のヘッダー */}
                    {["日", "月", "火", "水", "木", "金", "土"].map(
                      (day, i) => (
                        <div
                          key={i}
                          className="font-bold text-center border-b pb-2"
                        >
                          {day}
                        </div>
                      )
                    )}
                    {/* 日付データ */}
                    {days.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`p-2 border rounded bg-white ${
                          day === null ? "invisible" : ""
                        }`}
                      >
                        {day && (
                          <>
                            <div className="font-bold">
                              {scheduleInfo?.schedule?.formatNo !== "203"
                                ? `${day.day}日`
                                : `${day.day}`}
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              {day.timeSlots.map((value, timeIndex) => (
                                <div
                                  key={timeIndex}
                                  className="flex items-center"
                                >
                                  <span className="text-xs">
                                    {String(Math.floor(timeIndex / 2)).padStart(
                                      2,
                                      "0"
                                    )}
                                    :{timeIndex % 2 === 0 ? "00" : "30"}
                                  </span>
                                  <Input
                                    key={index + "" + dayIndex + "" + timeIndex}
                                    defaultValue={value}
                                    className="ml-2 w-full"
                                    onBlur={(e) =>
                                      handleInputChange(
                                        e,
                                        monthKey,
                                        day.day,
                                        timeIndex,
                                        index + "" + dayIndex + "" + timeIndex
                                      )
                                    }
                                    ref={(el) =>
                                      (inputRefs.current[
                                        index + "" + dayIndex + "" + timeIndex
                                      ] = el)
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <div className="flex justify-between items-center bg-white sticky top-0 z-10">
        <h2 className="font-bold text-lg">
          {getControlRateLabel(scheduleInfo?.schedule?.formatNo)}
          の出力制御率を追加してください
        </h2>
        <Button
          disabled={loading || Object.keys(controlRates).length === 0}
          onClick={onSave}
        >
          {loading ? <LoaderCircle className="animate-spin" /> : "一括保存"}
        </Button>
      </div>

      <div className="my-4 sticky top-12 z-10">
        <h3 className="font-bold">スケジュールの基本情報</h3>
        <div className="text-center text-sm">
          {scheduleInfo?.schedule?.formatNo === "203" ? (
            <>
              <div className="grid grid-cols-[5fr_5fr_5fr_5fr_4fr_4fr_7fr] border border-black bg-[#8DB4E2]">
                <label className="font-bold py-1">制御開始目の年月日時分</label>
                <label className="font-bold border-l border-black py-1">
                  固定スケジュール更新フラグ
                </label>
                <label className="font-bold border-l border-black py-1">
                  次回アクセス日時
                </label>
                <label className="border-l border-black py-1">
                  フォーマットＮｏ
                </label>
                <label className="border-l border-black py-1">
                  スケジュール区分
                </label>
                <label className="border-l border-black py-1">
                  スケジュールID
                </label>
                <label className="border-l border-black py-1">発電所ID</label>
              </div>
              <div className="grid grid-cols-[5fr_5fr_5fr_5fr_4fr_4fr_7fr] border justify-center items-center">
                <Input
                  className="border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={controlTime}
                  maxLength="12"
                  placeholder="フォーマット：yyyyMMDDhhmm"
                  onChange={(e) => setControlTime(e.target.value)}
                  onFocus={(e) => setControlTimeFocused(e.target.value)}
                  onBlur={handleChangeControlTime}
                />
                <Input
                  className="border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={fixedScheduleUpdateFlag}
                  maxLength="1"
                  placeholder="許可値：0 - 9"
                  onChange={(e) => setFixedScheduleUpdateFlag(e.target.value)}
                  onBlur={handleChangeFixedScheduleUpdateFlag}
                />
                <Input
                  className="border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={nextAccessDate}
                  maxLength="14"
                  placeholder="フォーマット：yyyyMMDDhhmmss"
                  onChange={(e) => setNextAccessDate(e.target.value)}
                  onBlur={handleChangeNextAccessDate}
                />
                <span className="border-l py-2">
                  {getFullFormatNo(scheduleInfo?.schedule?.formatNo)}
                </span>
                <span className="border-l py-2">
                  {scheduleInfo?.schedule?.scheduleKbn}
                </span>
                <span className="border-l py-2">
                  {scheduleInfo?.schedule?.scheduleId}
                </span>
                <span className="border-l py-2">
                  {getFullPowerPlantId(scheduleInfo?.schedule?.powerPlantId)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-5 border border-black bg-[#8DB4E2]">
                <label className="font-bold py-1">制御開始年月</label>
                <label className="border-l border-black py-1">
                  フォーマットＮｏ
                </label>
                <label className="border-l border-black py-1">
                  スケジュール区分
                </label>
                <label className="border-l border-black py-1">
                  スケジュールID
                </label>
                <label className="border-l border-black py-1">発電所ID</label>
              </div>
              <div className="grid grid-cols-5 border">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"ghost"}
                      className={cn(
                        "w-full justify-center text-left font-normal",
                        !controlStartMonth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {controlStartMonth ? (
                        format(controlStartMonth, "yyyy年MM月")
                      ) : (
                        <span>制御開始年月を選択してください</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <MonthPicker
                      onMonthSelect={onChangeControlStart}
                      selectedMonthStr={controlStartMonth}
                      minDate={new Date(new Date().getFullYear() - 5, 0)}
                      maxDate={new Date(new Date().getFullYear() + 5, 11)}
                    />
                  </PopoverContent>
                </Popover>
                <span className="border-l py-2">
                  {getFullFormatNo(scheduleInfo?.schedule?.formatNo)}
                </span>
                <span className="border-l py-2">
                  {scheduleInfo?.schedule?.scheduleKbn}
                </span>
                <span className="border-l py-2">
                  {scheduleInfo?.schedule?.scheduleId}
                </span>
                <span className="border-l py-2">
                  {getFullPowerPlantId(scheduleInfo?.schedule?.powerPlantId)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full p-4 overflow-y-scroll h-[calc(100vh-14rem)]">
        <ControlRatesCalendarInput
          calendarData={controlRates}
          handleControlRateChange={handleControlRateChange}
        />
      </div>

      <AlertDialog open={openAlertWhenChangeStartMonth}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              制御開始年月を変更してよろしいですか？
            </AlertDialogTitle>
            <AlertDialogDescription>
              制御開始年月を変更すると設定した出力制御率がクリアされます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelRefresh}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmRefresh}>
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default EditSchedule;
