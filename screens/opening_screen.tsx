import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../supabase";
type RootStackParamList = {
  Login: { clientId: string };
  Register: { clientId: string };
  TestSchema: undefined;
};

type OpeningScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const OpeningScreen = () => {
  const navigation = useNavigation<OpeningScreenNavigationProp>();
  const [clientId, setClientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  // 🔍 Real-time schema validation
  useEffect(() => {
    if (!clientId.trim()) {
      setValidationStatus(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      
      // Validate that the schema is one of the allowed schemas
      const validSchemas = ['s22', 'big7'];
      const schemaName = clientId.trim().toLowerCase();
      
      if (!validSchemas.includes(schemaName)) {
        setValidationStatus({
          isValid: false,
          message: `Entered schema. Please use one of the following: ${validSchemas.join(', ')}`,
        });
        setIsLoading(false);
        return;
      }

      // Try to validate the schema with Supabase
      try {
        const { data, error } = await supabase.rpc("validate_schema", {
          schema_name: schemaName,
        });

        console.log("Response:", data);
        console.log("Error:", error);

        if (error) {
          // If the RPC function doesn't exist, fall back to basic validation
          if (error.code === '42883') { // Function does not exist
            setValidationStatus({
              isValid: true,
              message: `Schema '${schemaName}' is valid`,
            });
          } else if (error.message?.includes('Network request failed')) {
            // Handle network errors gracefully
            console.warn('Network request failed, using fallback validation');
            setValidationStatus({
              isValid: true,
              message: `Schema '${schemaName}' is valid (offline mode)`,
            });
          } else {
            setValidationStatus({
              isValid: false,
              message: error.message || "Schema validation failed",
            });
          }
        } else {
          setValidationStatus({
            isValid: data?.isValid ?? true,
            message: data?.message || `Schema '${schemaName}' is valid`,
          });
        }
      } catch (error) {
        console.error('Schema validation error:', error);
        // Fallback validation - if RPC fails, accept valid schema names
        setValidationStatus({
          isValid: true,
          message: `Schema '${schemaName}' is valid (offline mode)`,
        });
      }
      
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [clientId]);


  const handleSubmit = async () => {
    if (!clientId.trim()) {
      Alert.alert("Error", "Please enter a schema name.");
      return;
    }

    if (!validationStatus?.isValid) {
      Alert.alert("Validation Failed", "Schema does not exist or is not accessible.");
      return;
    }

    navigation.navigate("Login", { clientId: clientId.trim() });
  };

  const handleNewUser = async () => {
    if (!clientId.trim()) {
      Alert.alert("Error", "Please enter a schema name.");
      return;
    }

    if (!validationStatus?.isValid) {
      Alert.alert("Validation Failed", "Schema does not exist or is not accessible.");
      return;
    }

    navigation.navigate("Register", { clientId: clientId.trim() });
  };

  const isSubmitDisabled = !clientId.trim() || !validationStatus?.isValid;

  return (
    <View style={styles.container}>
      {/* Left Pane */}
      <View style={styles.leftPane}>
        <Text style={styles.leftTitle}>Welcome Back!</Text>
        <Text style={styles.leftSubtitle}>
          Enter your production schema to access your account
        </Text>

        
      </View>

      {/* Right Pane */}
      <View style={styles.rightPane}>
        <Text style={styles.signInTitle}>Enter Client ID</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Client ID"
            value={clientId}
            onChangeText={setClientId}
            style={styles.textInput}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isLoading && <ActivityIndicator size="small" color="#2563eb" />}
          {validationStatus && !isLoading && validationStatus.isValid && (
            <Icon name="check-circle" size={20} color="green" style={{ marginLeft: 8 }} />
          )}
          {validationStatus && !isLoading && !validationStatus.isValid && (
            <Icon name="times-circle" size={20} color="red" style={{ marginLeft: 8 }} />
          )}
        </View>

        {/* Real-time message */}
        {validationStatus && !isLoading && (
          <Text
            style={{
              marginTop: 6,
              color: validationStatus.isValid ? "green" : "red",
              fontSize: 20,
            }}
          >
            {validationStatus.message}
          </Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.loginButton, isSubmitDisabled && styles.disabledLoginButton]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          <Text
            style={[
              styles.loginButtonText,
              isSubmitDisabled && styles.disabledLoginButtonText,
            ]}
          >
            SUBMIT
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OpeningScreen;

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
    fontSize: 35,
    fontWeight: "700",
    marginBottom: 8,
  },
  leftSubtitle: {
    color: "#ffffff",
    fontSize: 25,
    marginBottom: 24,
    textAlign: "center",
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
    fontSize: 30,
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
    marginBottom: 8,
    width: "100%",
    height: 48,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: "#2563eb",
    borderRadius: 9999,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginTop: 12,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: "#ccc",
  },
  disabledButtonText: {
    color: "#ccc",
  },
  disabledLoginButton: {
    opacity: 0.5,
    backgroundColor: "#ccc",
  },
  disabledLoginButtonText: {
    color: "#999",
  },
});
