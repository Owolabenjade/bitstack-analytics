// src/components/portfolio/__tests__/PortfolioList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PortfolioList } from '../PortfolioList'
import { usePortfolioStore } from '@/stores/portfolioStore'

jest.mock('@/stores/portfolioStore')

describe('PortfolioList', () => {
  const mockPortfolios = [
    {
      id: '1',
      name: 'Main Portfolio',
      description: 'My main portfolio',
      assets: [
        {
          id: 'a1',
          symbol: 'BTC',
          name: 'Bitcoin',
          amount: 0.5,
          purchasePrice: 30000,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    ;(usePortfolioStore as unknown as jest.Mock).mockReturnValue({
      portfolios: mockPortfolios,
      deletePortfolio: jest.fn(),
      setActivePortfolio: jest.fn(),
    })
  })

  it('renders portfolio list', () => {
    render(<PortfolioList />)

    expect(screen.getByText('Main Portfolio')).toBeInTheDocument()
    expect(screen.getByText('My main portfolio')).toBeInTheDocument()
  })

  it('handles portfolio deletion', () => {
    const mockDelete = jest.fn()
    ;(usePortfolioStore as unknown as jest.Mock).mockReturnValue({
      portfolios: mockPortfolios,
      deletePortfolio: mockDelete,
      setActivePortfolio: jest.fn(),
    })

    render(<PortfolioList />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(mockDelete).toHaveBeenCalledWith('1')
  })
})