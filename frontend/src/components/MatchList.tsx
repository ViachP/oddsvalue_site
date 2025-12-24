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
import MobileDropdown from './MobileDropdown'; 

// стили
import {
  cellStyle, cellStyle_2,  teamCellStyle, fixedWidthColumnStyle, 
  topBlockStyle, searchResultsStyle, tableStyle, filtersContainerStyle, filtersRowStyle,
  filterItemStyle, labelStyle, checkboxLabelStyle, inputStyle, resetButtonStyle,
  stickyHeaderRowStyle, tableContainerStyle, checkboxDropdownStyle,
  checkboxItemStyle, customCheckboxStyle, customCheckboxCheckedStyle,
  selectWithDropdownStyle, searchResultItemStyle,
  // МОБИЛЬНЫЕ СТИЛИ
  mobileTableStyle, mobileCellStyle, mobileTeamCellStyle, mobileButtonStyle,
  mobileCellStyleEnhanced, mobileTeamCellStyleEnhanced, mobileTableContainerStyle,
} from './MatchList.styles';

interface Props {
  activeModal: 'none' | 'access' | 'login' | 'renew' | 'payment';
  setActiveModal: (modal: 'none' | 'access' | 'login' | 'renew' | 'payment') => void;
}

interface DropdownItem {
  value: string;
  label: string;
}

export default function MatchList({ activeModal, setActiveModal }: Props) { 
  const isMobile = useMobileDetection();
  const isVerySmallScreen = isMobile && (typeof window !== 'undefined' && window.innerWidth < 400);
  // const [isIOS, setIsIOS] = useState(false);
  
  const currentButtonStyle = isMobile ? mobileButtonStyle : resetButtonStyle;

  const stickyHeaderStyle = isMobile
  ? {
      ...stickyHeaderRowStyle,
      backgroundColor: '#2c3e50',
      color: 'white'
    }
  : stickyHeaderRowStyle;

  const containerStyle = isMobile 
    ? { 
        ...tableContainerStyle, 
        ...mobileTableContainerStyle,
        overflowX: 'auto' as const,
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
      padding: isMobile ? '3px 1px' : '10px 1px',
      fontSize: isMobile ? '10px' : '12px',
      fontWeight: 'bold',
      minWidth: isMobile ? '30px' : '45px',
      whiteSpace: 'nowrap' as const,
  };
  
  const currentCellStyle = isVerySmallScreen 
    ? mobileCellStyleEnhanced 
    : (isMobile ? mobileCellStyle : cellStyle);
  const currentTeamCellStyle = isVerySmallScreen
    ? mobileTeamCellStyleEnhanced
    : (isMobile ? mobileTeamCellStyle : teamCellStyle);

  const { user } = useAuth();

  const hasAccess = Boolean(user && (
    user.role === 'admin' ||
    (user.role === 'user' && user.expiresAt && new Date(user.expiresAt) > new Date())
  ));

  /* ----------  состояния  ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [allMatchesCache, setAllMatchesCache] = useState<Match[]>([]);
  const [highlight, setHighlight] = useState<null | 'home' | 'draw' | 'away'>(null);
  // const [isLoading, setIsLoading] = useState(false);

  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false); // Начинаем с false

   // Отслеживаем, был ли пользователь изменен (регистрация)
  const prevUserEmail = useRef<string | undefined>(undefined);
  const prevHasAccessRef = useRef<boolean>(false); // Добавляем ref для предыдущего доступа

  type MobileDropdownType = 'leagues' | 'one_o' | 'x_o'| 'two_o' | 'bts_result' | 'total_goals';

  const [mobileDropdown, setMobileDropdown] = useState<{
    isOpen: boolean;
    type: MobileDropdownType;
    position: { top: number; left: number; width: number } | null;
  }>({
    isOpen: false,
    type: 'leagues',
    position: null
  });

  const mobileDropdownRef = useRef({
    isOpen: false,
    type: 'leagues' as MobileDropdownType,
    position: null as { top: number; left: number; width: number } | null
  });

  useEffect(() => {
    mobileDropdownRef.current = mobileDropdown;
  }, [mobileDropdown]);

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
  //     setIsIOS(isIOSDevice);
  //   }
  // }, []);

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

  const getMobileDropdownItems = (): DropdownItem[] => {
    const { type } = mobileDropdown;
    
    switch (type) {
      case 'leagues':
        return getUniqueLeagues().map(l => ({ 
          value: l.id, 
          label: l.name 
        }));
      case 'one_o':
        return getUniqueOneOs().map(value => ({ 
          value, 
          label: value 
        }));
      case 'two_o':
        return getUniqueTwoOs().map(value => ({ 
          value, 
          label: value 
        }));
      case 'bts_result':
        return ['Yes', 'No'].map(value => ({ 
          value, 
          label: value 
        }));
      case 'total_goals':
        return ['Over 1.5', 'Under 1.5', 'Over 2.5', 'Under 2.5', 'Over 3.5', 'Under 3.5']
          .map(value => ({ 
            value, 
            label: value 
          }));
      case 'x_o':
        return getUniqueTwoOs().map(value => ({ 
          value, 
          label: value 
        }));
      default:
        return [];
    }
  };

  const getMobileSelectedValues = (): string[] => {
    const { type } = mobileDropdown;
    
    switch (type) {
      case 'leagues': return selectedLeagues;
      case 'one_o': return selectedOneOs;
      case 'x_o': return selectedXOs; 
      case 'two_o': return selectedTwoOs;
      case 'bts_result': return selectedBtsResult;
      case 'total_goals': return selectedTotalGoals;
      default: return [];
    }
  };

  const handleMobileSelect = (value: string) => {
    const { type } = mobileDropdown;
    
    switch (type) {
      case 'leagues':
        handleCheckboxChange('leagues', value);
        break;
      case 'one_o':
        handleCheckboxChange('one_o', value);
        break;
      case 'x_o':
         handleCheckboxChange('x_o', value);
        break;
      case 'two_o':
        handleCheckboxChange('two_o', value);
        break;
      case 'bts_result':
        handleCheckboxChange('bts_result', value);
        break;
      case 'total_goals':
        handleCheckboxChange('total_goals', value);
        break;
    }
  };

  const openMobileDropdown = (
    type: MobileDropdownType,
    buttonElement: HTMLElement
  ) => {
    const rect = buttonElement.getBoundingClientRect();
    
    const newState = {
      isOpen: true,
      type,
      position: {
        top: rect.bottom + 5,
        left: rect.left,
        width: rect.width
      }
    };
    
    // Сначала обновляем ref
    mobileDropdownRef.current = newState;
    // Потом state
    setMobileDropdown(newState);
  };

  const closeMobileDropdown = () => {
    // Обновляем state
    setMobileDropdown(prev => ({ ...prev, isOpen: false }));
  };

  const handleFilterClick = (filterKey: string, event?: React.MouseEvent) => {
    console.log('=== CLICK START ===');
    console.log('Filter clicked:', filterKey);
    console.log('Current dropdown state:', mobileDropdown);
    console.log('MobileDropdownRef:', mobileDropdownRef.current);

    if (isMobile && event) {
      const mobileMapping: Record<string, MobileDropdownType> = {
        leagues: 'leagues',
        one_o: 'one_o',
        x_o: 'x_o', 
        two_o: 'two_o',
        bts_result: 'bts_result',
        total_goals: 'total_goals',
      };
      
      const mobileType = mobileMapping[filterKey];
      console.log('Mapped mobile type:', mobileType);

      if (mobileType) {
        event.stopPropagation();
        event.preventDefault();

        console.log('Should close?', {
          isOpen: mobileDropdown.isOpen,
          refIsOpen: mobileDropdownRef.current.isOpen,
          currentType: mobileDropdown.type,
          refType: mobileDropdownRef.current.type,
          mobileType: mobileType,
          condition1: mobileDropdown.isOpen && mobileDropdown.type === mobileType,
          condition2: mobileDropdownRef.current.isOpen && mobileDropdownRef.current.type === mobileType
        });
        
        if (mobileDropdownRef.current.isOpen && mobileDropdownRef.current.type === mobileType) {
          console.log('CLOSING DROPDOWN');
          closeMobileDropdown();
          console.log('=== CLICK END (closed) ===');
          return;
        }
        console.log('OPENING DROPDOWN');
        openMobileDropdown(mobileType, event.currentTarget as HTMLElement);
        return;
      }
    }

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
    
    const setter = mapping[filterKey];
    if (setter) {
      setter(prev => !prev);
    }
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
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 1) {
      const results = getUniqueTeams().filter((t) => 
        t.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam([teamName]);
    setSearchTerm(teamName);
    setSearchResults([]);
  };

  const handleCheckboxChange = (filterType: string, value: string) => {
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
      if (filterType === 'total_goals') {
        return { 
          ...checkboxDropdownStyle,
          minWidth: '100px',
          width: 'auto',
          left: 0,
          right: 0
        };
      }
      return checkboxDropdownStyle;
    };
   
    return (
      <div style={{ ...filterItemStyle, 
        ...(filterType === 'leagues' && { minWidth:  isMobile ? '80px' : '250px',
        flex: isMobile ? 1 : undefined
       }) }} data-attribute={dataAttribute}>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => handleFilterClick(filterType, e)}
            style={selectWithDropdownStyle}
            title={getTitle()}
            data-filter-button="true"
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

  // const getLoadLimit = () => {
  //   if (isMobile || isIOS) return 20;
  //   if (!user || !hasAccess) return 20;
  //   return 99999; // Без лимита для залогиненных на ПК
  // };

  // 2. useEffect для отслеживания изменения доступа
  useEffect(() => {
    console.log('User access changed:', {
      prevEmail: prevUserEmail.current, // ← ТЕПЕРЬ ИСПОЛЬЗУЕТСЯ!
      currentEmail: user?.email,
      prevAccess: prevHasAccessRef.current,
      currentAccess: hasAccess
    });
    
    // Показываем лоадер если пользователь получил доступ (гость → зарегистрированный)
    if (!prevHasAccessRef.current && hasAccess) {
      console.log('User gained access, showing full loader');
      setShowFullScreenLoader(true);
      setAllMatchesCache([]); // Очищаем гостевые данные
    }
    
    // Обновляем ref с текущим состоянием
    prevUserEmail.current = user?.email; // ← ТЕПЕРЬ ИСПОЛЬЗУЕТСЯ!
    prevHasAccessRef.current = hasAccess;
  }, [user, hasAccess]); // Зависим от user и hasAccess

  // 3. ПРОСТАЯ функция загрузки ВСЕХ матчей (без useCallback!)
  const fetchAllMatches = async (): Promise<Match[]> => {
    try {
      console.log('🚀 Starting full data load...');
      const startTime = Date.now();
      
      const { data } = await axios.get<{ results: Match[] }>(
        `${API_BASE_URL}/api/matches/?limit=99999`,
        { timeout: 45000 }
      );
      
      const endTime = Date.now();
      console.log(`✅ Full data loaded in ${endTime - startTime}ms: ${data?.results?.length || 0} matches`);
      
      return data.results || [];
    } catch (error) {
      console.error('❌ Error fetching all matches:', error);
      return [];
    }
  };

  // 4. ПРОСТАЯ функция загрузки гостевых матчей
  const fetchGuestMatches = async (): Promise<Match[]> => {
    try {
      const { data } = await axios.get<{ results: Match[] }>(
        `${API_BASE_URL}/api/matches/?limit=20`,
        { timeout: 15000 }
      );
      return data.results || [];
    } catch (error) {
      console.error('Error fetching guest matches:', error);
      return [];
    }
  };

  // 5. ЕДИНЫЙ useEffect для загрузки данных
  useEffect(() => {
    const loadData = async () => {
      // Сценарий 1: Загрузка полных данных для зарегистрированных
      if (showFullScreenLoader) {
        const data = await fetchAllMatches();
        setAllMatchesCache(data);
        setShowFullScreenLoader(false);
      }
      // Сценарий 2: Первоначальная загрузка для гостей
      else if (!hasAccess && allMatchesCache.length === 0) {
        console.log('Loading initial 20 matches for guest');
        const data = await fetchGuestMatches();
        setAllMatchesCache(data);
      }
      // Сценарий 3: Если пользователь вышел (зарегистрированный → гость)
      else if (!hasAccess && allMatchesCache.length > 20) {
        console.log('User logged out, switching to guest view');
        const data = await fetchGuestMatches();
        setAllMatchesCache(data);
      }
    };
    
    loadData();
  }, [showFullScreenLoader, hasAccess, allMatchesCache.length]);
  // НЕТ fetchMatches в зависимостях!

  // 6. Функция для поиска матчей по команде (отдельно, по требованию)
  // const searchMatchesByTeam = async (teamName: string, isHome: boolean, isAway: boolean): Promise<Match[]> => {
  //   try {
  //     const params = new URLSearchParams();
  //     params.append('limit', '99999');
  //     params.append('team', teamName);
      
  //     const loc = [];
  //     if (isHome) loc.push('home');
  //     if (isAway) loc.push('away');
  //     if (loc.length) params.append('location', loc.join(','));
      
  //     const { data } = await axios.get<{ results: Match[] }>(
  //       `${API_BASE_URL}/api/matches/?${params}`,
  //       { timeout: 30000 }
  //     );
      
  //     return data.results || [];
  //   } catch (error) {
  //     console.error('Error searching matches:', error);
  //     return [];
  //   }
  // };
  
  /* ----------  рендер  ---------- */
  const topBlockRef = useRef<HTMLDivElement>(null);

  const formatOdds = (value: number | null | undefined): string => {
    return (value || 0).toFixed(2);
  };

  if (showFullScreenLoader) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundImage: 'url(/screen.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        
        {/* Затемнение */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }} />
        
        {/* Лоадер */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px',
          }} />
          <div style={{ 
            color: 'white', 
            fontSize: '18px',
            fontWeight: 'bold',
          }}>
            Loading data ...
          </div>
        </div>
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

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
            maxHeight: '180px',
            overflowY: 'auto',
            margin: '0 3px',
            padding: isVerySmallScreen ? '5px' : '12px'
          } : filtersContainerStyle}>
          
          {isMobile ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              width: '100%',
            }}>
              
              {/* РЯД 1: League, Home, Away */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
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
                          setShowAway((v) => !v);
                        }} 
                        style={{ marginRight: '5px' }}
                      />
                      Away
                    </label>
                  </div>
                </div>
              </div>
              
              {/* РЯД 2: 1_o, x_o, 2_o */}
              <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px'}}>
                <div style={{ flex: 1, minWidth: '40px'}}>
                  {renderCheckboxFilter('1_o', selectedOneOs, getUniqueOneOs(), 'one_o', showOneOCheckboxes, 'one-o-filter')}
                </div>

                <div style={{ flex: 1, minWidth: '40px' }}>
                  {renderCheckboxFilter('X_o', selectedXOs, getUniqueXOs(), 'x_o', showXOCheckboxes, 'x-o-filter')}
                </div>
                
                <div style={{ flex: 1, minWidth: '40px' }}>
                  {renderCheckboxFilter('2_o', selectedTwoOs, getUniqueTwoOs(), 'two_o', showTwoOCheckboxes, 'two-o-filter')}
                </div>
              </div>
              
              {/* РЯД 3: BTS, Total, Reset */}
              <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'flex-end'}}>
                <div style={{ flex: 1, minWidth: '80px' }}>
                  {renderCheckboxFilter('BTS', selectedBtsResult, ['Yes', 'No'], 'bts_result', showBtsResultCheckboxes, 'bts-result-filter')}
                </div>
                
                <div style={{ flex: 1, minWidth: '80px' }}>
                  {renderCheckboxFilter('Total', selectedTotalGoals, ['Over 1.5', 'Under 1.5', 'Over 2.5', 'Under 2.5', 'Over 3.5', 'Under 3.5'], 'total_goals', showTotalGoalsCheckboxes, 'total-goals-filter')}
                </div>
                
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
          
          {isMobile && allMatchesCache.length > 0 && (
            <div style={{
              fontSize: '12px',
              color: 'white',
              marginTop: '5px',
              padding: '5px',
              backgroundColor: '#2c3e50',
              borderRadius: '3px'
            }}>
              ⚠️ For full access to our database of 14,000+ matches and advanced filters, please visit the site from a PC.
            </div>
          )}
          
          {!isMobile && (!user || !hasAccess) && allMatchesCache.length > 0 && (
            <div style={{
              fontSize: '13px',
              color: 'white',
              padding: '5px',
              backgroundColor: '#2c3e50',
              borderRadius: '3px'
            }}>
              ⚠️ For guests, only the first 20 matches are shown.  
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModal('login');
                }}
                style={{ color: '#3498db', textDecoration: 'underline', marginLeft: '5px' }}
              >
                Register
              </a> to access the entire database (14,000+ matches)
            </div>
          )}
        </div>
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
      {/* Мобильное dropdown окно */}
      <MobileDropdown
        isOpen={mobileDropdown.isOpen}
        onClose={closeMobileDropdown}
        type={mobileDropdown.type}
        items={getMobileDropdownItems()}
        selectedValues={getMobileSelectedValues()}
        onSelect={handleMobileSelect}
        position={mobileDropdown.position || undefined}
      />
    </div>
  );
}