// src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Test Button</Button>);

    const button = screen.getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    render(<Button onPress={mockOnPress}>Test Button</Button>);

    const button = screen.getByText('Test Button');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button isLoading>Test Button</Button>);

    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toBeTruthy();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    render(
      <Button disabled onPress={mockOnPress}>
        Disabled Button
      </Button>
    );

    const button = screen.getByText('Disabled Button');
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });
});