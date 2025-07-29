import { useState } from "react";

export type TabType = "active" | "history";

export const useGroupsTabs = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>("active");

  const switchToActive = () => setSelectedTab("active");
  const switchToHistory = () => setSelectedTab("history");

  return {
    selectedTab,
    setSelectedTab,
    switchToActive,
    switchToHistory,
    isActiveTab: selectedTab === "active",
    isHistoryTab: selectedTab === "history",
  };
};
