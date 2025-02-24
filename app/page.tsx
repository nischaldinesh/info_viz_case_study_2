"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import Papa from "papaparse";

interface VisitorData {
  date?: string;
  week?: string;
  month?: string;
  visitors: number;
  [key: string]: string | number | undefined;
}

export default function VisitorAnalysis() {
  const [data, setData] = useState<VisitorData[]>([]);
  const [weeklyData, setWeeklyData] = useState<VisitorData[]>([]);
  const [monthlyData, setMonthlyData] = useState<VisitorData[]>([]);
  const [visitorTypeData, setVisitorTypeData] = useState<VisitorData[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          processData(result.data);
        },
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processData = (parsedData: any[]) => {
    const dailyData: Record<string, number> = {};
    const weeklyDataMap: Record<string, number> = {};
    const monthlyDataMap: Record<string, number> = {};
    const visitorTypeMap: Record<string, Record<string, number>> = {};

    parsedData.forEach((row) => {
      const date = row["Date"];
      const visitors = row["Number of Visitors"] || 0;
      const visitorType = row["Visitor Type"];
      const month = date?.slice(0, 7) || "";
      const week = date
        ? `${date.slice(0, 4)}-W${Math.ceil(parseInt(date.slice(8, 10)) / 7)}`
        : "";

      if (date) dailyData[date] = (dailyData[date] || 0) + visitors;
      if (week) weeklyDataMap[week] = (weeklyDataMap[week] || 0) + visitors;
      if (month)
        monthlyDataMap[month] = (monthlyDataMap[month] || 0) + visitors;
      if (month && visitorType) {
        if (!visitorTypeMap[month]) visitorTypeMap[month] = {};
        visitorTypeMap[month][visitorType] =
          (visitorTypeMap[month][visitorType] || 0) + visitors;
      }
    });

    setData(
      Object.entries(dailyData).map(([date, visitors]) => ({ date, visitors }))
    );
    setWeeklyData(
      Object.entries(weeklyDataMap).map(([week, visitors]) => ({
        week,
        visitors,
      }))
    );
    setMonthlyData(
      Object.entries(monthlyDataMap).map(([month, visitors]) => ({
        month,
        visitors,
      }))
    );
    setVisitorTypeData(
      Object.entries(visitorTypeMap).map(([month, types]) => ({
        month,
        visitors: Object.values(types).reduce((a, b) => a + b, 0),
        ...types,
      }))
    );
  };

  if (!isClient) return null;

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold">
        Draco National Park Visitor Analysis Dashboard
      </h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-2 p-2 border rounded-md shadow-sm"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        <div className="p-4 bg-white shadow-md">
          <h2 className="text-lg font-semibold mb-2">Daily Visitors</h2>
          <LineChart width={700} height={300} data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Line type="monotone" dataKey="visitors" stroke="#8884d8" />
          </LineChart>
        </div>
        <div className="p-4 bg-white  shadow-md">
          <h2 className="text-lg font-semibold mb-2">Weekly Visitors</h2>
          <LineChart width={700} height={300} data={weeklyData}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Line type="monotone" dataKey="visitors" stroke="#82ca9d" />
          </LineChart>
        </div>
        <div className="p-4 bg-white  shadow-md">
          <h2 className="text-lg font-semibold mb-2">Monthly Visitors</h2>
          <LineChart width={700} height={300} data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Line type="monotone" dataKey="visitors" stroke="#ff7300" />
          </LineChart>
        </div>
        <div className="p-4 bg-white  shadow-md">
          <h2 className="text-lg font-semibold mb-2">
            Visitor Counts Per Type Per Month
          </h2>
          <BarChart width={700} height={300} data={visitorTypeData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="One-day visit" fill="#8884d8" />
            <Bar dataKey="Camping" fill="#82ca9d" />
            <Bar dataKey="RV Center" fill="#ff7300" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
