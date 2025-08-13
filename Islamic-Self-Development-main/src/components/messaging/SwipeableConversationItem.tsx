import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { FadeInDown } from "react-native-reanimated";

import { Colors } from "@/shared/constants/Colors";
import { useTheme } from "@/shared/contexts/ThemeContext";
import { Conversation } from "@/shared/types";

interface SwipeableConversationItemProps {
  item: Conversation;
  index: number;
  onPress: () => void;
  onDelete: () => void;
}

export default function SwipeableConversationItem({
  item,
  index,
  onPress,
  onDelete,
}: SwipeableConversationItemProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];

  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      lastOffset.current += translationX;

      // If swiped left more than 100px, show delete action
      if (translationX < -100) {
        // Animate to show delete button
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: true,
        }).start();
        lastOffset.current = -80;
      } else if (translationX > 50) {
        // If swiped right, close the swipe
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        lastOffset.current = 0;
      } else {
        // Return to original position
        Animated.spring(translateX, {
          toValue: lastOffset.current,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // Close the swipe
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            lastOffset.current = 0;
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Animate out and then delete
            Animated.timing(translateX, {
              toValue: -400,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              onDelete();
            });
          },
        },
      ]
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)}
      style={styles.container}
    >
      {/* Delete Button (behind the item) */}
      <View
        style={[
          styles.deleteContainer,
          { backgroundColor: colors.error || "#FF3B30" },
        ]}
      >
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main Conversation Item */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.conversationItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.conversationContent}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>

            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={[styles.messageUser, { color: colors.text }]}>
                  {item.participants[0]?.name || "Unknown"}
                </Text>
                <Text
                  style={[styles.messageTime, { color: colors.secondaryText }]}
                >
                  {new Date(item.lastMessage.timestamp).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.lastMessageContainer}>
                <Text
                  style={[styles.lastMessage, { color: colors.secondaryText }]}
                  numberOfLines={1}
                >
                  {item.lastMessage.content}
                </Text>
                {item.lastMessage.senderId !== "current-user-id" && (
                  <Ionicons
                    name="arrow-down"
                    size={12}
                    color={colors.secondaryText}
                  />
                )}
              </View>
            </View>

            {item.unreadCount > 0 && (
              <View
                style={[
                  styles.unreadBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  deleteContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  conversationItem: {
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  conversationContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageUser: {
    fontSize: 16,
    fontWeight: "600",
  },
  messageTime: {
    fontSize: 12,
  },
  lastMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
