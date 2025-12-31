import React, { ReactNode } from "react";

type PageTitleProps = {
  title: string;
  subtitle?: string;
  actionSlot?: ReactNode;
};

const PageTitle = ({ title, subtitle, actionSlot }: PageTitleProps) => {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{title}</h1>
        {actionSlot}
      </div>
      <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
    </div>
  );
};

export default PageTitle;
