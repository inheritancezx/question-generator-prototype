import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuestionGenerator from '../QuestionGenerator.jsx';

// Mock fetch
global.fetch = jest.fn();

describe('QuestionGenerator', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders component correctly', () => {
    render(<QuestionGenerator />);
    expect(screen.getByText('Prompt Question Generator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter a theme/)).toBeInTheDocument();
  });

  test('button is disabled when input is empty', () => {
    render(<QuestionGenerator />);
    const button = screen.getByRole('button', { name: /Generate/ });
    expect(button).toBeDisabled();
  });

  test('button is enabled when input has text', () => {
    render(<QuestionGenerator />);
    const input = screen.getByPlaceholderText(/Enter a theme/);
    const button = screen.getByRole('button', { name: /Generate/ });
    
    fireEvent.change(input, { target: { value: 'space' } });
    expect(button).not.toBeDisabled();
  });

  test('displays questions when API call succeeds', async () => {
    const mockQuestions = ['Question 1?', 'Question 2?'];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: mockQuestions }),
    });

    render(<QuestionGenerator />);
    const input = screen.getByPlaceholderText(/Enter a theme/);
    const button = screen.getByRole('button', { name: /Generate/ });
    
    fireEvent.change(input, { target: { value: 'space' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
      expect(screen.getByText('Question 2?')).toBeInTheDocument();
    });
  });

  test('displays error when API call fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    });

    render(<QuestionGenerator />);
    const input = screen.getByPlaceholderText(/Enter a theme/);
    const button = screen.getByRole('button', { name: /Generate/ });
    
    fireEvent.change(input, { target: { value: 'space' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
});