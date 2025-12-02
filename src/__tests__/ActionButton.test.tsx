/**
 * Tests for ActionButton Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActionButton } from '../components/ActionButton';

describe('ActionButton', () => {
  it('should render with correct title', () => {
    const { getByText } = render(
      <ActionButton title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton title="Press Me" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <ActionButton title="Disabled" onPress={mockOnPress} disabled />
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    const { getByText } = render(
      <ActionButton title="Loading" onPress={() => {}} loading />
    );
    
    expect(getByText('Processing...')).toBeTruthy();
  });

  it('should not call onPress while loading', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <ActionButton title="Loading" onPress={mockOnPress} loading />
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should render secondary variant', () => {
    const { getByText } = render(
      <ActionButton title="Secondary" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Secondary')).toBeTruthy();
  });
});
