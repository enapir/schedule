export const DATA_MODE_PRODUCTION = "production";
export const DATA_MODE_TEST = "test";

export const FORMAT_NO_LIST = [
  {
    value: "201",
    label: "固定スケジュール（年間）",
    rateLabel: "固定スケジュール13ヶ月分",
  },
  {
    value: "202",
    label: "固定スケジュール（月間）",
    rateLabel: "固定スケジュール1ヶ月分",
  },
  {
    value: "203",
    label: "更新スケジュール",
    rateLabel: "更新スケジュールの最長7日分",
  },
  {
    value: "301",
    label: "ID登録確認結果",
    // disabled: true,
  },
];

export const REGISTER_CONFIRM_RESULT_LIST = [
  {
    value: "0",
    label: "0 : ID登録済み",
  },
  {
    value: "1",
    label: "1 : ID未登録",
  },
];
