"use client";
import { ChartLineMultiple } from "@/components/chat-line-multiple";
import { BASE_API_URL } from "@/constants";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";

const DashboardPage = () => {
  const [healthChartData, setHealthChartData] = useState([]);
  const user = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/dashboard`);

        const result = await res.json();

        setHealthChartData(result?.data?.healthData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mt-12">
      <h1 className="text-2xl">
        <span> Good Night..! </span> {user?.first_name} {user?.last_name}
      </h1>

      <div className="mt-8 grid md:grid-cols-3 gap-2">
        <ChartLineMultiple chartData={healthChartData} />
      </div>
    </div>
  );
};

export default DashboardPage;
