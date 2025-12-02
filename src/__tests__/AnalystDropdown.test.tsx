/**
 * Tests for AnalystDropdown Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnalystDropdown } from '../components/AnalystDropdown';
import { DEFAULT_ANALYSTS } from '../types';

describe('AnalystDropdown', () => {
  const mockOnSelectAnalyst = jest.fn();

  beforeEach(() => {
    mockOnSelectAnalyst.mockClear();
  });

  it('should render with default Morningstar selected', () => {
    const { getByText } = render(
      <AnalystDropdown
        analysts={DEFAULT_ANALYSTS}
        selectedAnalyst={DEFAULT_ANALYSTS[0]}
        onSelectAnalyst={mockOnSelectAnalyst}
      />
    );
    
    expect(getByText('Morningstar')).toBeTruthy();
  });

  it('should show label text', () => {
    const { getByText } = render(
      <AnalystDropdown
        analysts={DEFAULT_ANALYSTS}
        selectedAnalyst={DEFAULT_ANALYSTS[0]}
        onSelectAnalyst={mockOnSelectAnalyst}
      />
    );
    
    expect(getByText('Select Stock Analyst Channel')).toBeTruthy();
  });

  it('should open modal on press', () => {
    const { getByText, getByLabelText } = render(
      <AnalystDropdown
        analysts={DEFAULT_ANALYSTS}
        selectedAnalyst={DEFAULT_ANALYSTS[0]}
        onSelectAnalyst={mockOnSelectAnalyst}
      />
    );
    
    const dropdown = getByLabelText('Select analyst dropdown');
    fireEvent.press(dropdown);
    
    // Modal should show all options including the title
    expect(getByText('Select Analyst')).toBeTruthy();
  });

  it('should show all analyst options in modal', () => {
    const { getByLabelText, getAllByText } = render(
      <AnalystDropdown
        analysts={DEFAULT_ANALYSTS}
        selectedAnalyst={DEFAULT_ANALYSTS[0]}
        onSelectAnalyst={mockOnSelectAnalyst}
      />
    );
    
    const dropdown = getByLabelText('Select analyst dropdown');
    fireEvent.press(dropdown);
    
    // Check that required analysts are in the list
    // Morningstar appears twice - once in dropdown and once in modal
    expect(getAllByText('Morningstar').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Mark Roussin CPA').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Nolan Gouveia').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Custom URL').length).toBeGreaterThanOrEqual(1);
  });

  it('should call onSelectAnalyst when option is selected', () => {
    const { getByLabelText, getByText } = render(
      <AnalystDropdown
        analysts={DEFAULT_ANALYSTS}
        selectedAnalyst={DEFAULT_ANALYSTS[0]}
        onSelectAnalyst={mockOnSelectAnalyst}
      />
    );
    
    const dropdown = getByLabelText('Select analyst dropdown');
    fireEvent.press(dropdown);
    
    // Select Mark Roussin CPA
    fireEvent.press(getByText('Mark Roussin CPA'));
    
    expect(mockOnSelectAnalyst).toHaveBeenCalledWith(DEFAULT_ANALYSTS[1]);
  });

  it('should display placeholder when no analyst selected', () => {
    const { getByText } = render(
      <AnalystDropdown
        analysts={DEFAULT_ANALYSTS}
        selectedAnalyst={null}
        onSelectAnalyst={mockOnSelectAnalyst}
      />
    );
    
    expect(getByText('Select an analyst')).toBeTruthy();
  });
});
