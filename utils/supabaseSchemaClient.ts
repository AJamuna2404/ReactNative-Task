import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';

const supabaseUrl = "https://vuluqxsntvwzptwxhark.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bHVxeHNudHZ3enB0d3hoYXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDc1ODQsImV4cCI6MjA3MTMyMzU4NH0.Lsb8PJTHhMhlchEklFya0k_9knjA8I8jWbOINn-kHcU";

// ✅ Schema validation constants
export const VALID_SCHEMAS = ['s22', 'big7'] as const;
export type ValidSchema = typeof VALID_SCHEMAS[number];

// ✅ Simple schema validation function
export const isValidSchema = (schemaName: string): schemaName is ValidSchema => {
  return VALID_SCHEMAS.includes(schemaName.toLowerCase() as ValidSchema);
};


export const createSchemaSpecificClient = (schemaName: string) => {
  // Create a client with the specific schema
  const client = createClient(supabaseUrl, supabaseAnonKey);

  return {
    // Check user
    async checkUserExists(email: string) {
      const { data, error } = await supabase.schema(schemaName)
        .from('profiles')   // No need for schema prefix when using db.schema
        .select("*")
        .eq("email", email)
        .single();
      return { data, error };
    },

    // Create profile
    async createUserProfile(profileData: any) {
      const { data, error } = await supabase.schema(schemaName)
        .from('profiles')   // No need for schema prefix when using db.schema
        .insert([profileData])
        .select();
      return { data, error };
    },

    // Get profile
    async getUserProfile(userId: string) {
      const { data, error } = await supabase.schema(schemaName)
        .from('profiles')   // No need for schema prefix when using db.schema
        .select("*")
        .eq("user_id", userId)
        .single();
      return { data, error };
    },

    // Get all users
    async getAllUsers() {
      const { data, error } = await supabase.schema(schemaName)
        .from('profiles')
        .select("*")
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create user
    async createUser(userData: any) {
      const { data, error } = await supabase.schema(schemaName)
        .from('profiles')
        .insert([userData])
        .select();
      return { data, error };
    },

    // Update user
    async updateUser(userId: string, userData: any) {
      const { data, error } = await supabase.schema(schemaName)
        .from('profiles')
        .update(userData)
        .eq('id', userId)
        .select();
      return { data, error };
    },

    // Delete user
    async deleteUser(userId: string) {
      const { data, error } = await supabase.schema(schemaName)
        .from('profiles')
        .delete()
        .eq('id', userId);
      return { data, error };
    },

    // Upload image
    async uploadImage(imageUri: string) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = `profile_${Date.now()}.jpg`;
        
        const { data, error } = await supabase.storage
          .from('profile-images')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
          });

        if (error) {
          return { data: null, error };
        }

        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);

        return { data: { path: urlData.publicUrl }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    auth: client.auth,
  };
};