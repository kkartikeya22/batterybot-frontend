// src/context/TableReading.jsx
import React, { createContext, useState, useEffect } from "react";

export const TableContext = createContext();

export const TableProvider = ({ children }) => {
    const [zoneData, setZoneData] = useState(null);

    useEffect(() => {
        const fetchSheetData = async () => {
            try {
                const sheetId = "1Vg1vjdZmd43CE8s-k-lYQYTLPsKkhhUpcWIa0mZQXtg";
                const sheetNames = [
                    "Raw_IOT_school_college",
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
                    "Raw_Cross_Swap"
                ];

                const allZoneData = {};

                for (const sheetName of sheetNames) {
                    const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;
                    const response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`❌ Failed to fetch ${sheetName}: ${response.status}`);
                    }

                    const rows = await response.json();

                    for (const row of rows) {
                        const zoneId =
                            row.zoneId || row["Zone ID"] || row["zone"] || row["TaggedZone"];

                        if (!zoneId) continue;

                        if (!allZoneData[zoneId]) {
                            allZoneData[zoneId] = {};
                        }

                        if (!allZoneData[zoneId][sheetName]) {
                            allZoneData[zoneId][sheetName] = [];
                        }

                        allZoneData[zoneId][sheetName].push(row);
                    }
                }

                // ✅ Filter only zoneIds that end with two digits
                const filteredZoneData = Object.fromEntries(
                    Object.entries(allZoneData).filter(([zoneId]) => /\d{2}$/.test(zoneId))
                );

                setZoneData(filteredZoneData);
            } catch (error) {
                console.error("❌ Error fetching sheet data:", error);
            }
        };

        fetchSheetData();
    }, []);

    return (
        <TableContext.Provider value={{ zoneData }}>
            {children}
        </TableContext.Provider>
    );
};
