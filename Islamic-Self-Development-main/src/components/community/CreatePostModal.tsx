import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string, type: 'text' | 'image' | 'poll', pollData?: any, settings?: { privacy: string; topic: string }, imageData?: any) => void;
  isCreating: boolean;
}

export default function CreatePostModal({ visible, onClose, onSubmit, isCreating }: CreatePostModalProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'image' | 'poll'>('text');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [privacy, setPrivacy] = useState('Public');
  const [topic, setTopic] = useState('General');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');

  const handleSubmit = () => {
    if (!content.trim() && postType !== 'image') {
      alert('Please enter some content for your post');
      return;
    }
    
    if (postType === 'poll' && (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2)) {
      alert('Please provide a poll question and at least 2 options');
      return;
    }

    if (postType === 'image' && !selectedImage) {
      alert('Please select an image for your post');
      return;
    }

    const pollData = postType === 'poll' ? {
      question: pollQuestion,
      options: pollOptions.filter(opt => opt.trim()),
    } : undefined;

    const imageData = postType === 'image' ? {
      uri: selectedImage,
      caption: imageCaption,
    } : undefined;

    const settings = {
      privacy,
      topic
    };

    onSubmit(content, postType, pollData, settings, imageData);
    
    // Reset form
    setContent('');
    setPostType('text');
    setPollQuestion('');
    setPollOptions(['', '']);
    setPrivacy('Public');
    setTopic('General');
    setSelectedImage(null);
    setImageCaption('');
  };

  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your camera');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Post</Text>
          <TouchableOpacity 
            style={[
              styles.postButton, 
              { 
                backgroundColor: isCreating ? colors.border : colors.primary,
                opacity: isCreating ? 0.6 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={isCreating}
          >
            <Text style={styles.postButtonText}>
              {isCreating ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.username, { color: colors.text }]}>{getUserDisplayName()}</Text>
          </View>
          
          <TextInput
            style={[styles.postInput, { color: colors.text }]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.secondaryText}
            multiline
            value={content}
            onChangeText={setContent}
          />
          
          <Text style={[styles.addToPostLabel, { color: colors.text }]}>Add to your post:</Text>
          <View style={styles.mediaOptions}>
            <TouchableOpacity 
              style={[
                styles.mediaOption, 
                { backgroundColor: postType === 'image' ? colors.primary + '20' : colors.card }
              ]}
              onPress={() => setPostType('image')}
            >
              <Ionicons name="image-outline" size={20} color={postType === 'image' ? colors.primary : colors.text} />
              <Text style={[styles.mediaOptionText, { color: postType === 'image' ? colors.primary : colors.secondaryText }]}>
                Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.mediaOption, 
                { backgroundColor: postType === 'poll' ? colors.primary + '20' : colors.card }
              ]}
              onPress={() => setPostType('poll')}
            >
              <Ionicons name="stats-chart-outline" size={20} color={postType === 'poll' ? colors.primary : colors.text} />
              <Text style={[styles.mediaOptionText, { color: postType === 'poll' ? colors.primary : colors.secondaryText }]}>
                Poll
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.mediaOption, 
                { backgroundColor: postType === 'text' ? colors.primary + '20' : colors.card }
              ]}
              onPress={() => setPostType('text')}
            >
              <Ionicons name="create-outline" size={20} color={postType === 'text' ? colors.primary : colors.text} />
              <Text style={[styles.mediaOptionText, { color: postType === 'text' ? colors.primary : colors.secondaryText }]}>
                Text
              </Text>
            </TouchableOpacity>
          </View>

          {/* Poll Creation Section */}
          {postType === 'poll' && (
            <View style={styles.pollCreation}>
              <Text style={[styles.pollLabel, { color: colors.text }]}>Poll Question</Text>
              <TextInput
                style={[styles.pollQuestionInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Ask a question..."
                placeholderTextColor={colors.secondaryText}
                value={pollQuestion}
                onChangeText={setPollQuestion}
              />
              
              <Text style={[styles.pollLabel, { color: colors.text }]}>Options</Text>
              {pollOptions.map((option, index) => (
                <View key={index} style={styles.pollOptionRow}>
                  <TextInput
                    style={[styles.pollOptionInput, { color: colors.text, borderColor: colors.border }]}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={colors.secondaryText}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = text;
                      setPollOptions(newOptions);
                    }}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity
                      style={styles.removeOptionButton}
                      onPress={() => {
                        const newOptions = pollOptions.filter((_, i) => i !== index);
                        setPollOptions(newOptions);
                      }}
                    >
                      <Ionicons name="close" size={16} color={colors.secondaryText} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {pollOptions.length < 5 && (
                <TouchableOpacity
                  style={[styles.addOptionButton, { borderColor: colors.border }]}
                  onPress={() => setPollOptions([...pollOptions, ''])}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={[styles.addOptionText, { color: colors.primary }]}>Add option</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Image Upload Section */}
          {postType === 'image' && (
            <View style={styles.imageUploadSection}>
              <Text style={[styles.imageLabel, { color: colors.text }]}>Add Image</Text>
              
              {selectedImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageUploadOptions}>
                  <TouchableOpacity
                    style={[styles.imageUploadButton, { borderColor: colors.border }]}
                    onPress={pickImage}
                  >
                    <Ionicons name="images-outline" size={24} color={colors.primary} />
                    <Text style={[styles.imageUploadText, { color: colors.primary }]}>Choose from Library</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.imageUploadButton, { borderColor: colors.border }]}
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera-outline" size={24} color={colors.primary} />
                    <Text style={[styles.imageUploadText, { color: colors.primary }]}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {selectedImage && (
                <View style={styles.imageCaptionContainer}>
                  <Text style={[styles.imageLabel, { color: colors.text }]}>Image Caption (Optional)</Text>
                  <TextInput
                    style={[styles.imageCaptionInput, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Add a caption..."
                    placeholderTextColor={colors.secondaryText}
                    value={imageCaption}
                    onChangeText={setImageCaption}
                    multiline
                  />
                </View>
              )}
            </View>
          )}
          
          <View style={styles.postSettings}>
            <TouchableOpacity 
              style={[styles.settingButton, { backgroundColor: colors.card }]}
              onPress={() => setShowPrivacyModal(true)}
            >
              <Text style={[styles.settingText, { color: colors.text }]}>Privacy: {privacy}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingButton, { backgroundColor: colors.card }]}
              onPress={() => setShowTopicModal(true)}
            >
              <Text style={[styles.settingText, { color: colors.text }]}>Topic: {topic}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
                 </ScrollView>
       </View>

       {/* Privacy Selection Modal */}
       <Modal
         visible={showPrivacyModal}
         transparent={true}
         animationType="fade"
       >
         <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
           <View style={[styles.selectionModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <Text style={[styles.selectionTitle, { color: colors.text }]}>Select Privacy</Text>
             {['Public', 'Friends Only', 'Private'].map((option) => (
               <TouchableOpacity
                 key={option}
                 style={[
                   styles.selectionOption,
                   { 
                     backgroundColor: privacy === option ? colors.primary + '20' : 'transparent',
                     borderColor: colors.border
                   }
                 ]}
                 onPress={() => {
                   setPrivacy(option);
                   setShowPrivacyModal(false);
                 }}
               >
                 <Text style={[
                   styles.selectionOptionText, 
                   { color: privacy === option ? colors.primary : colors.text }
                 ]}>
                   {option}
                 </Text>
                 {privacy === option && (
                   <Ionicons name="checkmark" size={20} color={colors.primary} />
                 )}
               </TouchableOpacity>
             ))}
             <TouchableOpacity
               style={[styles.cancelButton, { borderColor: colors.border }]}
               onPress={() => setShowPrivacyModal(false)}
             >
               <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>

       {/* Topic Selection Modal */}
       <Modal
         visible={showTopicModal}
         transparent={true}
         animationType="fade"
       >
         <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
           <View style={[styles.selectionModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <Text style={[styles.selectionTitle, { color: colors.text }]}>Select Topic</Text>
             {['General', 'Islamic Practice', 'Book Study', 'Habit Building', 'Community Support', 'Personal Growth'].map((option) => (
               <TouchableOpacity
                 key={option}
                 style={[
                   styles.selectionOption,
                   { 
                     backgroundColor: topic === option ? colors.primary + '20' : 'transparent',
                     borderColor: colors.border
                   }
                 ]}
                 onPress={() => {
                   setTopic(option);
                   setShowTopicModal(false);
                 }}
               >
                 <Text style={[
                   styles.selectionOptionText, 
                   { color: topic === option ? colors.primary : colors.text }
                 ]}>
                   {option}
                 </Text>
                 {topic === option && (
                   <Ionicons name="checkmark" size={20} color={colors.primary} />
                 )}
               </TouchableOpacity>
             ))}
             <TouchableOpacity
               style={[styles.cancelButton, { borderColor: colors.border }]}
               onPress={() => setShowTopicModal(false)}
             >
               <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
     </Modal>
   );
 }

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  postInput: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  addToPostLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  mediaOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mediaOption: {
    width: 80,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mediaOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pollCreation: {
    marginTop: 16,
    gap: 12,
  },
  pollLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pollQuestionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollOptionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  removeOptionButton: {
    marginLeft: 8,
    padding: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addOptionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  postSettings: {
    gap: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  settingText: {
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectionModal: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectionOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  imageUploadSection: {
    marginTop: 16,
    gap: 12,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageUploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageUploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  imageCaptionContainer: {
    marginTop: 12,
  },
  imageCaptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
}); 