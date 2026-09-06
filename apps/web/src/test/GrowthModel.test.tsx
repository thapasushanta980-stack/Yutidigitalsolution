import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GrowthModel } from '../components/GrowthModel.js';

describe('GrowthModel', () => {
  it('renders an accessible growth diagram with all nodes', () => {
    render(<GrowthModel />);
    expect(screen.getByRole('img', { name: /growth model/i })).toBeInTheDocument();
    expect(screen.getByText('Organic')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Compounding')).toBeInTheDocument();
    expect(screen.getByText(/Fig\. 01/)).toBeInTheDocument();
  });
});
