import { StackScreenProps } from "@react-navigation/stack";
import { GroupsStackParamList } from "../../../types/navigation";

export type GroupManagementScreenProps = StackScreenProps<
  GroupsStackParamList,
  "GroupManagement"
>;

export type TabType = "content" | "payment";
