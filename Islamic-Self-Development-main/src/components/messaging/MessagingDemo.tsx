import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/shared/constants/Colors";
import { useTheme } from "@/shared/contexts/ThemeContext";
import { supabaseCommunityService } from "@/shared/services/supabase-community.service";

export default function MessagingDemo() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];

  const testSearchUsers = async () => {
    try {
      const response = await supabaseCommunityService.searchUsers("test");
      Alert.alert(
        "Search Results",
        `Found ${response.data?.users.length || 0} users`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to search users");
    }
  };

  const testCreateConversation = async () => {
    try {
      const response = await supabaseCommunityService.createConversation({
        participantIds: ["test-user-id"],
        initialMessage: "Hello! This is a test message.",
      });
      Alert.alert(
        "Success",
        response.success
          ? "Conversation created!"
          : "Failed to create conversation"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create conversation");
    }
  };

  const testSendMessage = async () => {
    try {
      const response = await supabaseCommunityService.sendMessage({
        conversationId: "test-conversation-id",
        content: "This is a test message",
        messageType: "text",
      });
      Alert.alert(
        "Success",
        response.success ? "Message sent!" : "Failed to send message"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Messaging Features Demo
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={testSearchUsers}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Test User Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={testCreateConversation}
      >
        <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Test Create Conversation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={testSendMessage}
      >
        <Ionicons name="send" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Test Send Message</Text>
      </TouchableOpacity>

      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          New Features Added:
        </Text>
        <Text style={[styles.infoText, { color: colors.secondaryText }]}>
          • Voice messages with recording
        </Text>
        <Text style={[styles.infoText, { color: colors.secondaryText }]}>
          • Photo and file sharing
        </Text>
        <Text style={[styles.infoText, { color: colors.secondaryText }]}>
          • User discovery and search
        </Text>
        <Text style={[styles.infoText, { color: colors.secondaryText }]}>
          • Reply to messages
        </Text>
        <Text style={[styles.infoText, { color: colors.secondaryText }]}>
          • Enhanced chat interface
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
});
