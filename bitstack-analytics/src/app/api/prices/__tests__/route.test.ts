// src/app/api/prices/__tests__/route.test.ts
import { GET } from '../route';
import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = jest.fn();

describe('GET /api/prices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns price data successfully', async () => {
    const mockPriceData = {
      bitcoin: { usd: 50000 },
      ethereum: { usd: 3000 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPriceData,
    });

    const request = new NextRequest('http://localhost:3000/api/prices');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockPriceData);
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const request = new NextRequest('http://localhost:3000/api/prices');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
