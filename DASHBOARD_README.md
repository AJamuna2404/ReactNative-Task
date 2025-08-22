# User Dashboard

A comprehensive user management dashboard built with React Native and Supabase.

## Features

### 🎯 Core Functionality
- **User List Display**: View all users with their basic information (name, email, role)
- **Search Functionality**: Search users by name, email, or role
- **CRUD Operations**: Create, Read, Update, and Delete user records
- **Image Upload**: Profile image upload and management
- **User Details Modal**: Detailed view of user information including user ID and extra fields

### 🎨 UI/UX Features
- **Modern Design**: Clean, responsive interface using Tailwind CSS
- **User Profile Display**: Current logged-in user information in the top-right corner
- **Loading States**: Proper loading indicators and error handling
- **Empty States**: Helpful messages when no users are found
- **Modal Interfaces**: Smooth modal interactions for user details and forms

### 🔧 Technical Features
- **TypeScript**: Fully typed components and interfaces
- **Supabase Integration**: Real-time database operations with schema support
- **Image Handling**: Profile image upload to Supabase storage
- **Navigation**: Seamless navigation between screens
- **Form Validation**: Input validation and error handling

## User Interface Components

### Header Section
- Dashboard title and description
- Current user profile display (name and role)
- Logout button

### Search Bar
- Real-time search functionality
- Clear search option
- Search across name, email, and role fields

### User List
- User cards with profile images
- Role badges (admin/user with different colors)
- Quick edit button on each card
- Tap to view detailed information

### User Details Modal
- Profile image with upload capability
- Editable form fields (in edit mode):
  - Name
  - Email
  - Role
  - Phone
  - Address
- User ID display (read-only)
- Update and Delete buttons (in edit mode)

### Add User Modal
- Complete user creation form
- Image upload functionality
- Required field validation
- Submit with loading state

## Database Schema

The dashboard works with a `profiles` table in Supabase with the following structure:

```sql
profiles (
  id: uuid (primary key)
  user_id: uuid (auth user reference)
  user_name: text
  email: text
  role: text
  profile_image: text (URL)
  phone: text (optional)
  address: text (optional)
  created_at: timestamp
  updated_at: timestamp
)
```

## API Methods

The dashboard uses the following Supabase operations:

- `getAllUsers()`: Fetch all users with ordering
- `createUser(userData)`: Create new user
- `updateUser(userId, userData)`: Update existing user
- `deleteUser(userId)`: Delete user
- `uploadImage(imageUri)`: Upload profile image to storage
- `getUserProfile(userId)`: Get current user profile

## Navigation Flow

1. **Opening Screen** → Select client/schema
2. **Login Screen** → Authenticate user
3. **Dashboard** → Manage users

## Dependencies

- `react-native-vector-icons`: Icons
- `expo-image-picker`: Image selection
- `@supabase/supabase-js`: Database operations
- `nativewind`: Tailwind CSS styling
- `@react-navigation/native`: Navigation

## Usage

1. Navigate to the dashboard after login
2. Use the search bar to find specific users
3. Tap on user cards to view details
4. Use the edit button to modify user information
5. Add new users using the "Add New User" button
6. Upload profile images by tapping the image area in forms

## Error Handling

- Network errors with user-friendly messages
- Form validation with clear error states
- Image upload error handling
- Database operation error feedback

## Security

- Schema-based data isolation
- User authentication required
- Proper error handling without exposing sensitive information
- Input sanitization and validation

