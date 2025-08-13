import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/shared/constants/Colors";
import { useTheme } from "@/shared/contexts/ThemeContext";
import { ConnectedUser } from "@/shared/types";
import { supabaseCommunityService } from "@/shared/services/supabase-community.service";

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  onUserSelected: (selectedUser: ConnectedUser, conversationId?: string) => void;
}

export default function AddUserModal({
  visible,
  onClose,
  onUserSelected,
}: AddUserModalProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ConnectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setUsers([]);
      setHasSearched(false);
    }
  }, [visible]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);

      const response = await supabaseCommunityService.searchUsers(query);

      if (response.success && response.data) {
        setUsers(response.data.users);
      } else {
        Alert.alert("Error", "Failed to search users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (user: ConnectedUser) => {
    try {
      console.log("🔄 User selected:", user.name, user.id);

      // Create or get existing conversation with this user
      console.log("📞 Creating/getting conversation with user:", user.id);
      const response = await supabaseCommunityService.createConversation({
        participantIds: [user.id],
      });

      console.log("📞 Conversation creation response:", response);

      if (response.success && response.data) {
        console.log(
          "✅ Conversation ready with ID:", response.data.id
        );
        onUserSelected(user, response.data.id);
        onClose();
      } else {
        console.error("❌ Failed to create conversation:", response.error);
        Alert.alert("Error", `Failed to start conversation: ${response.error}`);
      }
    } catch (error) {
      console.error("❌ Error creating conversation:", error);
      Alert.alert("Error", "Failed to start conversation");
    }
  };

  const renderUser = ({
    item,
    index,
  }: {
    item: ConnectedUser;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50)}>
      <TouchableOpacity
        style={[
          styles.userItem,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={() => handleUserSelect(item)}
      >
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}
        >
          {item.avatar ? (
            <Text>👤</Text> // You'd use an actual image component here
          ) : (
            <Ionicons name="person" size={20} color={colors.primary} />
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {item.name}
          </Text>

          {item.bio && (
            <Text
              style={[styles.userBio, { color: colors.secondaryText }]}
              numberOfLines={1}
            >
              {item.bio}
            </Text>
          )}

          <View style={styles.userMeta}>
            <View
              style={[
                styles.onlineIndicator,
                {
                  backgroundColor: item.isOnline
                    ? colors.success
                    : colors.border,
                },
              ]}
            />
            <Text style={[styles.onlineText, { color: colors.secondaryText }]}>
              {item.isOnline
                ? "Online"
                : `Last seen ${
                    item.lastSeen
                      ? new Date(item.lastSeen).toLocaleDateString()
                      : "recently"
                  }`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            Searching...
          </Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Find People to Chat With
          </Text>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            Search for other users in the community by name or email
          </Text>
        </View>
      );
    }

    if (users.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Users Found
          </Text>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            Try searching with a different name or email
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            New Message
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by name or email..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                // Debounce search
                setTimeout(() => searchUsers(text), 300);
              }}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setUsers([]);
                  setHasSearched(false);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <View style={styles.content}>
          {users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Quick Actions */}
        {!hasSearched && (
          <View style={[styles.quickActions, { backgroundColor: colors.card }]}>
            <Text style={[styles.quickActionsTitle, { color: colors.text }]}>
              Quick Actions
            </Text>

            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Browse Community Members
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="star" size={20} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Active Contributors
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userBio: {
    fontSize: 14,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  quickActionText: {
    fontSize: 14,
    marginLeft: 12,
  },
});
