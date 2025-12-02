import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity 
} from 'react-native';
import colors from '../theme/colors';
import ActionButton from './ActionButton';

interface EmailModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (email: string) => void;
  loading?: boolean;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  visible,
  onClose,
  onSend,
  loading = false,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    onSend(email);
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Email Results</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive the analysis results
          </Text>
          
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            placeholder="your@email.com"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email input"
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <ActionButton
              title="Send Email"
              onPress={handleSend}
              loading={loading}
              disabled={!email.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.inputText,
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmailModal;
