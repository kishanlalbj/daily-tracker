import React, { ReactNode } from "react";

type PageTitleProps = {
  title: string;
  subtitle?: string;
  actionSlot?: ReactNode;
};

const PageTitle = ({ title, subtitle, actionSlot }: PageTitleProps) => {
  return (
    <div className="w-full mb-6 md:mb-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="md:mt-1">{actionSlot}</div>
      </div>
    </div>
  );
};

export default PageTitle;
