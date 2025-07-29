import { useState } from "react";
import { TabType } from "../types";

export const useGroupManagementTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("content");

  return {
    activeTab,
    setActiveTab,
  };
};
