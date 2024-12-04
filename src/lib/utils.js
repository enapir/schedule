import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FORMAT_NO_LIST } from "../data/master";
import { base62ToString, stringToBase62 } from "./base62";
import { format } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}

export function invertColor(hex, bw) {
  if (!hex) {
    hex = "#FFFFFF";
  }
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    return "#000000";
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    // https://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 102 ? "#000000" : "#FFFFFF";
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

export function deepClone(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  } else {
    const clone = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = deepClone(obj[key]);
      }
    }
    return clone;
  }
}

export function getDateDiffInYears(dateString) {
  const today = new Date();
  const [year, month] = dateString.split("-").map(Number);
  const pastDate = new Date(year, month - 1);

  let diffYear = today.getFullYear() - pastDate.getFullYear();
  let diffMonth = today.getMonth() - pastDate.getMonth();

  if (diffMonth < 0) {
    diffYear--;
    diffMonth += 12;
  }

  const totalYears = diffYear + diffMonth / 12;

  return totalYears.toFixed(1);
}

export function convertToYearsMonths(yearsString) {
  const parts = (yearsString + "").split(".");
  const years = parseInt(parts[0]);
  const months = parseInt((parts[1] / 10) * 12);

  if (isNaN(months)) {
    return `${years}年`;
  } else {
    return `${years}年${months}ヶ月`;
  }
}

// const ENC_KEY = "box-resume"; //固定に設定
export function encryptResumeId(docId, resumeId) {
  if (!docId || !resumeId) return null;
  const plainText = `${docId}-${resumeId}`;
  // return encodeURIComponent(
  //   CryptoJS.AES.encrypt(plainText, ENC_KEY).toString()
  // );
  return stringToBase62(plainText);
}

export function getDocId(encryptedId) {
  if (!encryptedId) return undefined;
  // const decrypted = CryptoJS.AES.decrypt(encryptedId, ENC_KEY);
  // if (decrypted) {
  //   try {
  //     const str = decrypted.toString(CryptoJS.enc.Utf8);
  //     if (str.length > 0) {
  //       return str.split("-")[0];
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  // return null;
  return base62ToString(encryptedId).split("-")[0];
}

export const isMobile = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

export const calculateAge = (birthday) => {
  const birthDate = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const isAdmin = (userEmail) => {
  return userEmail === import.meta.env.VITE_ADMIN_USER;
};

export const getFullFormatNo = (formatNo) => {
  const foundFormat = FORMAT_NO_LIST.find(
    (format) => format.value === formatNo
  );
  return foundFormat ? `${foundFormat.value} : ${foundFormat.label}` : formatNo;
};

export const getFullPowerPlantId = (powerPlantId) => {
  return powerPlantId?.replace(/(.{2})(?=(.{4})+$)/g, "$1-");
};

export const getCurrentTime = () => {
  const now = new Date();

  const year = now.getFullYear().toString().padStart(4, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const currentTimeString = `${year}${month}${day}${hours}${minutes}${seconds}`;

  return currentTimeString;
};

export const getControlRateLabel = (formatNo) => {
  const foundFormat = FORMAT_NO_LIST.find(
    (format) => format.value === formatNo
  );
  return foundFormat ? `${foundFormat.rateLabel || ""}` : formatNo;
};

export const generateMonthlyControlRates = (startMonth, months = 13) => {
  const result = {};
  const startDate = new Date(startMonth + "-01T00:00:00Z"); // 開始年月をDate型に変換

  for (let i = 0; i < months; i++) {
    // 年月キーを作成 (yyyyMM010000形式)
    const year = startDate.getUTCFullYear();
    const month = String(startDate.getUTCMonth() + 1).padStart(2, "0");
    const key = `${year}${month}010000`;

    // その月の日数を取得
    const daysInMonth = new Date(year, startDate.getUTCMonth(), 0).getUTCDate();

    // 30分区切りの個数を計算 (24時間 × 2回/時間 × 日数)
    const list = new Array(daysInMonth * 48).fill(100); // 全て100で埋めたリスト

    // 結果オブジェクトに追加
    result[key] = list;

    // 次の月に進む
    startDate.setUTCMonth(startDate.getUTCMonth() + 1);
  }

  return result;
};

export const generateCalendarData = (startMonth, months = 13) => {
  const result = {};
  const startYear = parseInt(startMonth.slice(0, 4), 10);
  const startMonthNum = parseInt(startMonth.slice(5, 7), 10);

  for (let i = 0; i < months; i++) {
    const date = new Date(startYear, startMonthNum - 1 + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        label: `${year}${month}${String(day).padStart(2, "0")}010000`,
        timeSlots: Array(48).fill(100), // 30分区切りのスロット数（48）
      });
    }

    // 正しい曜日配置（日曜日スタート）
    const firstDayOfWeek = new Date(year, date.getMonth(), 1).getDay(); // 月の1日の曜日 (0: 日曜日)
    const paddedDays = [
      ...Array(firstDayOfWeek).fill(null), // 空白部分（曜日調整）
      ...days,
    ];
    result[`${year}${month}010000`] = paddedDays;
  }

  return result;
};

export const generateCalendarDataByDay = (startDay, days = 7) => {
  const timeSlotsPerDay = 48; // 30分区切り (24時間 ÷ 0.5時間)
  const timeSlotValue = ""; // 初期値
  const result = {};

  // 指定日から7日間のデータを生成
  const startDate = `${startDay.substring(0, 4)}-${startDay.substring(
    4,
    6
  )}-${startDay.substring(6, 8)}`;

  const monthKey = startDay;
  result[monthKey] = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    // 日付のラベル (yyyyMMdd形式)
    const dayKey = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

    // timeSlots 配列を生成
    const timeSlots = Array(timeSlotsPerDay).fill(timeSlotValue);

    // 最初に曜日調整用のnull値を追加
    if (i === 0) {
      const firstDayOfWeek = currentDate.getDay(); // 日曜: 0, 月曜: 1, ..., 土曜: 6
      for (let j = 0; j < firstDayOfWeek; j++) {
        result[monthKey].push(null);
      }
    }

    result[monthKey].push({
      day: dayKey,
      timeSlots: timeSlots,
    });
  }

  return result;
};

export const convertToCalendarData = (l, startMonth = "yyyyMM010000") => {
  const startYear = parseInt(startMonth.slice(0, 4), 10);
  const startMonthNum = parseInt(startMonth.slice(4, 6), 10);

  const date = new Date(startYear, startMonthNum - 1, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();

  const days = [];

  // lからのデータを取得し、1ヶ月分のtimeSlotsを設定
  let timeSlotIndex = 0; // lのインデックス

  // 月の日数に対してループ
  for (let day = 1; day <= daysInMonth; day++) {
    const dayString = `${year}${month}${String(day).padStart(2, "0")}010000`;

    // 30分毎にtimeSlotsを1488個ずつ追加
    const timeSlots = [];
    for (let i = 0; i < 48; i++) {
      // 1日の時間スロットは48（30分区切り）
      timeSlots.push(l[timeSlotIndex]);
      timeSlotIndex++;
    }

    days.push({
      day,
      label: dayString,
      timeSlots: timeSlots,
    });
  }

  // データを月ごとに格納
  const firstDayOfWeek = new Date(year, date.getMonth(), 1).getDay(); // 月の1日の曜日
  const paddedDays = [
    ...Array(firstDayOfWeek).fill(null), // 曜日調整のため空白を挿入
    ...days,
  ];

  return paddedDays;
};

export const mergeRatesIntoDates = (dates, startTime, rates) => {
  const startDayKey = startTime.slice(0, 8); // yyyyMMdd
  const startHour = parseInt(startTime.slice(8, 10), 10); // HH
  const startMinute = parseInt(startTime.slice(10, 12), 10); // mm
  const startIndex = (startHour * 60 + startMinute) / 30; // 30分ごとのインデックス

  let currentRatesIndex = 0; // ratesのインデックス
  let currentDayKey = startDayKey;
  let currentTimeIndex = startIndex;

  while (currentRatesIndex < rates.length) {
    const day = Object.values(dates)
      .flat()
      .find((d) => d && d.day.replace(/-/g, "") === currentDayKey);
    if (!day) break;

    const timeSlots = day.timeSlots;

    while (
      currentRatesIndex < rates.length &&
      currentTimeIndex < timeSlots.length
    ) {
      timeSlots[currentTimeIndex] = rates[currentRatesIndex];
      currentRatesIndex++;
      currentTimeIndex++;
    }

    // 翌日に切り替え
    if (
      currentTimeIndex >= timeSlots.length &&
      currentRatesIndex < rates.length
    ) {
      const year = parseInt(currentDayKey.slice(0, 4), 10);
      const month = parseInt(currentDayKey.slice(4, 6), 10) - 1; // JavaScriptでは0-11
      const day = parseInt(currentDayKey.slice(6, 8), 10);

      // 現在の日付から翌日を取得
      const nextDate = new Date(year, month, day);
      nextDate.setDate(nextDate.getDate() + 1);
      console.log(nextDate);
      console.log(nextDate.toISOString());

      // 次の日のdayKeyを更新
      currentDayKey = format(nextDate, "yyyyMMdd"); // yyyyMMdd形式
      currentTimeIndex = 0; // リセット
    }
  }

  return dates;
};

export const isValidControlRate = (rate) => {
  rate = rate.trim();

  const intPattern = /^\d+$/;
  if (intPattern.test(rate)) {
    const num = Number(rate);
    return num >= 0 && num <= 100;
  } else {
    return false;
  }
};

export const isValidTime = (input, length) => {
  // 1. 入力が数字のみかを確認
  if (!/^\d+$/.test(input)) {
    return false;
  }

  // 2. 長さが12または14文字かを確認
  if (input.length !== length) {
    return false;
  }

  // 3. 長さが14文字未満の場合、末尾に0を追加
  if (input.length === 12) {
    input = input.padEnd(14, "0");
  }

  // 4. 日付形式を検証 (yyyyMMddhhmmss)
  const year = parseInt(input.slice(0, 4), 10);
  const month = parseInt(input.slice(4, 6), 10);
  const day = parseInt(input.slice(6, 8), 10);
  const hour = parseInt(input.slice(8, 10), 10);
  const minute = parseInt(input.slice(10, 12), 10);
  const second = parseInt(input.slice(12, 14), 10);

  const date = new Date(year, month - 1, day, hour, minute, second);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return false;
  }

  return true;
};

export const isValid203Rates = (rates) => {
  if (/^,+$/.test(rates)) {
    return false;
  }

  if (/\d+,{2,}\d+/.test(rates)) {
    return false;
  }

  const parts = rates.split(",").filter((part) => part !== "");

  const hasNumber = parts.some((part) => !isNaN(part) && part !== "");
  return hasNumber;
};

export const getFirst203RateIndex = (rates) => {
  const arr = rates.split(",");

  let firstRateIndex = -1;
  for (let i = 0; i < arr.length; i++) {
    if (!isNaN(arr[i]) && arr[i].trim() !== "") {
      firstRateIndex = i;
      break;
    }
  }

  return firstRateIndex;
};
