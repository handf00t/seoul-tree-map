import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TreePopup from './TreePopup';

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock Firebase services
jest.mock('../../services/firebase', () => ({
  visitService: {
    getTreeVisits: jest.fn(() => Promise.resolve({ success: true, visits: [] })),
    deleteVisit: jest.fn(() => Promise.resolve({ success: true })),
    uploadVisitPhoto: jest.fn(() => Promise.resolve({ success: true, photoURL: 'test-url' })),
    addVisit: jest.fn(() => Promise.resolve({ success: true }))
  }
}));

// Mock 사용자 데이터
const mockUser = {
  uid: 'test-user-id',
  displayName: '테스트 사용자',
  email: 'test@example.com',
  photoURL: 'https://example.com/photo.jpg'
};

// Mock 나무 데이터
const mockTreeData = {
  source_id: 'tree-123',
  species_kr: '느티나무',
  tree_type: 'protected',
  borough: '강남구',
  district: '역삼동',
  address: '서울특별시 강남구 역삼동 123',
  height_m: 15.5,
  dbh_cm: 45.2,
  total_annual_value_krw: 500000,
  stormwater_liters_year: 1000,
  stormwater_value_krw_year: 50000,
  energy_kwh_year: 200,
  energy_value_krw_year: 30000,
  air_pollution_kg_year: 0.5,
  air_pollution_value_krw_year: 20000,
  carbon_storage_kg_year: 100,
  carbon_value_krw_year: 15000,
  clickCoordinates: { lat: 37.5665, lng: 126.9780 }
};

// Mock auth helper
const setupAuth = (user = null) => {
  mockUseAuth.mockReturnValue({
    user,
    addToFavorites: jest.fn(() => Promise.resolve()),
    removeFromFavorites: jest.fn(() => Promise.resolve()),
    isFavorite: jest.fn(() => false),
    recordTreeView: jest.fn(),
    userFavorites: []
  });
};

describe('TreePopup Component', () => {
  const defaultProps = {
    isVisible: true,
    treeData: mockTreeData,
    onClose: jest.fn(),
    onMinimizedChange: jest.fn(),
    onLoginRequest: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth();
  });

  test('나무 정보가 올바르게 표시되어야 함', () => {
    render(<TreePopup {...defaultProps} />);

    expect(screen.getByText('느티나무')).toBeInTheDocument();
    expect(screen.getByText('보호수')).toBeInTheDocument();
    expect(screen.getByText('강남구 역삼동')).toBeInTheDocument();
  });

  test('닫기 버튼 클릭 시 onClose가 호출되어야 함', () => {
    const onClose = jest.fn();
    render(<TreePopup {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText('닫기');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('나무 높이와 직경이 정확하게 표시되어야 함', () => {
    render(<TreePopup {...defaultProps} />);

    expect(screen.getByText('16m')).toBeInTheDocument(); // Math.round(15.5) = 16
    expect(screen.getByText('45cm')).toBeInTheDocument(); // Math.round(45.2) = 45
    expect(screen.getByText('tree-123')).toBeInTheDocument();
  });

  test('생태적 편익 토글 버튼이 작동해야 함', () => {
    render(<TreePopup {...defaultProps} />);

    const benefitsButton = screen.getByText(/연간 생태적 편익/);

    // 초기에는 편익 상세 정보가 보이지 않음
    expect(screen.queryByText('빗물 흡수')).not.toBeInTheDocument();

    // 버튼 클릭
    fireEvent.click(benefitsButton);

    // 편익 상세 정보가 표시됨
    expect(screen.getByText('빗물 흡수')).toBeInTheDocument();
    expect(screen.getByText('에너지 절약')).toBeInTheDocument();
    expect(screen.getByText('대기 정화')).toBeInTheDocument();
    expect(screen.getByText('탄소 흡수')).toBeInTheDocument();
  });

  test('편익 값이 정확하게 포맷되어 표시되어야 함', () => {
    render(<TreePopup {...defaultProps} />);

    const benefitsButton = screen.getByText(/연간 생태적 편익/);
    fireEvent.click(benefitsButton);

    expect(screen.getByText('1,000L')).toBeInTheDocument();
    expect(screen.getByText('200kWh')).toBeInTheDocument();
    expect(screen.getByText('500g')).toBeInTheDocument(); // 0.5kg * 1000
    expect(screen.getByText('100kg')).toBeInTheDocument();
  });

  test('비로그인 시 즐겨찾기 클릭하면 로그인 요청이 호출되어야 함', () => {
    setupAuth(null); // 비로그인 상태
    const onLoginRequest = jest.fn();
    render(<TreePopup {...defaultProps} onLoginRequest={onLoginRequest} />);

    const favoriteButton = screen.getByText('즐겨찾기');
    fireEvent.click(favoriteButton);

    expect(onLoginRequest).toHaveBeenCalledTimes(1);
  });

  test('공유 버튼 클릭 시 URL이 클립보드에 복사되어야 함', async () => {
    // Mock document.execCommand (fallback clipboard method)
    document.execCommand = jest.fn(() => true);

    render(<TreePopup {...defaultProps} />);

    const shareButton = screen.getByText('공유');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(screen.getByText('완료')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('isVisible이 false면 렌더링되지 않아야 함', () => {
    const { container } = render(<TreePopup {...defaultProps} isVisible={false} />);

    expect(container.firstChild).toBeNull();
  });

  test('treeData가 없으면 렌더링되지 않아야 함', () => {
    const { container } = render(<TreePopup {...defaultProps} treeData={null} />);

    expect(container.firstChild).toBeNull();
  });

  test('편익 데이터가 없으면 편익 섹션이 표시되지 않아야 함', () => {
    const treeWithoutBenefits = {
      ...mockTreeData,
      total_annual_value_krw: null,
      stormwater_liters_year: null,
      energy_kwh_year: null,
      air_pollution_kg_year: null,
      carbon_storage_kg_year: null
    };

    render(<TreePopup {...defaultProps} treeData={treeWithoutBenefits} />);

    expect(screen.queryByText(/연간 생태적 편익/)).not.toBeInTheDocument();
  });

  test('로그인 사용자는 즐겨찾기 버튼을 클릭할 수 있어야 함', async () => {
    const addToFavoritesMock = jest.fn(() => Promise.resolve({ success: true }));
    setupAuth(mockUser);
    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      addToFavorites: addToFavoritesMock
    });

    render(<TreePopup {...defaultProps} />);

    const favoriteButton = screen.getByText('즐겨찾기');
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(addToFavoritesMock).toHaveBeenCalledWith(mockTreeData);
    }, { timeout: 2000 });
  });
});
