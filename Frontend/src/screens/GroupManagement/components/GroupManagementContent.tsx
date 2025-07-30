import React from "react";
import { Group } from "../../../types";
import { TabType } from "../types";
import { GroupContentManager } from "./GroupContentManager";
import { PaymentModeManager } from "./PaymentModeManager";

interface GroupManagementContentProps {
  currentGroup: Group;
  activeTab: TabType;
  isGroupAdmin: boolean;
  onGroupUpdated: (updatedGroup: Group) => void;
}

export const GroupManagementContent: React.FC<GroupManagementContentProps> = ({
  currentGroup,
  activeTab,
  isGroupAdmin,
  onGroupUpdated,
}) => {
  switch (activeTab) {
    case "content":
      return (
        <GroupContentManager
          group={currentGroup}
          onGroupUpdated={onGroupUpdated}
          isReadOnly={!isGroupAdmin}
        />
      );
    case "payment":
      return (
        <PaymentModeManager
          group={currentGroup}
          onGroupUpdated={onGroupUpdated}
          isReadOnly={!isGroupAdmin}
        />
      );
    default:
      return null;
  }
};
