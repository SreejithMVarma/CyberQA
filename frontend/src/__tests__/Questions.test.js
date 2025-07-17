import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Questions from '../pages/Questions';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('Questions Page', () => {
  const user = { id: '1', username: 'test', role: 'user' };
  const questions = [{ _id: '1', questionText: 'Test question', type: 'numeric', difficulty: 'easy', tags: ['test'] }];

  beforeEach(() => {
    mock.reset();
    mock.onGet('http://localhost:5000/api/questions').reply(200, questions);
  });

  it('renders questions', async () => {
    render(
      <AuthContext.Provider value={{ user, loading: false }}>
        <MemoryRouter>
          <Questions />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    await waitFor(() => {
      expect(screen.getByText('Test question')).toBeInTheDocument();
    });
  });
});