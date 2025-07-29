import React, { useState } from "react";
import axios from "axios";

const SheetReader = () => {
  const [url, setUrl] = useState("");
  const [sheetData, setSheetData] = useState({});
  const [error, setError] = useState("");

  const handleFetch = async () => {
    try {
      setError("");
      const res = await axios.post("http://localhost:5000/api/sheet/read-sheet", {
        sheetUrl: url,
      });
      setSheetData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch sheet data.");
    }
  };

  return (
    <div>
      <h2>Google Sheet Reader</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste Google Sheet URL here"
      />
      <button onClick={handleFetch}>Fetch Sheet Data</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        {Object.entries(sheetData).map(([sheetName, rows]) => (
          <div key={sheetName} style={{ marginTop: 20 }}>
            <h3>{sheetName}</h3>
            <table border="1" cellPadding="4">
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SheetReader;
