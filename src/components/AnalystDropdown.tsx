import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  StyleSheet,
  Platform 
} from 'react-native';
import colors from '../theme/colors';
import { YouTubeAnalyst } from '../types';

interface AnalystDropdownProps {
  analysts: YouTubeAnalyst[];
  selectedAnalyst: YouTubeAnalyst | null;
  onSelectAnalyst: (analyst: YouTubeAnalyst) => void;
}

export const AnalystDropdown: React.FC<AnalystDropdownProps> = ({
  analysts,
  selectedAnalyst,
  onSelectAnalyst,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (analyst: YouTubeAnalyst) => {
    onSelectAnalyst(analyst);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Stock Analyst Channel</Text>
      <TouchableOpacity 
        style={styles.dropdown}
        onPress={() => setIsOpen(true)}
        accessibilityLabel="Select analyst dropdown"
        accessibilityRole="button"
      >
        <Text style={styles.selectedText}>
          {selectedAnalyst?.name || 'Select an analyst'}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Analyst</Text>
            <FlatList
              data={analysts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedAnalyst?.id === item.id && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                  accessibilityLabel={`Select ${item.name}`}
                  accessibilityRole="button"
                >
                  <Text 
                    style={[
                      styles.optionText,
                      selectedAnalyst?.id === item.id && styles.optionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedAnalyst?.id === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectedText: {
    color: colors.inputText,
    fontSize: 16,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
    }),
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionSelected: {
    backgroundColor: colors.dropdownItemHover,
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
});

export default AnalystDropdown;
