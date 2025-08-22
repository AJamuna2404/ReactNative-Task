# Schema-Based Multi-Tenant Application

This React Native application implements a multi-tenant architecture using Supabase schemas. Users can select between different database schemas (`s22` or `big7`) to access their specific data.

## How It Works

### 1. Schema Selection (Opening Screen)
- Users are presented with a list of available schemas: `s22` and `big7`
- These schemas must match your Supabase Data API configuration
- Users select their schema using a visual picker interface

### 2. Navigation Flow
```
Opening Screen → Select Schema → Login/Register Screen
     ↓              ↓                    ↓
  Schema List   clientId param    Schema-specific DB operations
```

### 3. Route Parameters
The selected schema is passed as `clientId` parameter to subsequent screens:
- `Login` screen receives `{ clientId: "s22" }` or `{ clientId: "big7" }`
- `Register` screen receives the same parameter

### 4. Database Operations
Each screen uses the `clientId` to create schema-specific database operations:
```typescript
const schemaClient = createSchemaSpecificClient(clientId);
// This creates operations like: s22.profiles, big7.profiles
```

## Supabase Configuration

### Data API Settings
Your Supabase project must have the following Data API configuration:
- **Exposed schemas**: `s22`, `big7`
- **Extra search path**: `s22, big7`

### Schema Structure
Each schema should contain:
- `profiles` table for user data
- Authentication tables (handled by Supabase Auth)

### Row Level Security (RLS)
The schemas use RLS policies that require authentication:
- Users can only access their own profile data
- Admin users can access all profile data
- Unauthenticated access returns permission denied (42501) - this is expected behavior

## Permission Error Handling

### Error Code 42501 (Permission Denied)
This error occurs when trying to access schemas with RLS policies without authentication. The application handles this gracefully:

- **Schema Validation**: Treats 42501 errors as valid schema existence (requires auth)
- **Authentication Check**: All schema operations check authentication status first
- **User Feedback**: Clear error messages guide users to authenticate

### Expected Flow
1. User selects schema (s22 or big7)
2. Schema validation succeeds (even with 42501 error)
3. User proceeds to login/register
4. After authentication, schema operations work normally

## File Structure

```
screens/
├── opening_screen.tsx    # Schema selection interface
├── login_screen.tsx      # Login with schema-specific operations
└── register_screen.tsx   # Registration with schema-specific operations

utils/
└── supabaseSchemaClient.ts  # Schema-specific database client
```

## Key Features

- ✅ **Schema Validation**: Only allows `s22` and `big7` schemas
- ✅ **Supabase Validation**: Validates schemas with Supabase before proceeding
- ✅ **Visual Selection**: User-friendly schema picker interface
- ✅ **Route Parameters**: Selected schema passed as `clientId`
- ✅ **Database Isolation**: Each schema has separate data
- ✅ **Visual Feedback**: Shows selected schema and validation status
- ✅ **Real-time Validation**: Test schema connectivity before login/register
- ✅ **Permission Error Handling**: Gracefully handles 42501 permission errors
- ✅ **Authentication Checks**: Validates user auth before schema operations

## Usage

1. User opens the app
2. User selects their schema (`s22` or `big7`)
3. User can optionally validate the schema with Supabase
4. User presses Continue to proceed to Login or Register
5. Schema is validated with Supabase before navigation
6. All database operations use the selected schema
7. User data is isolated to their chosen schema

## Schema Validation

The app now validates schemas with Supabase before allowing users to proceed:

- **Validation Process**: Attempts to query the `profiles` table in the selected schema
- **Error Handling**: Detects PGRST106 errors (schema not exposed in Data API)
- **Permission Handling**: Treats 42501 errors as valid (schema exists, requires auth)
- **Visual Feedback**: Shows validation status with success/error messages
- **Pre-navigation Check**: Validates schema before navigating to Login/Register screens

This architecture allows multiple organizations or environments to use the same application while keeping their data completely separate.
