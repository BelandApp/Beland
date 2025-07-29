import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { colors } from "../../styles/colors";
import {
  InstagramService,
  InstagramUser,
} from "../../services/instagramService";

interface InstagramSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onUserSelect: (user: InstagramUser) => void;
  placeholder?: string;
  error?: string;
  style?: any;
}

export const InstagramSearchInput: React.FC<InstagramSearchInputProps> = ({
  value,
  onChangeText,
  onUserSelect,
  placeholder = "@usuario_instagram",
  error,
  style,
}) => {
  const [suggestions, setSuggestions] = useState<InstagramUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InstagramUser | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length > 0 && !selectedUser) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      animateSuggestions(false, 0);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, selectedUser]);

  const searchUsers = async (query: string) => {
    setIsLoading(true);
    try {
      const users = await InstagramService.searchUsers(query);
      setSuggestions(users);
      setShowSuggestions(users.length > 0);
      animateSuggestions(users.length > 0, users.length);
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
      animateSuggestions(false, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const animateSuggestions = (show: boolean, itemCount: number = 0) => {
    const targetHeight = show ? Math.min(itemCount * 80, 240) : 0;

    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleTextChange = (text: string) => {
    setSelectedUser(null);
    onChangeText(text);
  };

  const handleUserSelect = (user: InstagramUser) => {
    setSelectedUser(user);
    setShowSuggestions(false);
    animateSuggestions(false, 0);
    onChangeText(user.username);
    onUserSelect(user);
  };

  const renderSuggestionItem = ({ item }: { item: InstagramUser }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleUserSelect(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.profile_pic_url }} style={styles.profilePic} />
      <View style={styles.suggestionInfo}>
        <View style={styles.suggestionHeader}>
          <Text style={styles.username}>@{item.username}</Text>
          {item.is_verified && <Text style={styles.verifiedBadge}>✓</Text>}
        </View>
        <Text style={styles.fullName}>{item.full_name}</Text>
        {item.follower_count && (
          <Text style={styles.followerCount}>
            {item.follower_count.toLocaleString()} seguidores
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={[styles.textInput, error && styles.textInputError]}
            placeholder={placeholder.replace("@", "")}
            value={value.replace(/^@/, "")}
            onChangeText={handleTextChange}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#A0A0A0"
          />
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={colors.belandOrange}
              style={styles.loadingIndicator}
            />
          )}
        </View>

        {selectedUser && (
          <View style={styles.selectedUserPreview}>
            <Image
              source={{ uri: selectedUser.profile_pic_url }}
              style={styles.selectedProfilePic}
            />
          </View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Animated.View
        style={[styles.suggestionsContainer, { height: animatedHeight }]}
      >
        {showSuggestions && (
          <ScrollView
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {suggestions.map((item) => (
              <View key={item.username}>{renderSuggestionItem({ item })}</View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.textSecondary + "40",
    borderRadius: 12,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  atSymbol: {
    fontSize: 16,
    color: colors.belandOrange,
    fontWeight: "600",
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  textInputError: {
    borderColor: colors.error,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  selectedUserPreview: {
    paddingRight: 12,
  },
  selectedProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.belandOrange,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 5,
    marginLeft: 16,
  },
  suggestionsContainer: {
    overflow: "hidden",
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsList: {
    maxHeight: 210,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + "20",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  verifiedBadge: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.belandGreen,
  },
  fullName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  followerCount: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
