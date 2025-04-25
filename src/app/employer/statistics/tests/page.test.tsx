// src/app/employer/statistics/tests/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentStats from '../page'; // Adjust path

// Mock dependencies
jest.mock('lucide-react', () => ({
    Search: () => <div data-testid="icon-search">S</div>,
    Eye: () => <div data-testid="icon-eye">E</div>,
    TrendingUp: () => <div data-testid="icon-trendingup">T</div>,
    FileText: () => <div data-testid="icon-filetext">F</div>,
}));

// Mock recharts components
jest.mock('recharts', () => {
    const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-responsive-container" style={{ width: '100%', height: '300px' }}>
            {children}
        </div>
    );
    const MockLineChart = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-line-chart">{children}</div>
    );
    const MockXAxis = () => <div data-testid="mock-xaxis">XAxis</div>;
    const MockYAxis = () => <div data-testid="mock-yaxis">YAxis</div>;
    const MockTooltip = () => <div data-testid="mock-tooltip">Tooltip</div>;
    const MockCartesianGrid = () => <div data-testid="mock-grid">Grid</div>;
    const MockLine = ({ dataKey }: { dataKey: string }) => (
        <div data-testid={`mock-line-${dataKey}`}>Line: {dataKey}</div>
    );

    return {
        ResponsiveContainer: MockResponsiveContainer,
        LineChart: MockLineChart,
        XAxis: MockXAxis,
        YAxis: MockYAxis,
        Tooltip: MockTooltip,
        CartesianGrid: MockCartesianGrid,
        Line: MockLine,
    };
});


describe('DocumentStats Component', () => {

    // Note: This component uses hardcoded mock data internally.
    // Tests will verify rendering based on that mock data.
    // In a real application, you would likely pass data via props or fetch it,
    // requiring different testing strategies (mocking props/API calls).

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render header, filters, and title', () => {
        render(<DocumentStats />);
        expect(screen.getByRole('heading', { name: /document statistics/i })).toBeInTheDocument();
        expect(screen.getByText(/track document engagement/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/search documents/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument(); // Timeframe select
        expect(screen.getByTestId('icon-search')).toBeInTheDocument();
    });

    test('should render overview cards with calculated totals', () => {
        render(<DocumentStats />);
        // Based on mock data: views = 245 + 187 + 156 = 588; avg = 588 / 3 = 196
        expect(screen.getByText(/total views/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '588' })).toBeInTheDocument(); // Total
        expect(screen.getByText(/average views/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '196' })).toBeInTheDocument(); // Average
        expect(screen.getAllByTestId('icon-eye')).toHaveLength(1);
        expect(screen.getAllByTestId('icon-trendingup')).toHaveLength(3); // 1 in avg card + 2 in trends
    });

    test('should render chart components', () => {
        render(<DocumentStats />);
        expect(screen.getByRole('heading', { name: /monthly view trends/i })).toBeInTheDocument();
        expect(screen.getByTestId('mock-responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('mock-xaxis')).toBeInTheDocument();
        expect(screen.getByTestId('mock-yaxis')).toBeInTheDocument();
        expect(screen.getByTestId('mock-tooltip')).toBeInTheDocument();
        expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
        expect(screen.getByTestId('mock-line-views')).toBeInTheDocument(); // Check line for 'views' dataKey
    });

    test('should render document list table with data', () => {
        render(<DocumentStats />);
        expect(screen.getByRole('heading', { name: /document performance/i })).toBeInTheDocument();
        // Check headers
        expect(screen.getByText('Document')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Views')).toBeInTheDocument();
        expect(screen.getByText('Last Viewed')).toBeInTheDocument();
        expect(screen.getByText('Trend')).toBeInTheDocument();

        // Check some data rows based on mock data
        expect(screen.getByText(/financial report/i)).toBeInTheDocument();
        expect(screen.getByText('Financial')).toBeInTheDocument();
        expect(screen.getByText('245')).toBeInTheDocument(); // Views for report
        expect(screen.getByText('2025-01-15')).toBeInTheDocument();
        expect(screen.getByText('+12%')).toBeInTheDocument();

        expect(screen.getByText(/employee handbook/i)).toBeInTheDocument();
        expect(screen.getByText('HR')).toBeInTheDocument();
        expect(screen.getByText('187')).toBeInTheDocument();

         expect(screen.getAllByTestId('icon-filetext')).toHaveLength(3); // Icon for each doc row
    });

    test('should update search term state on input', async () => {
        const user = userEvent.setup();
        render(<DocumentStats />);
        const searchInput = screen.getByPlaceholderText(/search documents/i);
        await user.type(searchInput, 'Report');
        expect(searchInput).toHaveValue('Report');
        // Note: Filtering logic isn't implemented in the component based on searchTerm state,
        // so we only test that the state *could* be updated.
    });

    test('should update timeframe state on select change', async () => {
        const user = userEvent.setup();
        render(<DocumentStats />);
        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('6m'); // Default value
        await user.selectOptions(select, '3m');
        expect(select).toHaveValue('3m');
         await user.selectOptions(select, '1y');
        expect(select).toHaveValue('1y');
        // Note: Filtering/chart data changes based on timeframe aren't implemented,
        // so we only test that the state *could* be updated.
    });
});