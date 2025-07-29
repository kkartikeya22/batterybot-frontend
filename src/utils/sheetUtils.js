import axios from "axios";

// fetchSheetData.js

export const fetchSheetData = async (sheetUrl) => {
  try {
    const response = await axios.post("http://localhost:5000/api/sheet/read-sheet", {
      sheetUrl,
    });

    const { title, data } = response.data; // <- destructure title and data

    return { title, data }; // return both title and sheet data
  } catch (err) {
    console.error("[fetchSheetData] Error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Failed to fetch sheet data.");
  }
};
