import { supabase } from '../supabase';

// Create a schema-specific client
export const createSchemaClient = (schemaName: string) => {
  return {
    // Check if user exists in specific schema
    async checkUserExists(email: string) {
      try {
        // Use raw SQL to query the specific schema
        const { data, error } = await supabase
          .rpc('check_user_in_schema', {
            schema_name: schemaName,
            user_email: email
          });
        
        return { data, error };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Create user profile in specific schema
    async createUserProfile(profileData: any) {
      try {
        // Use raw SQL to insert into specific schema
        const { data, error } = await supabase
          .rpc('create_profile_in_schema', {
            schema_name: schemaName,
            profile_data: profileData
          });
        
        return { data, error };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Get user profile from specific schema
    async getUserProfile(userId: string) {
      try {
        // Use raw SQL to query the specific schema
        const { data, error } = await supabase
          .rpc('get_user_from_schema', {
            schema_name: schemaName,
            user_id: userId
          });
        
        return { data, error };
      } catch (error) {
        return { data: null, error };
      }
    }
  };
};

// Alternative approach: Use direct table access with schema prefix
export const querySchemaTable = async (schemaName: string, tableName: string, operation: string, data?: any) => {
  try {
    switch (operation) {
      case 'select':
        return await supabase
          .from(`${schemaName}.${tableName}`)
          .select('*');
      
      case 'insert':
        return await supabase
          .from(`${schemaName}.${tableName}`)
          .insert(data)
          .select();
      
      case 'update':
        return await supabase
          .from(`${schemaName}.${tableName}`)
          .update(data)
          .select();
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    return { data: null, error };
  }
};
