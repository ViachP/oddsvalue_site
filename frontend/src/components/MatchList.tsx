// MatchList.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { League, Match } from './types';
import axios from 'axios';
import { useCascadingFilters, type FilterState } from './useCascadingFilters';
import AccessModal from './Auth/AccessModal';
import LoginModal from './Auth/LoginModal';
import RenewModal from './Auth/RenewModal';
import { PaymentModal } from './PaymentModal';
import { useAuth } from './../contexts/AuthContext';

// стили
import {
  cellStyle, cellStyle_2, activeCardStyle, teamCellStyle, verticalHeaderStyle,
  fixedWidthColumnStyle, cardContainerStyle, cardStyle, cardCountStyle,
  cardTitleStyle, cardRoiStyle, topBlockStyle, searchResultsStyle,
  searchResultItemStyle, tableStyle, filtersContainerStyle, filtersRowStyle,
  filterItemStyle, labelStyle, checkboxLabelStyle, inputStyle, resetButtonStyle,
  stickyHeaderRowStyle, tableContainerStyle, checkboxDropdownStyle,
  checkboxItemStyle, customCheckboxStyle, customCheckboxCheckedStyle,
  selectWithDropdownStyle, checkboxDropdownWideStyle, leagueHeaderStyle
} from './MatchList.styles';

export default function MatchList() {
  /* ----------  состояния  ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [allMatchesCache, setAllMatchesCache] = useState<Match[]>(() => {
    try {
      const cached = localStorage.getItem('matchesCache');
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [highlight, setHighlight] = useState<null | 'home' | 'draw' | 'away'>(null);

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

  const { user } = useAuth();

  const hasAccess = user && (
    user.role === 'admin' ||
    (user.role === 'user' && user.expiresAt && new Date(user.expiresAt) > new Date())
  );

  // const isGuest   = !user;                    // вообще не заходил
  const isExpired = user && !hasAccess;       // заходил, но подписка кончилась

  /* ---------- состояния для модалок ---------- */
  const [isModalOpen, setIsModalOpen]     = useState(false); // AccessModal (гость)
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen]     = useState(false); // RenewModal  (просрочка)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleFilterClick = (filterKey: string) => {
    if (hasAccess) {
      /* ✅  доступ есть – работаем как раньше */
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
      return;
    }

    /* ❌  доступа нет – решаем, какую модалку показать */
    if (isExpired) {
      setIsRenewOpen(true);   // подписка кончилась
    } else {
      setIsModalOpen(true);   // гость
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
      setSearchResults(getUniqueTeams().filter((t) => t.toLowerCase().includes(term.toLowerCase())));
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
    setShowAway(false)

    setShowLeaguesCheckboxes(false)
    setShowOneOCheckboxes(false)
    setShowOneEsCheckboxes(false)
    setShowXOCheckboxes(false)
    setShowXEsCheckboxes(false)
    setShowTwoOCheckboxes(false)
    setShowTwoEsCheckboxes(false)
    setShowBtsOCheckboxes(false)
    setShowBtsEsCheckboxes(false)
    setShowBtsNoOCheckboxes(false)
    setShowBtsNoEsCheckboxes(false)
    setShowOverOCheckboxes(false)
    setShowOverEsCheckboxes(false)
    setShowUnderOCheckboxes(false)
    setShowUnderEsCheckboxes(false)
    setShowFirstHalfsCheckboxes(false)
    setShowMatchesCheckboxes(false)
    setShowBtsResultCheckboxes(false)
    setShowTotalGoalsCheckboxes(false)
  };

  const formatRoi = (roi: number | null) => {
    if (roi === null || isNaN(roi)) return '';
    const sign = roi >= 0 ? '+' : '';
    const color = roi >= 0 ? 'green' : 'red';
    return <span style={{ color }}>{`${sign}${roi.toFixed(2)}`}</span>;
  };

  const getFullLeagueName = (league: string): string => {
    if (!league) return ''
    return league.split(' - ')[0].trim()
  }

  /* ----------  dropdown-рендер  ---------- */
  const renderCheckboxFilter = (
    label: string,
    selectedValues: string[],
    availableValues: string[],
    filterType: string, 
    showDropdown: boolean,
    _setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>,
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
      <div style={{ ...filterItemStyle, ...(filterType === 'leagues' && { minWidth: '250px' }) }} data-attribute={dataAttribute}>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleFilterClick(filterType)} // ← БЛОКИРОВКА
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
                      onChange={() => handleCheckboxChange(filterType as string, value)}
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

  const isCacheFresh = () => {
    const ts = localStorage.getItem('cacheTimestamp');
    return ts && Date.now() - parseInt(ts) < 5 * 60 * 1000;
  };

  const fetchMatches = async (useCache = false) => {
    try {
      if (useCache && allMatchesCache.length > 0) return allMatchesCache;

      const params = new URLSearchParams();
      if (selectedTeam.length) {
        params.append('team', selectedTeam[0]);
        const loc = [];
        if (showHome) loc.push('home');
        if (showAway) loc.push('away');
        if (loc.length) params.append('location', loc.join(','));
      }
      const { data } = await axios.get<Match[]>(`${API_BASE_URL}/api/matches/?${params}`);
      return data;
    } catch {
      return [];
    }
  };

  /* ----------  инициализация  ---------- */
  useEffect(() => {
    const init = async () => {
      console.log('MatchList: init() started'); // ←
      try {
        if (isCacheFresh()) {
          const cached = localStorage.getItem('matchesCache');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              setAllMatchesCache(parsed);
            }
          }
        } else {
          const data = await fetchMatches(false);
          if (data && Array.isArray(data)) {
            setAllMatchesCache(data);
            localStorage.setItem('matchesCache', JSON.stringify(data));
            localStorage.setItem('cacheTimestamp', Date.now().toString());
          }
        }
      } catch (error) {
        
      }
    };
    init();
  }, []);

  /* ----------  рендер  ---------- */
  const topBlockRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ padding: '10px' }}>
      <div ref={topBlockRef} style={topBlockStyle}>
        {statistics && (
          <div style={cardContainerStyle}>
            <div style={cardStyle}>
              <div style={cardCountStyle}>{statistics.total_matches}</div>
              <div style={cardTitleStyle}>Total Matches</div>
              <div style={cardRoiStyle}></div>
            </div>
            <div
              style={{ ...cardStyle, cursor: 'pointer', ...(highlight === 'home' ? activeCardStyle : undefined) }}
              onClick={() => setHighlight((prev) => (prev === 'home' ? null : 'home'))}
            >
              <div style={cardCountStyle}>{statistics.home_wins_count}</div>
              <div style={cardTitleStyle}>Home Wins</div>
              <div style={cardRoiStyle}>{formatRoi(statistics.roi_home)}</div>
            </div>
            <div
              style={{ ...cardStyle, cursor: 'pointer', ...(highlight === 'draw' ? activeCardStyle : undefined) }}
              onClick={() => setHighlight((prev) => (prev === 'draw' ? null : 'draw'))}
            >
              <div style={cardCountStyle}>{statistics.draws_count}</div>
              <div style={cardTitleStyle}>Draws</div>
              <div style={cardRoiStyle}>{formatRoi(statistics.roi_draw)}</div>
            </div>
            <div
              style={{ ...cardStyle, cursor: 'pointer', ...(highlight === 'away' ? activeCardStyle : undefined) }}
              onClick={() => setHighlight((prev) => (prev === 'away' ? null : 'away'))}
            >
              <div style={cardCountStyle}>{statistics.away_wins_count}</div>
              <div style={cardTitleStyle}>Away Wins</div>
              <div style={cardRoiStyle}>{formatRoi(statistics.roi_away)}</div>
            </div>
            <div style={cardStyle}>
              <div style={cardCountStyle}>{statistics.bts_yes_count}</div>
              <div style={cardTitleStyle}>BTS Yes</div>
              <div style={cardRoiStyle}>{formatRoi(statistics.roi_bts_yes)}</div>
            </div>
            <div style={cardStyle}>
              <div style={cardCountStyle}>{statistics.bts_no_count}</div>
              <div style={cardTitleStyle}>BTS No</div>
              <div style={cardRoiStyle}>{formatRoi(statistics.roi_bts_no)}</div>
            </div>
            <div style={cardStyle}>
              <div style={cardCountStyle}>{statistics.over_count}</div>
              <div style={cardTitleStyle}>Over</div>
              <div style={cardRoiStyle}>{formatRoi(statistics.roi_over)}</div>
            </div>
            <div style={cardStyle}>
              <div style={cardCountStyle}>{statistics.under_count}</div>
              <div style={cardTitleStyle}>Under</div>
              <div style={cardRoiStyle}>{formatRoi(statistics.roi_under)}</div>
            </div>
          </div>
        )}

        <div style={filtersContainerStyle}>
          <div style={filtersRowStyle}>
            {/* League */}
            {renderCheckboxFilter(
              'League',
              selectedLeagues,
              getUniqueLeagues().map((l) => l.id),
              'leagues',
              showLeaguesCheckboxes,
              setShowLeaguesCheckboxes,
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
                    <li key={team} onClick={() => handleTeamSelect(team)} style={searchResultItemStyle}>
                      {team}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Home / Away */}
            <div style={filterItemStyle}>
              <div style={{ display: 'flex', gap: '5px', marginTop: '16px' }}>
                <label style={checkboxLabelStyle}>
                  <input type="checkbox" checked={showHome} onChange={() => setShowHome((v) => !v)} style={{ marginRight: '3px' }} />
                  Home
                </label>
                <label style={checkboxLabelStyle}>
                  <input type="checkbox" checked={showAway} onChange={() => setShowAway((v) => !v)} style={{ marginRight: '3px' }} />
                  Away
                </label>
              </div>
            </div>

            {/* Коэффициенты и прочие фильтры */}
            {renderCheckboxFilter('1(o)', selectedOneOs, getUniqueOneOs(), 'one_o', showOneOCheckboxes, setShowOneOCheckboxes, 'one-o-filter')}
            {renderCheckboxFilter('1(e)', selectedOneEs, getUniqueOneEs(), 'one_e', showOneEsCheckboxes, setShowOneEsCheckboxes, 'one-e-filter')}
            {renderCheckboxFilter('X(o)', selectedXOs, getUniqueXOs(), 'x_o', showXOCheckboxes, setShowXOCheckboxes, 'x-o-filter')}
            {renderCheckboxFilter('X(e)', selectedXEs, getUniqueXEs(), 'x_e', showXEsCheckboxes, setShowXEsCheckboxes, 'x-e-filter')}
            {renderCheckboxFilter('2(o)', selectedTwoOs, getUniqueTwoOs(), 'two_o', showTwoOCheckboxes, setShowTwoOCheckboxes, 'two-o-filter')}
            {renderCheckboxFilter('2(e)', selectedTwoEs, getUniqueTwoEs(), 'two_e', showTwoEsCheckboxes, setShowTwoEsCheckboxes, 'two-e-filter')}
            {renderCheckboxFilter('BTS(o)', selectedBtsOs, getUniqueBtsOs(), 'bts_o', showBtsOCheckboxes, setShowBtsOCheckboxes, 'bts-o-filter')}
            {renderCheckboxFilter('BTS(e)', selectedBtsEs, getUniqueBtsEs(), 'bts_e', showBtsEsCheckboxes, setShowBtsEsCheckboxes, 'bts-e-filter')}
            {renderCheckboxFilter('BTS_no(o)', selectedBtsNoOs, getUniqueBtsNoOs(), 'bts_no_o', showBtsNoOCheckboxes, setShowBtsNoOCheckboxes, 'bts-no-o-filter')}
            {renderCheckboxFilter('BTS_no(e)', selectedBtsNoEs, getUniqueBtsNoEs(), 'bts_no_e', showBtsNoEsCheckboxes, setShowBtsNoEsCheckboxes, 'bts-no-e-filter')}
            {renderCheckboxFilter('Over(o)', selectedOverOs, getUniqueOverOs(), 'over_o', showOverOCheckboxes, setShowOverOCheckboxes, 'over-o-filter')}
            {renderCheckboxFilter('Over(e)', selectedOverEs, getUniqueOverEs(), 'over_e', showOverEsCheckboxes, setShowOverEsCheckboxes, 'over-e-filter')}
            {renderCheckboxFilter('Under(o)', selectedUnderOs, getUniqueUnderOs(), 'under_o', showUnderOCheckboxes, setShowUnderOCheckboxes, 'under-o-filter')}
            {renderCheckboxFilter('Under(e)', selectedUnderEs, getUniqueUnderEs(), 'under_e', showUnderEsCheckboxes, setShowUnderEsCheckboxes, 'under-e-filter')}
            {renderCheckboxFilter('1H', selectedFirstHalfs, getUniqueFirstHalfs(), 'first_half', showFirstHalfsCheckboxes, setShowFirstHalfsCheckboxes, 'first-half-filter')}
            {renderCheckboxFilter('FT', selectedMatches, getUniqueMatches(), 'match', showMatchesCheckboxes, setShowMatchesCheckboxes, 'matches-filter')}
            {renderCheckboxFilter('BTS', selectedBtsResult, ['Yes', 'No'], 'bts_result', showBtsResultCheckboxes, setShowBtsResultCheckboxes, 'bts-result-filter')}
            {renderCheckboxFilter('Total', selectedTotalGoals, ['Over 1.5', 'Under 1.5', 'Over 2.5', 'Under 2.5', 'Over 3.5', 'Under 3.5'], 'total_goals', showTotalGoalsCheckboxes, setShowTotalGoalsCheckboxes, 'total-goals-filter')}

            {/* Reset */}
            <div style={{ ...filterItemStyle, minWidth: '80px', marginTop: '16px' }}>
              <button onClick={handleResetFilters} style={resetButtonStyle}>Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={stickyHeaderRowStyle}>
              <th style={{ minWidth: '120px' }}>Date</th>
              <th>Home</th>
              <th>Away</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>1(o)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>1(e)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>X(o)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>X(e)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>2(o)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>2(e)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>BTS(o)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>BTS(e)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>B_no(o)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>B_no(e)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>Over(o)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>Over(e)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>Und(o)</th>
              <th style={{ ...verticalHeaderStyle, ...fixedWidthColumnStyle }}>Und(e)</th>
              <th style={{ ...fixedWidthColumnStyle }}>1H</th>
              <th style={{ ...fixedWidthColumnStyle }}>FT</th>
              <th style={leagueHeaderStyle}>League</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((match) => {
              const matchDate = new Date(match.date);
              const day = matchDate.getDate().toString().padStart(2, '0');
              const month = (matchDate.getMonth() + 1).toString().padStart(2, '0');
              const year = matchDate.getFullYear();
              const hours = matchDate.getHours().toString().padStart(2, '0');
              const minutes = matchDate.getMinutes().toString().padStart(2, '0');
              const formattedDateTime = `${day}.${month}.${year}  ${hours}:${minutes}`;

              const isHighlighted =
                (highlight === 'home' && match.outcome === 'home') ||
                (highlight === 'draw' && match.outcome === 'draw') ||
                (highlight === 'away' && match.outcome === 'away');

              return (
                <tr key={match.id} style={isHighlighted ? { backgroundColor: '#63553f' } : undefined}>
                  <td style={cellStyle}>{formattedDateTime}</td>
                  <td style={teamCellStyle} title={match.home}>{match.home}</td>
                  <td style={teamCellStyle} title={match.away}>{match.away}</td>
                  <td style={cellStyle}>{match.one_o.toFixed(2)}</td>
                  <td style={cellStyle}>{match.one_e.toFixed(2)}</td>
                  <td style={cellStyle}>{match.x_o.toFixed(2)}</td>
                  <td style={cellStyle}>{match.x_e.toFixed(2)}</td>
                  <td style={cellStyle}>{match.two_o.toFixed(2)}</td>
                  <td style={cellStyle}>{match.two_e.toFixed(2)}</td>
                  <td style={cellStyle}>{(match.bts_o || 0).toFixed(2)}</td>
                  <td style={cellStyle}>{(match.bts_e || 0).toFixed(2)}</td>
                  <td style={cellStyle}>{(match.bts_no_o || 0).toFixed(2)}</td>
                  <td style={cellStyle}>{(match.bts_no_e || 0).toFixed(2)}</td>
                  <td style={cellStyle}>{match.over_o.toFixed(2)}</td>
                  <td style={cellStyle}>{match.over_e.toFixed(2)}</td>
                  <td style={cellStyle}>{match.under_o.toFixed(2)}</td>
                  <td style={cellStyle}>{match.under_e.toFixed(2)}</td>
                  <td style={cellStyle}>{match.first_half || '-'}</td>
                  <td style={cellStyle}>{match.match || '-'}</td>
                  <td style={cellStyle_2} title={match.league}>{getFullLeagueName(match.league)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSwitchToLogin={() => {
         setIsModalOpen(false); // закрываем AccessModal
         setIsLoginOpen(true);  // открываем LoginModal
        }}
      />
      <RenewModal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        onSwitchToPayment={() => {
          setIsRenewOpen(false);
          /* открой свою модалку-оплату */
          setIsPaymentOpen(true);
        }}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />	
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
}
