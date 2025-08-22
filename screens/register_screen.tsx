import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { createSchemaSpecificClient } from "../utils/supabaseSchemaClient";

type RootStackParamList = {
  Login: { clientId: string };
  Register: { clientId: string };
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, "Register">;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const route = useRoute<RegisterScreenRouteProp>();
  const { clientId } = route.params;

  const [username, setUsername] = useState("");
  const [usercode, setUsercode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Create schema-specific client
  const schemaClient = createSchemaSpecificClient(clientId);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" };
    }
    return { isValid: true, message: "" };
  };

  // Validation function
  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert("Validation Error", "Username is required");
      return false;
    }
    if (!usercode.trim()) {
      Alert.alert("Validation Error", "User code is required");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Validation Error", "Password is required");
      return false;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert("Validation Error", passwordValidation.message);
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // ✅ Check if user already exists in this schema
      const { data: existingUser, error: checkError } =
        await schemaClient.checkUserExists(email);

      if (existingUser) {
        Alert.alert(
          "Registration Error",
          "A user with this email already exists in this schema."
        );
        return;
      }

      // ✅ Register user with Supabase Auth
      const { data: authData, error: authError } =
        await schemaClient.auth.signUp({
          email,
          password,
        });

      if (authError) {
        console.error("Auth error:", authError);
        Alert.alert("Registration Error", authError.message);
        return;
      }

      if (authData.user) {
        // ✅ Create user profile in the schema
        const profileData = {
          user_id: authData.user.id,
          user_name: username,
          user_code: usercode,
          email: email,
          password: password, // ⚠️ In production hash this
          avatar_url: avatarUrl || undefined,
          role: "User",
          created_at: new Date().toISOString(),
        };

        const { data: profileResult, error: profileError } =
          await schemaClient.createUserProfile(profileData);

        if (profileError) {
          console.error("Profile error:", profileError);
          Alert.alert(
            "Registration Error",
            "Failed to create user profile. Please try again."
          );
          return;
        }

        Alert.alert(
          "Registration Successful",
          "Your account has been created successfully! Please check your email for verification.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login", { clientId }),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Error",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Side - Sign Up Form */}
      <View style={styles.leftPane}>
        <Text style={styles.signUpTitle}>Sign up</Text>
        <View style={styles.schemaInfoContainer}>
        </View>

        {/* Username Input */}
        <View style={styles.inputWrapper}>
          <Icon name="user" size={18} color="#666" />
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.textInput}
            editable={!isLoading}
          />
        </View>

        {/* User Code Input */}
        <View style={styles.inputWrapper}>
          <Icon name="id-card" size={18} color="#666" />
          <TextInput
            placeholder="User Code"
            value={usercode}
            onChangeText={setUsercode}
            style={styles.textInput}
            editable={!isLoading}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Icon name="envelope" size={18} color="#666" />
          <TextInput
            placeholder="Email ID"
            value={email}
            onChangeText={setEmail}
            style={styles.textInput}
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={18} color="#666" />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.textInput}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={18} color="#666" />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.textInput}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.signUpButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.signUpButtonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Right Side - Sign In Prompt */}
      <View style={styles.rightPane}>
        <Text style={styles.rightTitle}>Welcome Back !</Text>
        <Text style={styles.rightDescription}>
          Already have an account? Sign in to continue.
        </Text>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate("Login", { clientId })}
          disabled={isLoading}
        >
          <Text style={styles.signInButtonText}>SIGN IN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
  },
  leftPane: {
    flex: 1.2,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  signUpTitle: {
    fontSize: 35,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  schemaInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  schemaInfo: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    fontStyle: "italic",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: "100%",
    height: 50,
    elevation: 2,
    
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 20,
  },
  generateButton: {
    padding: 8,
    marginLeft: 8,
  },
  signUpButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 15,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  signUpButtonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  rightPane: {
    flex: 0.8,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  rightTitle: {
    color: "#ffffff",
    fontSize: 35,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  rightDescription: {
    color: "#ffffff",
    fontSize: 20,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    opacity: 0.9,
  },
  signInButton: {
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
  },
});
