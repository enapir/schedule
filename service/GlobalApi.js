import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/ene-cloud-schedule",
  headers: {
    "Content-Type": "application/json",
  },
});

// ここは仮に最大1000件までに制限する
const GetScheduleList = () => axiosClient.get("/list?current=1&size=500");

const SaveSchedule = (data) => axiosClient.post("/save", data);

const DeleteSchedule = (id) => axiosClient.post("/remove?id=" + id);

const DownloadSchedule = (id) =>
  axiosClient.get("/download?id=" + id, {
    responseType: "blob",
  });

const GetSchedule = (id) => axiosClient.get("/detail?id=" + id);

const SaveScheduleControls = (data) => axiosClient.post("/control/save", data);

const SaveAllScheduleControls = (data) =>
  axiosClient.post("/control/save_all", data);

export default {
  GetScheduleList,
  SaveSchedule,
  DeleteSchedule,
  DownloadSchedule,
  GetSchedule,
  SaveScheduleControls,
  SaveAllScheduleControls,
};
