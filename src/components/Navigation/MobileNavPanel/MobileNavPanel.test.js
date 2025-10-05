import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MobileNavPanel from './index';

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock Firebase services
jest.mock('../../../services/firebase', () => ({
  visitService: {
    getUserVisits: jest.fn(() => Promise.resolve({ success: true, visits: [] })),
    deleteVisit: jest.fn(() => Promise.resolve({ success: true }))
  }
}));

// Mock Mapbox fetch
global.fetch = jest.fn();

// Mock 사용자 데이터
const mockUser = {
  uid: 'test-user-id',
  displayName: '테스트 사용자',
  email: 'test@example.com',
  photoURL: 'https://example.com/photo.jpg'
};

// Mock 즐겨찾기 데이터
const mockFavorites = [
  {
    id: 'fav-1',
    source_id: 'tree-1',
    species_kr: '은행나무',
    borough: '강남구',
    coordinates: { lat: 37.5665, lng: 126.9780 }
  }
];

// Mock map
const mockMap = {
  flyTo: jest.fn(),
  getLayer: jest.fn(() => true),
  setFilter: jest.fn(),
  queryRenderedFeatures: jest.fn(() => [])
};

// Auth helper
const setupAuth = (user = null, favorites = []) => {
  mockUseAuth.mockReturnValue({
    user,
    userFavorites: favorites,
    signOut: jest.fn(() => Promise.resolve()),
    removeFromFavorites: jest.fn(() => Promise.resolve({ success: true }))
  });
};

describe('MobileNavPanel Component', () => {
  const defaultProps = {
    map: mockMap,
    onFilterClick: jest.fn(),
    activeFilterCount: 0,
    activeFilters: { species: [], sizes: [] },
    onFavoritesClick: jest.fn(),
    onFilterApply: jest.fn(),
    onTreeSelect: jest.fn(),
    isHidden: false,
    minimizedPopupHeight: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuth();
    global.fetch.mockReset();
  });

  test('map이 없으면 렌더링되지 않아야 함', () => {
    setupAuth();
    const { container } = render(<MobileNavPanel {...defaultProps} map={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('기본 HomeView가 렌더링되어야 함', () => {
    setupAuth();
    render(<MobileNavPanel {...defaultProps} />);

    // 검색 입력창 확인
    expect(screen.getByPlaceholderText('검색')).toBeInTheDocument();
  });

  test('로그인 사용자일 때 메뉴 버튼이 표시되어야 함', () => {
    setupAuth(mockUser);
    render(<MobileNavPanel {...defaultProps} />);

    const menuButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('.material-icons')?.textContent === 'menu'
    );
    expect(menuButtons.length).toBeGreaterThan(0);
  });

  test('메뉴 버튼 클릭 시 ProfileMenu가 표시되어야 함', () => {
    setupAuth(mockUser);
    render(<MobileNavPanel {...defaultProps} />);

    const menuButton = screen.getAllByRole('button').find(
      btn => btn.querySelector('.material-icons')?.textContent === 'menu'
    );

    if (menuButton) {
      fireEvent.click(menuButton);

      // ProfileMenu 내용 확인
      expect(screen.getByText(mockUser.displayName)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    }
  });

  test('검색어 입력 시 디바운스 후 검색이 실행되어야 함', async () => {
    setupAuth();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [] })
    });

    render(<MobileNavPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('검색');
    fireEvent.change(searchInput, { target: { value: '강남' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  test('검색 결과 클릭 시 지도가 이동해야 함', async () => {
    setupAuth();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [{
          id: 'loc-1',
          text_ko: '강남역',
          place_name_ko: '서울특별시 강남구 강남역',
          center: [127.0276, 37.4979]
        }]
      })
    });

    render(<MobileNavPanel {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('검색');
    fireEvent.change(searchInput, { target: { value: '강남역' } });

    await waitFor(() => {
      expect(screen.getByText('강남역')).toBeInTheDocument();
    }, { timeout: 500 });

    fireEvent.click(screen.getByText('강남역'));

    expect(mockMap.flyTo).toHaveBeenCalledWith({
      center: [127.0276, 37.4979],
      zoom: 15,
      duration: 2000
    });
  });

  test('퀴 필터(벚나무) 클릭 시 필터가 적용되어야 함', () => {
    setupAuth();
    render(<MobileNavPanel {...defaultProps} />);

    const cherryFilterButton = screen.getByText('벚나무');
    fireEvent.click(cherryFilterButton);

    expect(defaultProps.onFilterApply).toHaveBeenCalledWith({
      species: ['벚나무'],
      sizes: []
    });
  });

  test('로그인 사용자는 내 나무 필터 버튼을 볼 수 있어야 함', () => {
    setupAuth(mockUser, mockFavorites);
    render(<MobileNavPanel {...defaultProps} />);

    const favoriteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('.material-icons')?.textContent === 'favorite'
    );

    // 로그인 시 favorite 아이콘이 있는 버튼이 존재해야 함
    expect(favoriteButtons.length).toBeGreaterThan(0);
  });

  test('비로그인 상태에서는 은행나무, 벚나무, 소나무 필터만 표시되어야 함', () => {
    setupAuth(null);
    render(<MobileNavPanel {...defaultProps} />);

    expect(screen.getByText('은행나무')).toBeInTheDocument();
    expect(screen.getByText('벚나무')).toBeInTheDocument();
    expect(screen.getByText('소나무')).toBeInTheDocument();
  });

  test('isHidden이 true면 패널이 숨겨져야 함', () => {
    setupAuth();
    const { container } = render(<MobileNavPanel {...defaultProps} isHidden={true} />);

    const panel = container.firstChild;
    expect(panel).toHaveStyle({ bottom: '-400px' });
  });

  test('드래그 핸들 클릭 시 패널이 접혀야 함', () => {
    setupAuth();
    const { container } = render(<MobileNavPanel {...defaultProps} />);

    const dragHandle = container.querySelector('div[style*="cursor: grab"]');
    fireEvent.click(dragHandle);

    const panel = container.firstChild;
    expect(panel).toHaveStyle({ maxHeight: '80px' });
  });

  test('필터 버튼 클릭 시 onFilterClick이 호출되어야 함', () => {
    setupAuth();
    render(<MobileNavPanel {...defaultProps} />);

    const filterButton = screen.getByText('더보기');
    fireEvent.click(filterButton);

    expect(defaultProps.onFilterClick).toHaveBeenCalled();
  });

  test('activeFilterCount가 0보다 크면 필터 개수가 표시되어야 함', () => {
    setupAuth();
    render(<MobileNavPanel {...defaultProps} activeFilterCount={3} />);

    expect(screen.getByText('3개 필터 활성화됨')).toBeInTheDocument();
  });
});
