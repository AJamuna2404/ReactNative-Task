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
  Dashboard: { clientId: string };
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;
type LoginScreenRouteProp = RouteProp<RootStackParamList, "Login">;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<LoginScreenRouteProp>();
  const { clientId } = route.params;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Create schema-specific client
  const schemaClient = createSchemaSpecificClient(clientId);

  // Validation function
  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Validation Error", "Password is required");
      return false;
    }
    return true;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // ✅ Authenticate with Supabase Auth
      const { data, error } = await schemaClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        Alert.alert("Login Error", error.message);
        return;
      }

      if (data.user) {
        // ✅ Fetch profile from schema
        const { data: profileData, error: profileError } =
          await schemaClient.getUserProfile(data.user.id);

        if (profileError || !profileData) {
          console.error("Profile fetch error:", profileError);
          Alert.alert(
            "Login Error",
            "User profile not found. Please contact support."
          );
          return;
        }

        Alert.alert("Login Successful", `Welcome back, ${profileData.user_name}!`, [
          {
            text: "OK",
            onPress: () => {
              // Navigate to dashboard
              navigation.navigate("Dashboard", { clientId });
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Side - Sign Up */}
      <View style={styles.leftPane}>
        <Text style={styles.leftTitle}>New here ?</Text>
        <Text style={styles.leftSubtitle}>Then Sign Up and Start Ordering!</Text>
        <View style={styles.schemaInfoContainer}>
          <Icon name="database" size={16} color="#ffffff" />
          <Text style={styles.schemaInfo}>Database: {clientId.toUpperCase()}</Text>
        </View>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("Register", { clientId })}
          disabled={isLoading}
        >
          <Text style={styles.signUpButtonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>

      {/* Right Side - Login */}
      <View style={styles.rightPane}>
        <Text style={styles.signInTitle}>Sign in</Text>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Icon name="user" size={18} color="#666" />
          <TextInput
            placeholder="Email"
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

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity disabled={isLoading}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
  },
  leftPane: {
    flex: 1,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  leftTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  leftSubtitle: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  schemaInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  schemaInfo: {
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 8,
    fontStyle: "italic",
    opacity: 0.9,
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: "#ffffff",
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  signUpButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  rightPane: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  signInTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 9999,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: "100%",
    height: 48,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#2563eb",
    borderRadius: 9999,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginTop: 8,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  forgotPassword: {
    color: "#2563eb",
    marginTop: 16,
    fontSize: 12,
  },
});
