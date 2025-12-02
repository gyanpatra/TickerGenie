/**
 * Tests for CustomUrlInput Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomUrlInput } from '../components/CustomUrlInput';

describe('CustomUrlInput', () => {
  it('should render when visible is true', () => {
    const { getByLabelText } = render(
      <CustomUrlInput value="" onChangeText={() => {}} visible={true} />
    );
    
    expect(getByLabelText('Custom YouTube URL input')).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    const { queryByLabelText } = render(
      <CustomUrlInput value="" onChangeText={() => {}} visible={false} />
    );
    
    expect(queryByLabelText('Custom YouTube URL input')).toBeNull();
  });

  it('should show correct label text', () => {
    const { getByText } = render(
      <CustomUrlInput value="" onChangeText={() => {}} visible={true} />
    );
    
    expect(getByText('Or enter a YouTube analyst channel URL')).toBeTruthy();
  });

  it('should show hint text', () => {
    const { getByText } = render(
      <CustomUrlInput value="" onChangeText={() => {}} visible={true} />
    );
    
    expect(getByText('Enter a YouTube channel URL to analyze the latest video')).toBeTruthy();
  });

  it('should call onChangeText when text is entered', () => {
    const mockOnChangeText = jest.fn();
    const { getByLabelText } = render(
      <CustomUrlInput value="" onChangeText={mockOnChangeText} visible={true} />
    );
    
    const input = getByLabelText('Custom YouTube URL input');
    fireEvent.changeText(input, 'https://www.youtube.com/@NewChannel');
    
    expect(mockOnChangeText).toHaveBeenCalledWith('https://www.youtube.com/@NewChannel');
  });

  it('should display the current value', () => {
    const { getByDisplayValue } = render(
      <CustomUrlInput
        value="https://www.youtube.com/@TestChannel"
        onChangeText={() => {}}
        visible={true}
      />
    );
    
    expect(getByDisplayValue('https://www.youtube.com/@TestChannel')).toBeTruthy();
  });

  it('should use custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <CustomUrlInput
        value=""
        onChangeText={() => {}}
        visible={true}
        placeholder="Custom placeholder"
      />
    );
    
    expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('should default placeholder to morningstar URL', () => {
    const { getByPlaceholderText } = render(
      <CustomUrlInput value="" onChangeText={() => {}} visible={true} />
    );
    
    expect(getByPlaceholderText('https://www.youtube.com/@morningstar')).toBeTruthy();
  });
});
