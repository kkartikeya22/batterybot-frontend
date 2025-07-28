// src/utils/fetchSheetData.js
import Tabletop from "tabletop";

// Your spreadsheet ID
const SPREADSHEET_ID = "1Vg1vjdZmd43CE8s-k-lYQYTLPsKkhhUpcWIa0mZQXtg";

// List of all sheet names to fetch
const sheetNames = [
  "Raw_IOT_school_college",
  "Raw_IOT_cross_road",
  "Raw_OPS",
  "Raw_Swaps",
  "Raw_2W-3W_swaps",
  "Raw_Inactivity",
  "Raw_1st_Swaps",
  "Raw_Impounding",
  "Raw_Holidays",
  "Raw_Driver_Range",
  "Raw_Exisitng_vs_onboarded_zonewise_drivers",
  "Raw_Onboarding",
  "Raw_Weather",
  "Raw_Hourly_Swaps",
  "Raw_Cross_Swap",
];

export const fetchAllSheetData = async () => {
  const allData = {};

  const fetchSheet = (sheetName) =>
    new Promise((resolve) => {
      Tabletop.init({
        key: SPREADSHEET_ID,
        wanted: [sheetName],
        simpleSheet: true,
        callback: (data) => {
          resolve(data[sheetName] || []);
        },
      });
    });

  for (const name of sheetNames) {
    const data = await fetchSheet(name);
    allData[name] = data;
  }

  return allData;
};
