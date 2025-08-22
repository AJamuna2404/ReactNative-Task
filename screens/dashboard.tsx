import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { createSchemaSpecificClient } from '../utils/supabaseSchemaClient';
import {launchImageLibrary} from 'react-native-image-picker';

type RootStackParamList = {
  Dashboard: { clientId: string };
};

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;
type DashboardRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

interface User {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  profile_image?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  user_name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
}

const Dashboard = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const route = useRoute<DashboardRouteProp>();
  const { clientId } = route.params;

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    user_name: '',
    email: '',
    role: 'user',
    phone: '',
    address: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schemaClient = createSchemaSpecificClient(clientId);

  // Fetch current user profile
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        user =>
          user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await schemaClient.auth.getUser();
      if (user) {
        const { data: profile } = await schemaClient.getUserProfile(user.id);
        if (profile) {
          setCurrentUser(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await schemaClient.getAllUsers();
      if (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to fetch users');
      } else {
        setUsers(data || []);
        setFilteredUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      });

      if (result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri || null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAddUser = () => {
    setIsEditMode(false);
    setFormData({
      user_name: '',
      email: '',
      role: 'user',
      phone: '',
      address: '',
    });
    setSelectedImage(null);
    setIsAddModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
    });
    setSelectedImage(user.profile_image || null);
    setIsModalVisible(true);
  };

  const handleViewUser = (user: User) => {
    setIsEditMode(false);
    setSelectedUser(user);
    setFormData({
      user_name: user.user_name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
    });
    setSelectedImage(user.profile_image || null);
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await schemaClient.deleteUser(userId);
              if (error) {
                Alert.alert('Error', 'Failed to delete user');
              } else {
                Alert.alert('Success', 'User deleted successfully');
                fetchUsers();
                setIsModalVisible(false);
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.user_name.trim() || !formData.email.trim()) {
      Alert.alert('Validation Error', 'Name and email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = selectedImage;

      // Upload image if it's a new image (not a URL)
      if (selectedImage && !selectedImage.startsWith('http')) {
        const { data: uploadData, error: uploadError } = await schemaClient.uploadImage(selectedImage);
        if (uploadError) {
          Alert.alert('Error', 'Failed to upload image');
          return;
        }
        imageUrl = uploadData?.path || null;
      }

      const userData = {
        ...formData,
        profile_image: imageUrl,
      };

      if (isEditMode && selectedUser) {
        const { error } = await schemaClient.updateUser(selectedUser.id, userData);
        if (error) {
          Alert.alert('Error', 'Failed to update user');
        } else {
          Alert.alert('Success', 'User updated successfully');
          fetchUsers();
          setIsModalVisible(false);
        }
      } else {
        const { error } = await schemaClient.createUser(userData);
        if (error) {
          Alert.alert('Error', 'Failed to create user');
        } else {
          Alert.alert('Success', 'User created successfully');
          fetchUsers();
          setIsAddModalVisible(false);
        }
      }
    } catch (error) {
      console.error('Error submitting user:', error);
      Alert.alert('Error', 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await schemaClient.auth.signOut();
      // Navigate back to login or opening screen
      navigation.goBack();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
      onPress={() => handleViewUser(item)}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
          {item.profile_image ? (
            <Image
              source={{ uri: item.profile_image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Icon name="user" size={20} color="#6B7280" />
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{item.user_name}</Text>
          <Text className="text-sm text-gray-600">{item.email}</Text>
          <View className="flex-row items-center mt-1">
            <View className={`px-2 py-1 rounded-full ${
              item.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-medium ${
                item.role === 'admin' ? 'text-red-800' : 'text-blue-800'
              }`}>
                {item.role}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleEditUser(item)}
          className="p-2"
        >
          <Icon name="edit" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderUserModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
        <View className="bg-white rounded-lg w-full max-w-md max-h-[80%]">
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Edit User' : 'User Details'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="p-2"
              >
                <Icon name="times" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="items-center mb-4">
                <TouchableOpacity
                  onPress={handleImagePick}
                  className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden items-center justify-center"
                >
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Icon name="camera" size={30} color="#6B7280" />
                  )}
                </TouchableOpacity>
                {isEditMode && (
                  <Text className="text-sm text-gray-500 mt-2">Tap to change image</Text>
                )}
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Name</Text>
                  <TextInput
                    value={formData.user_name}
                    onChangeText={(text) => setFormData({ ...formData, user_name: text })}
                    editable={isEditMode}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter name"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    editable={isEditMode}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter email"
                    keyboardType="email-address"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Role</Text>
                  <TextInput
                    value={formData.role}
                    onChangeText={(text) => setFormData({ ...formData, role: text })}
                    editable={isEditMode}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter role"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Phone</Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    editable={isEditMode}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Address</Text>
                  <TextInput
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    editable={isEditMode}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter address"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {selectedUser && (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">User ID</Text>
                    <Text className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                      {selectedUser.user_id}
                    </Text>
                  </View>
                )}
              </View>

              {isEditMode && (
                <View className="flex-row space-x-3 mt-6">
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-semibold">Update</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteUser(selectedUser!.id)}
                    className="bg-red-600 py-3 px-4 rounded-lg items-center"
                  >
                    <Icon name="trash" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddUserModal = () => (
    <Modal
      visible={isAddModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsAddModalVisible(false)}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
        <View className="bg-white rounded-lg w-full max-w-md max-h-[80%]">
          <View className="p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Add New User</Text>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(false)}
                className="p-2"
              >
                <Icon name="times" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="items-center mb-4">
                <TouchableOpacity
                  onPress={handleImagePick}
                  className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden items-center justify-center"
                >
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Icon name="camera" size={30} color="#6B7280" />
                  )}
                </TouchableOpacity>
                <Text className="text-sm text-gray-500 mt-2">Tap to add image</Text>
              </View>

              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Name *</Text>
                  <TextInput
                    value={formData.user_name}
                    onChangeText={(text) => setFormData({ ...formData, user_name: text })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter name"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Email *</Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter email"
                    keyboardType="email-address"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Role</Text>
                  <TextInput
                    value={formData.role}
                    onChangeText={(text) => setFormData({ ...formData, role: text })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter role"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Phone</Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Address</Text>
                  <TextInput
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="Enter address"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 py-3 rounded-lg items-center mt-6"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold">Add User</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading users...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-200">
        <View className="flex-row justify-between items-center p-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">User Dashboard</Text>
            <Text className="text-sm text-gray-600">Manage your users</Text>
          </View>
          
          {/* Current User Profile */}
          <View className="flex-row items-center">
            <View className="mr-3">
              <Text className="text-sm font-medium text-gray-900">
                {currentUser?.user_name || 'User'}
              </Text>
              <Text className="text-xs text-gray-600">
                {currentUser?.role || 'User'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
            >
              <Icon name="sign-out" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Icon name="search" size={16} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users by name, email, or role..."
              className="flex-1 ml-2 text-gray-900"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="times" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-4">
        {/* Add User Button */}
        <TouchableOpacity
          onPress={handleAddUser}
          className="bg-blue-600 py-3 rounded-lg items-center mb-4 flex-row justify-center"
        >
          <Icon name="plus" size={16} color="white" />
          <Text className="text-white font-semibold ml-2">Add New User</Text>
        </TouchableOpacity>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Icon name="users" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg mt-4">
              {searchQuery ? 'No users found' : 'No users yet'}
            </Text>
            <Text className="text-gray-400 text-sm mt-2">
              {searchQuery ? 'Try adjusting your search' : 'Add your first user to get started'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {renderUserModal()}
      {renderAddUserModal()}
    </View>
  );
};

export default Dashboard;
