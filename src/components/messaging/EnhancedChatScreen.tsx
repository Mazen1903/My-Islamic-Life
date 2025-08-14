import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Message, SendMessageRequest } from '@/shared/types';
import { supabaseCommunityService } from '@/shared/services/supabase-community.service';

interface EnhancedChatScreenProps {
  conversationId: string;
  participantName: string;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function EnhancedChatScreen({ 
  conversationId, 
  participantName, 
  onClose 
}: EnhancedChatScreenProps) {
  console.log('💬 EnhancedChatScreen opened with:', { conversationId, participantName });
  
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
    setupAudio();
    getCurrentDatabaseUserId();
    
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  const getCurrentDatabaseUserId = async () => {
    try {
      const userId = await supabaseCommunityService.getCurrentDatabaseUserId();
      setCurrentUserId(userId);
      console.log('✅ Current database user ID:', userId);
    } catch (error) {
      console.error('Error getting current database user ID:', error);
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await supabaseCommunityService.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(response.data);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = async (messageData: Partial<SendMessageRequest>) => {
    if (isSending) return;
    
    try {
      setIsSending(true);
      
      const fullMessageData: SendMessageRequest = {
        conversationId,
        content: messageData.content || '',
        messageType: messageData.messageType || 'text',
        ...messageData,
        replyToMessageId: replyToMessage?.id,
      };

      const response = await supabaseCommunityService.sendMessage(fullMessageData);
      
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data!]);
        setInputText('');
        setReplyToMessage(null);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendText = () => {
    if (inputText.trim()) {
      sendMessage({ content: inputText.trim() });
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // In a real app, you'd upload to your storage service first
        sendMessage({
          content: 'Image',
          messageType: 'image',
          mediaUrl: asset.uri,
          mediaSize: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
    setShowMediaOptions(false);
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        sendMessage({
          content: asset.name,
          messageType: 'file',
          mediaUrl: asset.uri,
          mediaFileName: asset.name,
          mediaSize: asset.size,
          mediaMimeType: asset.mimeType,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
    setShowMediaOptions(false);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permission to record voice messages');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri && recordingDuration > 0) {
        sendMessage({
          content: `Voice message (${formatDuration(recordingDuration)})`,
          messageType: 'voice',
          mediaUrl: uri,
          mediaDuration: recordingDuration,
        });
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      await recording.stopAndUnloadAsync();
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessage = (message: Message, index: number) => {
    // Check if this message was sent by the current user using the database user ID
    const isOwnMessage = message.senderId === currentUserId;
    
    // Debug logging to see what's happening
    console.log('🔍 Message debug:', {
      messageId: message.id,
      senderId: message.senderId,
      currentDatabaseUserId: currentUserId,
      clerkUserId: user?.id,
      isOwnMessage,
      content: message.content
    });
    
    return (
      <Animated.View
        key={message.id}
        entering={FadeInDown.delay(index * 50)}
        style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}
      >
        {message.replyToMessage && (
          <View style={[styles.replyPreview, { backgroundColor: colors.border }]}>
            <Text style={[styles.replyAuthor, { color: colors.primary }]}>
              {message.replyToMessage.senderName}
            </Text>
            <Text style={[styles.replyContent, { color: colors.secondaryText }]} numberOfLines={1}>
              {message.replyToMessage.content}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          onLongPress={() => setReplyToMessage(message)}
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwnMessage ? colors.primary : colors.card,
            },
            isOwnMessage && styles.ownMessageBubble,
          ]}
        >
          {renderMessageContent(message, isOwnMessage)}
        </TouchableOpacity>
        
        {/* Sender name below the message */}
        <Text style={[
          styles.senderName, 
          { color: colors.secondaryText },
          isOwnMessage && styles.ownSenderName
        ]}>
          {isOwnMessage ? 'You' : participantName}
        </Text>
        
        <Text style={[
          styles.messageTime, 
          { color: colors.secondaryText },
          isOwnMessage && styles.ownMessageTime
        ]}>
          {new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </Animated.View>
    );
  };

  const renderMessageContent = (message: Message, isOwnMessage: boolean) => {
    const textColor = isOwnMessage ? '#FFFFFF' : colors.text;
    
    switch (message.messageType) {
      case 'image':
        return (
          <View>
            {message.mediaUrl && (
              <Image 
                source={{ uri: message.mediaUrl }} 
                style={styles.messageImage}
                resizeMode="cover"
              />
            )}
            {message.mediaCaption && (
              <Text style={[styles.messageText, { color: textColor }]}>
                {message.mediaCaption}
              </Text>
            )}
          </View>
        );
        
      case 'voice':
        return (
          <View style={styles.voiceMessage}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={16} color={textColor} />
            </TouchableOpacity>
            <View style={[styles.voiceWaveform, { backgroundColor: textColor + '30' }]} />
            <Text style={[styles.voiceDuration, { color: textColor }]}>
              {formatDuration(message.mediaDuration || 0)}
            </Text>
          </View>
        );
        
      case 'file':
        return (
          <View style={styles.fileMessage}>
            <Ionicons name="document" size={24} color={textColor} />
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1}>
                {message.mediaFileName || 'File'}
              </Text>
              <Text style={[styles.fileSize, { color: textColor + 'AA' }]}>
                {message.mediaSize ? `${(message.mediaSize / 1024).toFixed(1)} KB` : ''}
              </Text>
            </View>
          </View>
        );
        
      default:
        return (
          <Text style={[styles.messageText, { color: textColor }]}>
            {message.content}
          </Text>
        );
    }
  };

  const renderInput = () => {
    if (isRecording) {
      return (
        <Animated.View 
          entering={SlideInRight}
          style={[styles.recordingContainer, { backgroundColor: colors.card }]}
        >
          <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.recordingInfo}>
            <View style={[styles.recordingDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.recordingText, { color: colors.text }]}>
              Recording... {formatDuration(recordingDuration)}
            </Text>
          </View>
          
          <TouchableOpacity onPress={stopRecording} style={[styles.sendButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {replyToMessage && (
          <View style={[styles.replyContainer, { backgroundColor: colors.background }]}>
            <View style={styles.replyInfo}>
              <Text style={[styles.replyLabel, { color: colors.primary }]}>
                Replying to {replyToMessage.senderId === 'current-user-id' ? 'yourself' : participantName}
              </Text>
              <Text style={[styles.replyText, { color: colors.secondaryText }]} numberOfLines={1}>
                {replyToMessage.content}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyToMessage(null)}>
              <Ionicons name="close" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <TouchableOpacity 
            onPress={() => setShowMediaOptions(true)}
            style={styles.attachButton}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.secondaryText}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          
          {inputText.trim() ? (
            <TouchableOpacity 
              onPress={handleSendText}
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              disabled={isSending}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={startRecording}
              style={[styles.voiceButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="mic" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.participantName, { color: colors.text }]}>
            {participantName}
          </Text>
          <Text style={[styles.onlineStatus, { color: colors.success }]}>
            Online
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
              Loading messages...
            </Text>
          </View>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
      </ScrollView>

      {/* Input */}
      {renderInput()}

      {/* Media Options Modal */}
      <Modal
        visible={showMediaOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMediaOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMediaOptions(false)}
        >
          <View style={[styles.mediaOptionsContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.mediaOption} onPress={handleImagePicker}>
              <Ionicons name="image" size={24} color={colors.primary} />
              <Text style={[styles.mediaOptionText, { color: colors.text }]}>Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaOption} onPress={handleDocumentPicker}>
              <Ionicons name="document" size={24} color={colors.primary} />
              <Text style={[styles.mediaOptionText, { color: colors.text }]}>Document</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  onlineStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  messageContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  replyPreview: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    maxWidth: '75%',
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyContent: {
    fontSize: 12,
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: '75%',
    minWidth: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownMessageBubble: {
    borderBottomRightRadius: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
    marginLeft: 4,
  },
  ownSenderName: {
    marginLeft: 0,
    marginRight: 4,
    textAlign: 'right',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.45,
    borderRadius: 8,
    marginBottom: 4,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voiceWaveform: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  voiceDuration: {
    fontSize: 12,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
  },
  fileInfo: {
    marginLeft: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  messageTime: {
    fontSize: 10,
    marginLeft: 4,
  },
  ownMessageTime: {
    marginLeft: 0,
    marginRight: 4,
    textAlign: 'right',
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyInfo: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 12,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    marginRight: 12,
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  mediaOptionsContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  mediaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  mediaOptionText: {
    fontSize: 16,
    marginLeft: 16,
  },
});