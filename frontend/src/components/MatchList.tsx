// MatchList.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { League, Match } from './types';
import axios from 'axios';
import { useCascadingFilters } from './useCascadingFilters';
import type { FilterState } from './useCascadingFilters';
import AccessModal from './Auth/AccessModal';
import LoginModal from './Auth/LoginModal';
import RenewModal from './Auth/RenewModal';
import { PaymentModal } from './PaymentModal';
import { useAuth } from './../contexts/AuthContext';
import { useMobileDetection } from './../hooks/useMobileDetection';

// стили
import {
  cellStyle, cellStyle_2,  teamCellStyle, fixedWidthColumnStyle, 
  topBlockStyle, searchResultsStyle, tableStyle, filtersContainerStyle, filtersRowStyle,
  filterItemStyle, labelStyle, checkboxLabelStyle, inputStyle, resetButtonStyle,
  stickyHeaderRowStyle, tableContainerStyle, checkboxDropdownStyle,
  checkboxItemStyle, customCheckboxStyle, customCheckboxCheckedStyle,
  selectWithDropdownStyle, checkboxDropdownWideStyle,  searchResultItemStyle,
  // МОБИЛЬНЫЕ СТИЛИ
  mobileTableStyle, mobileCellStyle, mobileTeamCellStyle, mobileButtonStyle,
  mobileCellStyleEnhanced, mobileTeamCellStyleEnhanced, mobileTableContainerStyle,
  // mobileVerticalHeaderStyle,verticalHeaderStyle, leagueHeaderStyle, 
} from './MatchList.styles';

interface Props {
  activeModal: 'none' | 'access' | 'login' | 'renew' | 'payment';
  setActiveModal: (modal: 'none' | 'access' | 'login' | 'renew' | 'payment') => void;
}

export default function MatchList({ activeModal, setActiveModal }: Props) { 
  const isMobile = useMobileDetection();
  const isVerySmallScreen = isMobile && (typeof window !== 'undefined' && window.innerWidth < 400);
  // const isIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);

  const [isIOS, setIsIOS] = useState(false);
  
  // Динамические стили в зависимости от устройства
  const currentButtonStyle = isMobile ? mobileButtonStyle : resetButtonStyle;
  // const currentVerticalHeaderStyle = isMobile ? mobileVerticalHeaderStyle : verticalHeaderStyle;
  // const currentVerticalHeaderStyle = isMobile 
  // ? { 
  //     ...mobileVerticalHeaderStyle,
  //     backgroundColor: '#34495e', // Темный фон для заголовков
  //     color: 'white',
  //     border: '1px solid #444'
  //   }
  // : verticalHeaderStyle;

  const stickyHeaderStyle = isMobile
  ? {
      ...stickyHeaderRowStyle,
      backgroundColor: '#2c3e50', // Темный фон для sticky заголовка  #34495e
      color: 'white'
    }
  : stickyHeaderRowStyle;

  // const containerStyle = isMobile 
  //   ? { ...tableContainerStyle, ...mobileTableContainerStyle }
  //   : tableContainerStyle;

  const containerStyle = isMobile 
    ? { ...tableContainerStyle, 
      ...mobileTableContainerStyle,
      overflowX: 'auto' as const, // Оставляем скролл
      width: '100%', 
    }
    : { 
        ...tableContainerStyle,
        overflowX: 'hidden' as const, 
      };

  const currentTableStyle = isMobile 
    ? { ...tableStyle, ...mobileTableStyle } 
    : tableStyle;

  const tableHeaderStyle = {
      ...fixedWidthColumnStyle,
      backgroundColor: '#2c3e50',
      color: 'white',
      border: '1px solid #444',
      padding: isMobile ? '3px 1px' : '10px 1px', // Было и оставляем
      fontSize: isMobile ? '10px' : '12px', // Возвращаем 12px
      fontWeight: 'bold',
      minWidth: isMobile ? '30px' : '45px', // Добавили минимальную ширину
      whiteSpace: 'nowrap' as const,
  };
  
  const currentCellStyle = isVerySmallScreen 
    ? mobileCellStyleEnhanced 
    : (isMobile ? mobileCellStyle : cellStyle);
  const currentTeamCellStyle = isVerySmallScreen
    ? mobileTeamCellStyleEnhanced
    : (isMobile ? mobileTeamCellStyle : teamCellStyle);

  const { user } = useAuth();

  const hasAccess = user && (
    user.role === 'admin' ||
    (user.role === 'user' && user.expiresAt && new Date(user.expiresAt) > new Date())
  );

  const isExpired = user && !hasAccess;

  /* ----------  состояния  ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [allMatchesCache, setAllMatchesCache] = useState<Match[]>([]); // ПРОСТО ПУСТОЙ МАССИВ
  // const [allMatchesCache, setAllMatchesCache] = useState<Match[]>(() => {
  //   // Для мобильных устройств не используем кэш
  //   if (isMobile || isIOS || typeof window === 'undefined') return [];

  //   // Для гостей на ПК тоже не используем кэш
  //   if (!user || !hasAccess) return [];
    
  //   try {
  //     const cached = localStorage.getItem('matchesCache');
  //     const parsed = cached ? JSON.parse(cached) : [];
  //     return Array.isArray(parsed) ? parsed : [];
  //   } catch { return []; }
  // });
  const [highlight, setHighlight] = useState<null | 'home' | 'draw' | 'away'>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
      setIsIOS(isIOSDevice);
    }
  }, []);

  /* ----------  фильтры  ---------- */
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [showHome, setShowHome] = useState(false);
  const [showAway, setShowAway] = useState(false);
  const [selectedBtsResult, setSelectedBtsResult] = useState<string[]>([]);
  const [selectedTotalGoals, setSelectedTotalGoals] = useState<string[]>([]);

  const [selectedOneOs, setSelectedOneOs] = useState<string[]>([]);
  const [selectedOneEs, setSelectedOneEs] = useState<string[]>([]);
  const [selectedXOs, setSelectedXOs] = useState<string[]>([]);
  const [selectedXEs, setSelectedXEs] = useState<string[]>([]);
  const [selectedTwoOs, setSelectedTwoOs] = useState<string[]>([]);
  const [selectedTwoEs, setSelectedTwoEs] = useState<string[]>([]);
  const [selectedBtsOs, setSelectedBtsOs] = useState<string[]>([]);
  const [selectedBtsEs, setSelectedBtsEs] = useState<string[]>([]);
  const [selectedBtsNoOs, setSelectedBtsNoOs] = useState<string[]>([]);
  const [selectedBtsNoEs, setSelectedBtsNoEs] = useState<string[]>([]);
  const [selectedOverOs, setSelectedOverOs] = useState<string[]>([]);
  const [selectedOverEs, setSelectedOverEs] = useState<string[]>([]);
  const [selectedUnderOs, setSelectedUnderOs] = useState<string[]>([]);
  const [selectedUnderEs, setSelectedUnderEs] = useState<string[]>([]);
  const [selectedFirstHalfs, setSelectedFirstHalfs] = useState<string[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  /* ----------  dropdown-флаги  ---------- */
  const [showLeaguesCheckboxes, setShowLeaguesCheckboxes] = useState(false);
  const [showOneOCheckboxes, setShowOneOCheckboxes] = useState(false);
  const [showOneEsCheckboxes, setShowOneEsCheckboxes] = useState(false);
  const [showXOCheckboxes, setShowXOCheckboxes] = useState(false);
  const [showXEsCheckboxes, setShowXEsCheckboxes] = useState(false);
  const [showTwoOCheckboxes, setShowTwoOCheckboxes] = useState(false);
  const [showTwoEsCheckboxes, setShowTwoEsCheckboxes] = useState(false);
  const [showBtsOCheckboxes, setShowBtsOCheckboxes] = useState(false);
  const [showBtsEsCheckboxes, setShowBtsEsCheckboxes] = useState(false);
  const [showBtsNoOCheckboxes, setShowBtsNoOCheckboxes] = useState(false);
  const [showBtsNoEsCheckboxes, setShowBtsNoEsCheckboxes] = useState(false);
  const [showOverOCheckboxes, setShowOverOCheckboxes] = useState(false);
  const [showOverEsCheckboxes, setShowOverEsCheckboxes] = useState(false);
  const [showUnderOCheckboxes, setShowUnderOCheckboxes] = useState(false);
  const [showUnderEsCheckboxes, setShowUnderEsCheckboxes] = useState(false);
  const [showFirstHalfsCheckboxes, setShowFirstHalfsCheckboxes] = useState(false);
  const [showMatchesCheckboxes, setShowMatchesCheckboxes] = useState(false);
  const [showBtsResultCheckboxes, setShowBtsResultCheckboxes] = useState(false);
  const [showTotalGoalsCheckboxes, setShowTotalGoalsCheckboxes] = useState(false);

  const API_BASE_URL = 'https://oddsvalue.pro';

  const handlePaymentFromRenew = () => {
    setActiveModal('payment');
  };

  // Функция проверки доступа
  const checkAccess = () => {
    if (!hasAccess) {
      if (isExpired) {
        setActiveModal('renew');
      } else {
        setActiveModal('access');
      }
      return false;
    }
    return true;
  };

  const handleFilterClick = (filterKey: string) => {
    if (!checkAccess()) return;

    const mapping: Record<string, React.Dispatch<React.SetStateAction<boolean>>> = {
      leagues: setShowLeaguesCheckboxes,
      one_o: setShowOneOCheckboxes,
      one_e: setShowOneEsCheckboxes,
      x_o: setShowXOCheckboxes,
      x_e: setShowXEsCheckboxes,
      two_o: setShowTwoOCheckboxes,
      two_e: setShowTwoEsCheckboxes,
      bts_o: setShowBtsOCheckboxes,
      bts_e: setShowBtsEsCheckboxes,
      bts_no_o: setShowBtsNoOCheckboxes,
      bts_no_e: setShowBtsNoEsCheckboxes,
      over_o: setShowOverOCheckboxes,
      over_e: setShowOverEsCheckboxes,
      under_o: setShowUnderOCheckboxes,
      under_e: setShowUnderEsCheckboxes,
      first_half: setShowFirstHalfsCheckboxes,
      match: setShowMatchesCheckboxes,
      bts_result: setShowBtsResultCheckboxes,
      total_goals: setShowTotalGoalsCheckboxes,
    };
    mapping[filterKey]?.(prev => !prev);
  };

  /* ----------  хук-фильтры  ---------- */
  const filterState: FilterState = {
    selectedLeagues, selectedTeam, showHome, showAway,
    selectedOneOs, selectedOneEs, selectedXOs, selectedXEs,
    selectedTwoOs, selectedTwoEs, selectedBtsOs, selectedBtsEs,
    selectedBtsNoOs, selectedBtsNoEs, selectedOverOs, selectedOverEs,
    selectedUnderOs, selectedUnderEs, selectedFirstHalfs, selectedMatches,
    selectedBtsResult, selectedTotalGoals,
  };

  const {
    filteredMatches,
    statistics,
    getUniqueOneOs,
    getUniqueOneEs,
    getUniqueXOs,
    getUniqueXEs,
    getUniqueTwoOs,
    getUniqueTwoEs,
    getUniqueBtsOs,
    getUniqueBtsEs,
    getUniqueBtsNoOs,
    getUniqueBtsNoEs,
    getUniqueOverOs,
    getUniqueOverEs,
    getUniqueUnderOs,
    getUniqueUnderEs,
    getUniqueFirstHalfs,
    getUniqueMatches,
    getUniqueLeagues,
    getUniqueTeams,
  } = useCascadingFilters(allMatchesCache, filterState);

  /* ----------  функции  ---------- */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkAccess()) return;
    
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      setSearchResults(getUniqueTeams().filter((t) => t.toLowerCase().includes(term.toLowerCase())));
    } else {
      setSearchResults([]);
    }
  };

  const handleTeamSelect = (teamName: string) => {
    if (!checkAccess()) return;
    
    setSelectedTeam([teamName]);
    setSearchTerm(teamName);
    setSearchResults([]);
  };

  const handleCheckboxChange = (filterType: string, value: string) => {
    if (!checkAccess()) return;

    const setters: { [key: string]: React.Dispatch<React.SetStateAction<string[]>> } = {
      leagues: setSelectedLeagues,
      one_o: setSelectedOneOs,
      one_e: setSelectedOneEs,
      x_o: setSelectedXOs,
      x_e: setSelectedXEs,
      two_o: setSelectedTwoOs,
      two_e: setSelectedTwoEs,
      bts_o: setSelectedBtsOs,
      bts_e: setSelectedBtsEs,
      bts_no_o: setSelectedBtsNoOs,
      bts_no_e: setSelectedBtsNoEs,
      over_o: setSelectedOverOs,
      over_e: setSelectedOverEs,
      under_o: setSelectedUnderOs,
      under_e: setSelectedUnderEs,
      first_half: setSelectedFirstHalfs,
      match: setSelectedMatches,
      bts_result: setSelectedBtsResult,
      total_goals: setSelectedTotalGoals,
    };

    const setter = setters[filterType];
    if (setter) {
      setter(prev =>
        prev.includes(value)
          ? prev.filter(item => item !== value)
          : [...prev, value]
      );
    }
  };

  const handleResetFilters = () => {
    setSelectedLeagues([]);
    setSelectedTeam([]);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedOneOs([]);
    setSelectedOneEs([]);
    setSelectedXOs([]);
    setSelectedXEs([]);
    setSelectedTwoOs([]);
    setSelectedTwoEs([]);
    setSelectedBtsOs([]);
    setSelectedBtsEs([]);
    setSelectedBtsNoOs([]);
    setSelectedBtsNoEs([]);
    setSelectedOverOs([]);
    setSelectedOverEs([]);
    setSelectedUnderOs([]);
    setSelectedUnderEs([]);
    setSelectedFirstHalfs([]);
    setSelectedMatches([]);
    setSelectedBtsResult([]);
    setSelectedTotalGoals([]);
    setShowHome(false);
    setShowAway(false);

    setShowLeaguesCheckboxes(false);
    setShowOneOCheckboxes(false);
    setShowOneEsCheckboxes(false);
    setShowXOCheckboxes(false);
    setShowXEsCheckboxes(false);
    setShowTwoOCheckboxes(false);
    setShowTwoEsCheckboxes(false);
    setShowBtsOCheckboxes(false);
    setShowBtsEsCheckboxes(false);
    setShowBtsNoOCheckboxes(false);
    setShowBtsNoEsCheckboxes(false);
    setShowOverOCheckboxes(false);
    setShowOverEsCheckboxes(false);
    setShowUnderOCheckboxes(false);
    setShowUnderEsCheckboxes(false);
    setShowFirstHalfsCheckboxes(false);
    setShowMatchesCheckboxes(false);
    setShowBtsResultCheckboxes(false);
    setShowTotalGoalsCheckboxes(false);
  };

  const formatRoi = (roi: number | null) => {
    if (roi === null || isNaN(roi)) return '';
    const sign = roi >= 0 ? '+' : '';
    const color = roi >= 0 ? 'green' : 'red';
    return <span style={{ color }}>{`${sign}${roi.toFixed(2)}`}</span>;
  };

  const getFullLeagueName = (league: string): string => {
    if (!league) return '';
    return league.split(' - ')[0].trim();
  };

  /* ----------  dropdown-рендер  ---------- */
  const renderCheckboxFilter = (
    label: string,
    selectedValues: string[],
    availableValues: string[],
    filterType: string, 
    showDropdown: boolean,
    dataAttribute: string
  ) => {
    const getDisplayText = () => {
      if (selectedValues.length === 0) return '\u00A0';
      if (selectedValues.length === 1) {
        if (filterType === 'leagues') {
          const league = getUniqueLeagues().find((l) => l.id === selectedValues[0]);
          return league ? league.name : selectedValues[0];
        }
        return selectedValues[0];
      }
      return `${selectedValues.length} selected`;
    };

    const getTitle = () => {
      if (selectedValues.length <= 1) return '';
      if (filterType === 'leagues') {
        return selectedValues.map((id) => {
          const league = getUniqueLeagues().find((l) => l.id === id);
          return league ? league.name : id;
        }).join(', ');
      }
      return selectedValues.join(', ');
    };

    const getDropdownStyle = () => {
      if (filterType === 'leagues') return checkboxDropdownWideStyle;
      if (filterType === 'total_goals') return { ...checkboxDropdownStyle, minWidth: '100px' };
      return checkboxDropdownStyle;
    };

    return (
      <div style={{ ...filterItemStyle, ...(filterType === 'leagues' && { minWidth:  isMobile ? '80px' : '250px',
        flex: isMobile ? 1 : undefined
       }) }} data-attribute={dataAttribute}>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleFilterClick(filterType)}
            style={selectWithDropdownStyle}
            title={getTitle()}
          >
            {getDisplayText()}
          </button>
          {showDropdown && (
            <div style={getDropdownStyle()}>
              {availableValues.map((value) => {
                const displayValue = filterType === 'leagues'
                  ? getUniqueLeagues().find((l: League) => l.id === value)?.name || value
                  : value;
                return (
                  <div key={value} style={{ ...checkboxItemStyle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(value)}
                      onChange={() => handleCheckboxChange(filterType, value)}
                      style={{ ...customCheckboxStyle, ...(selectedValues.includes(value) ? customCheckboxCheckedStyle : {}) }}
                    />
                    <span title={displayValue}>{displayValue}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ----------  useEffect-закрытие дропдаунов  ---------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const filtersToCheck = [
        'one-o-filter', 'one-e-filter', 'x-o-filter', 'x-e-filter',
        'two-o-filter', 'two-e-filter', 'bts-o-filter', 'bts-e-filter',
        'bts-no-o-filter', 'bts-no-e-filter', 'over-o-filter', 'over-e-filter',
        'under-o-filter', 'under-e-filter', 'first-half-filter', 'matches-filter',
        'bts-result-filter', 'total-goals-filter', 'leagues-filter'
      ];
      filtersToCheck.forEach((filterAttr) => {
        const filterElement = document.querySelector(`[data-attribute="${filterAttr}"]`);
        if (filterElement && !filterElement.contains(event.target as Node)) {
          switch (filterAttr) {
            case 'one-o-filter': setShowOneOCheckboxes(false); break;
            case 'one-e-filter': setShowOneEsCheckboxes(false); break;
            case 'x-o-filter': setShowXOCheckboxes(false); break;
            case 'x-e-filter': setShowXEsCheckboxes(false); break;
            case 'two-o-filter': setShowTwoOCheckboxes(false); break;
            case 'two-e-filter': setShowTwoEsCheckboxes(false); break;
            case 'bts-o-filter': setShowBtsOCheckboxes(false); break;
            case 'bts-e-filter': setShowBtsEsCheckboxes(false); break;
            case 'bts-no-o-filter': setShowBtsNoOCheckboxes(false); break;
            case 'bts-no-e-filter': setShowBtsNoEsCheckboxes(false); break;
            case 'over-o-filter': setShowOverOCheckboxes(false); break;
            case 'over-e-filter': setShowOverEsCheckboxes(false); break;
            case 'under-o-filter': setShowUnderOCheckboxes(false); break;
            case 'under-e-filter': setShowUnderEsCheckboxes(false); break;
            case 'first-half-filter': setShowFirstHalfsCheckboxes(false); break;
            case 'matches-filter': setShowMatchesCheckboxes(false); break;
            case 'bts-result-filter': setShowBtsResultCheckboxes(false); break;
            case 'total-goals-filter': setShowTotalGoalsCheckboxes(false); break;
            case 'leagues-filter': setShowLeaguesCheckboxes(false); break;
          }
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    showOneOCheckboxes, showOneEsCheckboxes, showXOCheckboxes, showXEsCheckboxes,
    showTwoOCheckboxes, showTwoEsCheckboxes, showBtsOCheckboxes, showBtsEsCheckboxes,
    showBtsNoOCheckboxes, showBtsNoEsCheckboxes, showOverOCheckboxes, showOverEsCheckboxes,
    showUnderOCheckboxes, showUnderEsCheckboxes, showFirstHalfsCheckboxes, showMatchesCheckboxes,
    showBtsResultCheckboxes, showTotalGoalsCheckboxes
  ]);

  // Функция загрузки матчей
  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      // ВСЕГДА добавляем лимит для теста
      params.append('limit', '20');
      console.log('🔄 SENDING limit=20 to API');
      // Добавляем лимит если указан
      // if (limit !== undefined) {
      //   params.append('limit', limit.toString());
      // }
      
      // Фильтры по команде
      if (selectedTeam.length) {
        params.append('team', selectedTeam[0]);
        const loc = [];
        if (showHome) loc.push('home');
        if (showAway) loc.push('away');
        if (loc.length) params.append('location', loc.join(','));
      }

      console.log('Fetching matches with params:', params.toString()); // Для отладки
      console.log('🌐 Full URL:', `${API_BASE_URL}/api/matches/?${params}`);

      // const { data } = await axios.get<Match[]>(
      //   `${API_BASE_URL}/api/matches/?${params}`,
      //   { timeout: 15000 }
      // );

      const { data } = await axios.get<{ results: Match[] }>(
        `${API_BASE_URL}/api/matches/?${params}`,
        { timeout: 15000 }
      );
      
      console.log('Received matches:', data?.results?.length); // Для отладки
      return data.results;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Определяем лимит загрузки
  const getLoadLimit = () => {
    // ДЛЯ ТЕСТА: ВСЕГДА 20 матчей
    return 20;
    // Для мобильных всегда 20 матчей
    // if (isMobile || isIOS) return 20;
    
    // // Для гостей (незалогиненных) всегда 20 матчей
    // if (!user || !hasAccess) return 20;
    
    // // Для залогиненных на ПК - без лимита
    // return undefined;
  };

  // Загрузка данных при монтировании
useEffect(() => {
  const loadMatches = async () => {
    // Всегда очищаем кэш для мобильных и iOS
    if (isMobile || isIOS) {
      try {
        localStorage.removeItem('matchesCache');
        localStorage.removeItem('cacheTimestamp');
      } catch (e) {}
    }
    
    // Получаем лимит
    const limit = getLoadLimit();
    
    // Загружаем данные
    const data = await fetchMatches();
    
    if (data && Array.isArray(data)) {
      setAllMatchesCache(data);
      
      // Кэшируем только если ПК, залогинен и БЕЗ лимита
      if (!limit && user && hasAccess && !isMobile && !isIOS) {
        try {
          localStorage.setItem('matchesCache', JSON.stringify(data));
          localStorage.setItem('cacheTimestamp', Date.now().toString());
        } catch (error) {
          console.warn('Storage caching error:', error);
        }
      }
    }
  };
  
  // Загружаем только если нет данных
  if (allMatchesCache.length === 0) {
    loadMatches();
  }
}, [user, hasAccess, isMobile, isIOS]); // Убрать allMatchesCache.length из зависимостей

  // Автоматическая загрузка полной базы после регистрации
  useEffect(() => {
    const loadFullDatabaseAfterLogin = async () => {
      // Если пользователь только что залогинился, это ПК и сейчас отображается только 20 матчей
      if (user && hasAccess && !isMobile && allMatchesCache.length <= 20) {
        const fullData = await fetchMatches(); // Без лимита
        
        if (fullData.length > 0) {
          setAllMatchesCache(fullData);
          
          // Сохраняем в кэш
          try {
            localStorage.setItem('matchesCache', JSON.stringify(fullData));
            localStorage.setItem('cacheTimestamp', Date.now().toString());
          } catch (error) {
            console.error('Failed to cache full database:', error);
          }
          
          // Можно показать уведомление
          console.log(`Full database loaded: ${fullData.length} matches`);
        }
      }
    };
    
    loadFullDatabaseAfterLogin();
  }, [user, hasAccess, isMobile, allMatchesCache.length]);

  /* ----------  рендер  ---------- */
  const topBlockRef = useRef<HTMLDivElement>(null);

  const formatOdds = (value: number | null | undefined): string => {
    return (value || 0).toFixed(2);
  };

  return (
    <div style={{ padding: isMobile ? '3px' : '10px' }}>
      <div ref={topBlockRef} style={topBlockStyle} className="sticky-element">
        {statistics && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? 'repeat(4, 1fr)'
              : 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: isMobile ? '3px' : '10px',
            // marginBottom: isMobile ? '5px' : '5px',
            backgroundColor: '#333',
            borderRadius: '8px',
            padding: isMobile ? '3px' : '10px',
          }}>
            
            {/* 1. Total Matches */}
            <div style={{
              backgroundColor: '#444',
              padding: isMobile ? '3px' : '10px',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontSize: isMobile ? '9px' : 'inherit',
              minHeight: isMobile ? '40px' : '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{fontSize: isMobile ? '11px' : '1.5em', fontWeight: 'bold'}}>
                {statistics.total_matches}
              </div>
              <div style={{fontSize: isMobile ? '8px' : '0.8em', color: '#bbb'}}>
                Total Matches
              </div>
              <div style={{fontSize: isMobile ? '7px' : '0.7em', fontWeight: 'bold'}}></div>
            </div>
            
            {/* 2. Home Wins */}
            <div style={{
              backgroundColor: '#444',
              padding: isMobile ? '3px' : '10px',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontSize: isMobile ? '9px' : 'inherit',
              minHeight: isMobile ? '40px' : '80px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: highlight === 'home' ? '2px solid #fff' : 'none',
              boxSizing: 'border-box'
            }}
            onClick={() => setHighlight((prev) => (prev === 'home' ? null : 'home'))}>
              <div style={{fontSize: isMobile ? '11px' : '1.5em', fontWeight: 'bold'}}>
                {statistics.home_wins_count}
              </div>
              <div style={{fontSize: isMobile ? '8px' : '0.8em', color: '#bbb'}}>
                Home Wins
              </div>
              <div style={{fontSize: isMobile ? '7px' : '0.7em', fontWeight: 'bold'}}>
                {formatRoi(statistics.roi_home)}
              </div>
            </div>
            
            {/* 3. Draws */}
            <div style={{
              backgroundColor: '#444',
              padding: isMobile ? '3px' : '10px',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontSize: isMobile ? '9px' : 'inherit',
              minHeight: isMobile ? '40px' : '80px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: highlight === 'draw' ? '2px solid #fff' : 'none',
              boxSizing: 'border-box'
            }}
            onClick={() => setHighlight((prev) => (prev === 'draw' ? null : 'draw'))}>
              <div style={{fontSize: isMobile ? '11px' : '1.5em', fontWeight: 'bold'}}>
                {statistics.draws_count}
              </div>
              <div style={{fontSize: isMobile ? '8px' : '0.8em', color: '#bbb'}}>
                Draws
              </div>
              <div style={{fontSize: isMobile ? '7px' : '0.7em', fontWeight: 'bold'}}>
                {formatRoi(statistics.roi_draw)}
              </div>
            </div>
            
            {/* 4. Away Wins */}
            <div style={{
              backgroundColor: '#444',
              padding: isMobile ? '3px' : '10px',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontSize: isMobile ? '9px' : 'inherit',
              minHeight: isMobile ? '40px' : '80px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: highlight === 'away' ? '2px solid #fff' : 'none',
              boxSizing: 'border-box'
            }}
            onClick={() => setHighlight((prev) => (prev === 'away' ? null : 'away'))}>
              <div style={{fontSize: isMobile ? '11px' : '1.5em', fontWeight: 'bold'}}>
                {statistics.away_wins_count}
              </div>
              <div style={{fontSize: isMobile ? '8px' : '0.8em', color: '#bbb'}}>
                Away Wins
              </div>
              <div style={{fontSize: isMobile ? '7px' : '0.7em', fontWeight: 'bold'}}>
                {formatRoi(statistics.roi_away)}
              </div>
            </div>
            
            {/* 5. BTS Yes */}
            <div style={{
              backgroundColor: '#444',
              padding: isMobile ? '3px' : '10px',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontSize: isMobile ? '9px' : 'inherit',
              minHeight: isMobile ? '40px' : '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{fontSize: isMobile ? '11px' : '1.5em', fontWeight: 'bold'}}>
                {statistics.bts_yes_count}
              </div>
              <div style={{fontSize: isMobile ? '8px' : '0.8em', color: '#bbb'}}>
                BTS Yes
              </div>
              <div style={{fontSize: isMobile ? '7px' : '0.7em', fontWeight: 'bold'}}>
                {formatRoi(statistics.roi_bts_yes)}
              </div>
            </div>
            
            {/* 6. BTS No */}
            <div style={{
              backgroundColor: '#444',
              padding: isMobile ? '3px' : '10px',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontSize: isMobile ? '9px' : 'inherit',
              minHeight: isMobile ? '40px' : '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{fontSize: isMobile ? '11px' : '1.5em', fontWeight: 'bold'}}>
                {statistics.bts_no_count}
              </div>
              <div style={{fontSize: isMobile ? '8px' : '0.8em', color: '#bbb'}}>
                BTS No
              </div>
              <div style={{fontSize: isMobile ? '7px' : '0.7em', fontWeight: 'bold'}}>
                {formatRoi(statistics.roi_bts_no)}
              </div>
            </div>
            
            {/* 7. Over */}
            <div style={{
              backgroundColor: '#444',
              padding: isMobile ? '3px' : '10px',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontSize: isMobile ? '9px' : 'inherit',
              minHeight: isMobile ? '40px' : '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{fontSize: isMobile ? '11px' : '1.5em', fontWeight: 'bold'}}>
                {statistics.over_count}
              </div>
              <div style={{fontSize: isMobile ? '8px' : '0.8em', color: '#bbb'}}>
                Over
              </div>
              <div style={{fontSize: isMobile ? '7px' : '0.7em', fontWeight: 'bold'}}>
                {formatRoi(statistics.roi_over)}
              </div>
            </div>
            
            {/* 8. Under */}
            <div style={{
              backgroundColor: '#444',
              padding: isMobile ? '3px' : '10px',
              borderRadius: '8px',
              textAlign: 'center',
              color: 'white',
              fontSize: isMobile ? '9px' : 'inherit',
              minHeight: isMobile ? '40px' : '80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{fontSize: isMobile ? '11px' : '1.5em', fontWeight: 'bold'}}>
                {statistics.under_count}
              </div>
              <div style={{fontSize: isMobile ? '8px' : '0.8em', color: '#bbb'}}>
                Under
              </div>
              <div style={{fontSize: isMobile ? '7px' : '0.7em', fontWeight: 'bold'}}>
                {formatRoi(statistics.roi_under)}
              </div>
            </div>
            
          </div>
        )}
        
       <div style={isMobile ? {
            ...filtersContainerStyle,
            maxHeight: '180px', // ← Ограничиваем высоту
            overflowY: 'auto', // ← Вертикальный скролл
            margin: '0 3px',
            padding: isVerySmallScreen ? '5px' : '12px'
          } : filtersContainerStyle}>
          
          {isMobile ? (
            /* МОБИЛЬНАЯ ВЕРСИЯ - 3 РЯДА */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              width: '100%',
            }}>
              
              {/* РЯД 1: League, Home, Away */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                {/* League (шире) */}
                <div style={{ flex: 1.3, minWidth: '80px' }}>
                  {renderCheckboxFilter(
                    'League',
                    selectedLeagues,
                    getUniqueLeagues().map((l) => l.id),
                    'leagues',
                    showLeaguesCheckboxes,
                    'leagues-filter'
                  )}
                </div>
                
                {/* Home/Away (компактнее) */}
                <div style={{ flex: 1, minWidth: '100px', marginTop: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    justifyContent: 'space-around'
                  }}>
                    <label style={{...checkboxLabelStyle, fontSize: '0.75em', display: 'flex', alignItems: 'center'}}>
                      <input 
                        type="checkbox" 
                        checked={showHome} 
                        onChange={() => {
                          if (!checkAccess()) return;
                          setShowHome((v) => !v);
                        }} 
                        style={{ marginRight: '5px' }}
                      />
                      Home
                    </label>
                    <label style={{...checkboxLabelStyle, fontSize: '0.75em', display: 'flex', alignItems: 'center'}}>
                      <input 
                        type="checkbox" 
                        checked={showAway} 
                        onChange={() => {
                          if (!checkAccess()) return;
                          setShowAway((v) => !v);
                        }} 
                        style={{ marginRight: '5px' }}
                      />
                      Away
                    </label>
                  </div>
                </div>
              </div>
              
              {/* РЯД 2: Team, 1_o, 2_o */}
              <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                {/* Team */}
                <div style={{ flex: 1.5, minWidth: '80px', marginRight: '12px' }}>
                  <label htmlFor="teamSearchFilter" style={labelStyle}>Team</label>
                  <input
                    id="teamSearchFilter"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    style={{...inputStyle, height: '26px', fontSize: '0.85em'}}
                    autoComplete="off"
                  />
                   {searchResults.length > 0 && searchTerm.length > 1 && (
                    <ul style={{...searchResultsStyle, fontSize: '12px'}}>
                      {searchResults.map((team) => (
                        <li 
                          key={team} 
                          onClick={() => handleTeamSelect(team)} 
                          style={{...searchResultItemStyle, padding: '6px 8px'}}
                        >
                          {team}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {/* 1_o */}
                <div style={{ flex: 1, minWidth: '40px', marginRight: '5px' }}>
                  {renderCheckboxFilter('1_o', selectedOneOs, getUniqueOneOs(), 'one_o', showOneOCheckboxes, 'one-o-filter')}
                </div>
                
                {/* 2_o */}
                <div style={{ flex: 1, minWidth: '40px' }}>
                  {renderCheckboxFilter('2_o', selectedTwoOs, getUniqueTwoOs(), 'two_o', showTwoOCheckboxes, 'two-o-filter')}
                </div>
              </div>
              
              {/* РЯД 3: BTS, Total, Reset */}
              <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'flex-end'}}>
                {/* BTS */}
                <div style={{ flex: 1, minWidth: '80px' }}>
                  {renderCheckboxFilter('BTS', selectedBtsResult, ['Yes', 'No'], 'bts_result', showBtsResultCheckboxes, 'bts-result-filter')}
                </div>
                
                {/* Total */}
                <div style={{ flex: 1, minWidth: '80px' }}>
                  {renderCheckboxFilter('Total', selectedTotalGoals, ['Over 1.5', 'Under 1.5', 'Over 2.5', 'Under 2.5', 'Over 3.5', 'Under 3.5'], 'total_goals', showTotalGoalsCheckboxes, 'total-goals-filter')}
                </div>
                
                {/* Reset */}
                <div style={{ flex: 0, minWidth: '60px' }}>
                  <button onClick={handleResetFilters} 
                          style={{
                            ...currentButtonStyle,
                            fontSize: '0.7em',
                            height: '26px',
                            padding: '0 6px',
                            minWidth: '60px',
                            width: '100%'
                          }}
                          className="reset-button">
                    Reset
                  </button>
                </div>
              </div>
              
            </div>
          ) : (
            /* ДЕСКТОПНАЯ ВЕРСИЯ (оставляем как было) */
            <div style={filtersRowStyle} className="filters-row">
              {/* League */}
              {renderCheckboxFilter(
                'League',
                selectedLeagues,
                getUniqueLeagues().map((l) => l.id),
                'leagues',
                showLeaguesCheckboxes,
                'leagues-filter'
              )}

              {/* Team */}
              <div style={{ ...filterItemStyle, minWidth: '110px', position: 'relative' }}>
                <label htmlFor="teamSearchFilter" style={labelStyle}>Team</label>
                <input
                  id="teamSearchFilter"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  style={inputStyle}
                  autoComplete="off"
                />
                {/* ДОБАВИЛИ ЭТОТ БЛОК: */}
                {searchResults.length > 0 && searchTerm.length > 1 && (
                  <ul style={searchResultsStyle}>
                    {searchResults.map((team) => (
                      <li 
                        key={team} 
                        onClick={() => handleTeamSelect(team)} 
                        style={searchResultItemStyle}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLLIElement).style.backgroundColor = '#555';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLLIElement).style.backgroundColor = '#333';
                        }}
                      >
                        {team}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Home / Away */}
              <div style={filterItemStyle}>
                <div style={{ 
                  display: 'flex', 
                  gap: '5px', 
                  marginTop: '16px',
                }}>
                  <label style={{...checkboxLabelStyle, fontSize: '0.75em'}}>
                    <input 
                      type="checkbox" 
                      checked={showHome} 
                      onChange={() => setShowHome((v) => !v)} 
                      style={{ marginRight: '3px' }}
                    />
                    Home
                  </label>
                  <label style={{...checkboxLabelStyle, fontSize: '0.75em'}}>
                    <input 
                      type="checkbox" 
                      checked={showAway} 
                      onChange={() => setShowAway((v) => !v)} 
                      style={{ marginRight: '3px' }}
                    />
                    Away
                  </label>
                </div>
              </div>

              {/* Все остальные фильтры для десктопа */}
              {renderCheckboxFilter('1_o', selectedOneOs, getUniqueOneOs(), 'one_o', showOneOCheckboxes, 'one-o-filter')}
              {renderCheckboxFilter('1_e', selectedOneEs, getUniqueOneEs(), 'one_e', showOneEsCheckboxes, 'one-e-filter')}
              {renderCheckboxFilter('X_o', selectedXOs, getUniqueXOs(), 'x_o', showXOCheckboxes, 'x-o-filter')}
              {renderCheckboxFilter('X_e', selectedXEs, getUniqueXEs(), 'x_e', showXEsCheckboxes, 'x-e-filter')}
              {renderCheckboxFilter('2_o', selectedTwoOs, getUniqueTwoOs(), 'two_o', showTwoOCheckboxes, 'two-o-filter')}
              {renderCheckboxFilter('2_e', selectedTwoEs, getUniqueTwoEs(), 'two_e', showTwoEsCheckboxes, 'two-e-filter')}
              {renderCheckboxFilter('B_o', selectedBtsOs, getUniqueBtsOs(), 'bts_o', showBtsOCheckboxes, 'bts-o-filter')}
              {renderCheckboxFilter('B_e', selectedBtsEs, getUniqueBtsEs(), 'bts_e', showBtsEsCheckboxes, 'bts-e-filter')}
              {renderCheckboxFilter('Bno_o', selectedBtsNoOs, getUniqueBtsNoOs(), 'bts_no_o', showBtsNoOCheckboxes, 'bts-no-o-filter')}
              {renderCheckboxFilter('Bno_e', selectedBtsNoEs, getUniqueBtsNoEs(), 'bts_no_e', showBtsNoEsCheckboxes, 'bts-no-e-filter')}
              {renderCheckboxFilter('Ov_o', selectedOverOs, getUniqueOverOs(), 'over_o', showOverOCheckboxes, 'over-o-filter')}
              {renderCheckboxFilter('Ov_e', selectedOverEs, getUniqueOverEs(), 'over_e', showOverEsCheckboxes,'over-e-filter')}
              {renderCheckboxFilter('Un_o', selectedUnderOs, getUniqueUnderOs(), 'under_o', showUnderOCheckboxes,'under-o-filter')}
              {renderCheckboxFilter('Un_e', selectedUnderEs, getUniqueUnderEs(), 'under_e', showUnderEsCheckboxes, 'under-e-filter')}
              {renderCheckboxFilter('1H', selectedFirstHalfs, getUniqueFirstHalfs(), 'first_half', showFirstHalfsCheckboxes, 'first-half-filter')}
              {renderCheckboxFilter('FT', selectedMatches, getUniqueMatches(), 'match', showMatchesCheckboxes, 'matches-filter')}
              {renderCheckboxFilter('BTS', selectedBtsResult, ['Yes', 'No'], 'bts_result', showBtsResultCheckboxes, 'bts-result-filter')}
              {renderCheckboxFilter('Total', selectedTotalGoals, ['Over 1.5', 'Under 1.5', 'Over 2.5', 'Under 2.5', 'Over 3.5', 'Under 3.5'], 'total_goals', showTotalGoalsCheckboxes, 'total-goals-filter')}

              {/* Reset */}
              <div style={{ ...filterItemStyle, marginTop: '16px' }}>
                <button onClick={handleResetFilters} 
                        style={{
                          ...currentButtonStyle,
                          fontSize: '0.8em',
                          height: '26px',
                          padding: '4px 14px'
                        }}
                        className="reset-button">
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Таблица */}
      <div style={containerStyle}
           className={isMobile ? "table-responsive safari-table-fix scroll-container" : "safari-table-fix scroll-container"}>
        <table style={currentTableStyle}>
          <thead>
            <tr style={stickyHeaderStyle}>
              <th style={{ ...tableHeaderStyle, minWidth: isMobile ? '80px' : '120px' }}>Date</th>
              <th style={tableHeaderStyle}>Home</th>
              <th style={tableHeaderStyle}>Away</th>
              <th style={tableHeaderStyle}>1_o</th>
              <th style={tableHeaderStyle}>1_e</th>
              <th style={tableHeaderStyle}>X_o</th>
              <th style={tableHeaderStyle}>X_e</th>
              <th style={tableHeaderStyle}>2_o</th>
              <th style={tableHeaderStyle}>2_e</th>
              <th style={tableHeaderStyle}>B_o</th>
              <th style={tableHeaderStyle}>B_e</th>
              <th style={tableHeaderStyle}>Bno_o</th>
              <th style={tableHeaderStyle}>Bno_e</th>
              <th style={tableHeaderStyle}>Ov_o</th>
              <th style={tableHeaderStyle}>Ov_e</th>
              <th style={tableHeaderStyle}>Un_o</th>
              <th style={tableHeaderStyle}>Un_e</th>
              <th style={tableHeaderStyle}>1H</th>
              <th style={tableHeaderStyle}>FT</th>
              {!isMobile && <th style={tableHeaderStyle}>League</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((match) => {
              const matchDate = new Date(match.date);
              matchDate.setHours(matchDate.getHours() - 3);
              const day = matchDate.getDate().toString().padStart(2, '0');
              const month = (matchDate.getMonth() + 1).toString().padStart(2, '0');
              const year = matchDate.getFullYear();
              const hours = matchDate.getHours().toString().padStart(2, '0');
              const minutes = matchDate.getMinutes().toString().padStart(2, '0');
              const formattedDateTime = isVerySmallScreen 
                ? `${day}.${month}.${year}`
                : `${day}.${month}.${year}  ${hours}:${minutes}`;

              const isHighlighted =
                (highlight === 'home' && match.outcome === 'home') ||
                (highlight === 'draw' && match.outcome === 'draw') ||
                (highlight === 'away' && match.outcome === 'away');

              return (
                <tr key={match.id} style={isHighlighted ? { backgroundColor: '#63553f' } : undefined}>
                    <td style={currentCellStyle}>{formattedDateTime}</td>
                    <td style={currentTeamCellStyle} title={match.home}>{match.home}</td>
                    <td style={currentTeamCellStyle} title={match.away}>{match.away}</td>
                    
                    {/* Основные исходы */}
                    <td style={currentCellStyle}>{formatOdds(match.one_o)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.one_e)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.x_o)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.x_e)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.two_o)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.two_e)}</td>
                    
                    {/* БТС */}
                    <td style={currentCellStyle}>{formatOdds(match.bts_o)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.bts_e)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.bts_no_o)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.bts_no_e)}</td>
                    
                    {/* Тоталы */}
                    <td style={currentCellStyle}>{formatOdds(match.over_o)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.over_e)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.under_o)}</td>
                    <td style={currentCellStyle}>{formatOdds(match.under_e)}</td>
                    
                    {/* Нечисловые поля */}
                    <td style={currentCellStyle}>{match.first_half || '-'}</td>
                    <td style={currentCellStyle}>{match.match || '-'}</td>
                    {!isMobile && (
                      <td style={cellStyle_2} title={match.league}>{getFullLeagueName(match.league)}</td>
                    )}
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Информационный блок */}
        <div style={{
          padding: '10px',
          textAlign: 'center',
          marginTop: '5px',
          fontWeight: 'bold',
        }}>
          {isLoading ? (
            <div style={{ 
              color: 'white', 
              padding: '10px', 
              textAlign: 'center' 
            }}>
              Loading data...
            </div>
          ) : (
            <div style={{ color: 'white' }}>
              {allMatchesCache.length === 0 &&'No data to display'}
            </div>
          )}
          
          {/* Сообщение для мобильных */}
          {isMobile && allMatchesCache.length > 0 && (
            <div style={{
              fontSize: '12px',
              color: 'white',
              marginTop: '5px',
              padding: '5px',
              backgroundColor: '#2c3e50',
              borderRadius: '3px'
            }}>
              ⚠️ On mobile devices, only the first 20 matches are displayed. The database contains over 13,000 matches.
               To work with the entire database, use the PC version.
            </div>
          )}
          
          {/* Сообщение для гостей на ПК */}
          {!isMobile && (!user || !hasAccess) && allMatchesCache.length > 0 && (
            <div style={{
              fontSize: '13px',
              color: 'white',
              // marginTop: '5px',
              padding: '5px',
              backgroundColor: '#2c3e50',
              borderRadius: '3px'
            }}>
              ⚠️ For guests, only the first 20 matches are shown.  
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModal('access');
                }}
                style={{ color: '#3498db', textDecoration: 'underline', marginLeft: '5px' }}
              >
                Register
              </a> to access the entire database (13,000+ matches)
            </div>
          )}
        </div>
        {/* {isMobile && (
          <style>{`
            table td {
              color: white !important;
            }
          `}</style>
        )} */}
      </div>
      <AccessModal
        isOpen={activeModal === 'access'}
        onClose={() => setActiveModal('none')}
        onSwitchToLogin={() => setActiveModal('login')}
      />

      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={() => setActiveModal('none')}
        onTrialExpired={() => setActiveModal('renew')}
      />

      <RenewModal
        isOpen={activeModal === 'renew'}
        onClose={() => setActiveModal('none')}
        onSwitchToPayment={handlePaymentFromRenew}
      />

      <PaymentModal
        isOpen={activeModal === 'payment'}
        onClose={() => setActiveModal('none')}
      />
    </div>
  );
}