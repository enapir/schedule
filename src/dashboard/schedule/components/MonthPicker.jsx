import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

const MONTHS = [
  [
    { number: 0, name: "1月" },
    { number: 1, name: "2月" },
    { number: 2, name: "3月" },
    { number: 3, name: "4月" },
  ],
  [
    { number: 4, name: "5月" },
    { number: 5, name: "6月" },
    { number: 6, name: "7月" },
    { number: 7, name: "8月" },
  ],
  [
    { number: 8, name: "9月" },
    { number: 9, name: "10月" },
    { number: 10, name: "11月" },
    { number: 11, name: "12月" },
  ],
];

function MonthPicker({
  onMonthSelect,
  selectedMonth,
  selectedMonthStr,
  minDate,
  maxDate,
  disabledDates,
  callbacks,
  onYearBackward,
  onYearForward,
  variant,
  className,
  ...props
}) {
  return (
    <div className={cn("min-w-[200px] w-[280px] p-3", className)} {...props}>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">
        <div className="space-y-4 w-full">
          <MonthCal
            onMonthSelect={onMonthSelect}
            callbacks={callbacks}
            selectedMonth={selectedMonth}
            selectedMonthStr={selectedMonthStr}
            onYearBackward={onYearBackward}
            onYearForward={onYearForward}
            variant={variant}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
          ></MonthCal>
        </div>
      </div>
    </div>
  );
}

function MonthCal({
  selectedMonth,
  selectedMonthStr,
  onMonthSelect,
  callbacks,
  variant,
  minDate,
  maxDate,
  disabledDates,
  onYearBackward,
  onYearForward,
}) {
  if (!minDate) minDate = new Date(1960, 0);
  if (!maxDate) maxDate = new Date(2050, 11);
  if (minDate && maxDate && minDate > maxDate) minDate = maxDate;

  const initYear = () => {
    if (selectedMonth) {
      return selectedMonth?.getFullYear();
    }
    if (selectedMonthStr) {
      if (selectedMonthStr?.split("-").length > 1) {
        return selectedMonthStr?.split("-")[0];
      }
      return selectedMonthStr?.substring(0, 4);
    }
    let targetDate = new Date();
    if (maxDate < targetDate) {
      targetDate = maxDate;
    }
    return targetDate.getFullYear();
  };
  const initMonth = () => {
    if (selectedMonth) {
      return selectedMonth?.getMonth();
    }
    if (selectedMonthStr) {
      if (selectedMonthStr?.split("-").length > 1) {
        return selectedMonthStr?.split("-")[1] - 1;
      }
      return selectedMonthStr?.substring(4, 6) - 1;
    }
    return new Date().getMonth();
  };
  const [year, setYear] = React.useState(initYear());
  const [month, setMonth] = React.useState(initMonth());
  const [menuYear, setMenuYear] = React.useState(Number(year));
  const [input, setInput] = React.useState(false);

  const disabledDatesMapped = disabledDates?.map((d) => {
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (input && inputRef.current) {
      inputRef.current.focus();
    }
  }, [input]);

  const handleChangeYear = (e) => {
    const value = e.target.value;
    if (
      value &&
      minDate?.getFullYear() <= value &&
      value <= maxDate?.getFullYear()
    ) {
      setMenuYear(e.target.value);
    }
  };

  return (
    <>
      <div className="flex justify-center pt-1 relative items-center">
        <div className="flex justify-center items-center text-sm font-medium">
          {input ? (
            <Input
              ref={inputRef}
              className="px-2 py-1 mr-1 h-8"
              type="number"
              step="1"
              defaultValue={menuYear}
              min={minDate?.getFullYear()}
              max={maxDate?.getFullYear()}
              onChange={(e) => handleChangeYear(e)}
              onBlur={() => setInput(false)}
            />
          ) : (
            <span className="cursor-pointer" onClick={() => setInput(true)}>
              {callbacks?.yearLabel ? callbacks?.yearLabel(menuYear) : menuYear}
            </span>
          )}
          年
        </div>
        <div className="space-x-1 flex items-center">
          <button
            onClick={() => {
              setMenuYear(menuYear - 1);
              if (onYearBackward) onYearBackward();
            }}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? "outline" }),
              "inline-flex items-center justify-center h-7 w-7 p-0 absolute left-1"
            )}
          >
            <ChevronLeft className="opacity-50 h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setMenuYear(menuYear + 1);
              if (onYearForward) onYearForward();
            }}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? "outline" }),
              "inline-flex items-center justify-center h-7 w-7 p-0 absolute right-1"
            )}
          >
            <ChevronRight className="opacity-50 h-4 w-4" />
          </button>
        </div>
      </div>
      <table className="w-full border-collapse space-y-1">
        <tbody>
          {MONTHS.map((monthRow, a) => {
            return (
              <tr key={"row-" + a} className="flex w-full mt-2">
                {monthRow.map((m) => {
                  return (
                    <td
                      key={m.number}
                      className="h-10 w-1/4 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                    >
                      <button
                        onClick={() => {
                          setMonth(m.number);
                          setYear(menuYear);
                          if (onMonthSelect)
                            onMonthSelect(new Date(menuYear, m.number));
                        }}
                        disabled={
                          (maxDate
                            ? menuYear > maxDate?.getFullYear() ||
                              (menuYear == maxDate?.getFullYear() &&
                                m.number > maxDate.getMonth())
                            : false) ||
                          (minDate
                            ? menuYear < minDate?.getFullYear() ||
                              (menuYear == minDate?.getFullYear() &&
                                m.number < minDate.getMonth())
                            : false) ||
                          (disabledDatesMapped
                            ? disabledDatesMapped?.some(
                                (d) => d.year == menuYear && d.month == m.number
                              )
                            : false)
                        }
                        className={cn(
                          buttonVariants({
                            variant:
                              month == m.number && menuYear == year
                                ? variant?.calendar?.selected ?? "default"
                                : variant?.calendar?.main ?? "ghost",
                          }),
                          "h-full w-full p-0 font-normal aria-selected:opacity-100"
                        )}
                      >
                        {callbacks?.monthLabel
                          ? callbacks.monthLabel(m)
                          : m.name}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

MonthPicker.displayName = "MonthPicker";

export { MonthPicker };
