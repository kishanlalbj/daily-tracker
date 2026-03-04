import PageTitle from "@/components/page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";
import React from "react";

const AssetPage = () => {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto flex flex-col gap-6">
      <PageTitle
        title="Assets and Liabilities"
        subtitle="Track your assets and liabilities to get a clear picture of your financial health."
      />
      <Alert>
        <Construction className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          This feature is under development. Check back soon.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AssetPage;
