import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";

interface StatsCardProps {
  title: string;
  subtitle: string | React.ReactNode;
  value: string | number | React.ReactNode;
}

const StatsCard = ({ title, subtitle, value }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>

      <CardContent>
        <span className="text-3xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
