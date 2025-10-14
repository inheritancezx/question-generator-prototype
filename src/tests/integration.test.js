import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuestionGenerator from '../components/QuestionGenerator';

// This tests the actual API call (requires running server)
describe('QuestionGenerator Integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ questions: ['Q1?', 'Q2?'] }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  test('end-to-end question generation', async () => {
    render(<QuestionGenerator />);
    
    const input = screen.getByPlaceholderText(/Enter a theme/);
    const button = screen.getByRole('button', { name: /Generate/ });
    
    fireEvent.change(input, { target: { value: 'testing' } });
    fireEvent.click(button);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Check if questions are displayed
    const questions = screen.getAllByRole('listitem');
    expect(questions.length).toBeGreaterThan(0);
  }, 15000);
});