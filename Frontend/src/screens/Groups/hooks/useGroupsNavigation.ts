import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GroupsStackParamList } from "../../../types/navigation";

type NavigationProp = StackNavigationProp<GroupsStackParamList, "GroupsList">;

export const useGroupsNavigation = () => {
  const navigation = useNavigation<NavigationProp>();

  const navigateToCreateGroup = () => {
    navigation.navigate("CreateGroup");
  };

  const navigateToGroupManagement = (groupId: string) => {
    navigation.navigate("GroupManagement", { groupId });
  };

  const goBack = () => {
    navigation.goBack();
  };

  return {
    navigateToCreateGroup,
    navigateToGroupManagement,
    goBack,
  };
};
