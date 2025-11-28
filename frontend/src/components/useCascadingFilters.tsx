// useCascadingFilters.tsx
import { useMemo } from 'react';
import type { Match, Statistics } from './types';

export interface FilterState {
  selectedLeagues: string[];
  selectedTeam: string[];
  showHome: boolean;
  showAway: boolean;
  selectedOneOs: string[];
  selectedOneEs: string[];
  selectedXOs: string[];
  selectedXEs: string[];
  selectedTwoOs: string[];
  selectedTwoEs: string[];
  selectedBtsOs: string[];
  selectedBtsEs: string[];
  selectedBtsNoOs: string[];
  selectedBtsNoEs: string[];
  selectedOverOs: string[];
  selectedOverEs: string[];
  selectedUnderOs: string[];
  selectedUnderEs: string[];
  selectedFirstHalfs: string[];
  selectedMatches: string[];
  selectedBtsResult: string[];
  selectedTotalGoals: string[];
}

/* ========== сбор уникальных наборов ========== */
type Sets = ReturnType<typeof buildSets>;
function buildSets(ms: Match[]) {
  const s = {
    oneOs: new Set<string>(), oneEs: new Set<string>(),
    xOs: new Set<string>(), xEs: new Set<string>(),
    twoOs: new Set<string>(), twoEs: new Set<string>(),
    btsOs: new Set<string>(), btsEs: new Set<string>(),
    btsNoOs: new Set<string>(), btsNoEs: new Set<string>(),
    overOs: new Set<string>(), overEs: new Set<string>(),
    underOs: new Set<string>(), underEs: new Set<string>(),
    firstHalfs: new Set<string>(), matches: new Set<string>(),
    leagues: new Map<string, string>(), teams: new Set<string>(),
  };
  ms.forEach(m => {
      s.oneOs.add((m.one_o || 0).toFixed(2)); s.oneEs.add((m.one_e || 0).toFixed(2));
      s.xOs.add((m.x_o || 0).toFixed(2)); s.xEs.add((m.x_e || 0).toFixed(2));
      s.twoOs.add((m.two_o || 0).toFixed(2)); s.twoEs.add((m.two_e || 0).toFixed(2));
      s.btsOs.add((m.bts_o || 0).toFixed(2)); s.btsEs.add((m.bts_e || 0).toFixed(2));
      s.btsNoOs.add((m.bts_no_o || 0).toFixed(2)); s.btsNoEs.add((m.bts_no_e || 0).toFixed(2));
      s.overOs.add((m.over_o || 0).toFixed(2)); s.overEs.add((m.over_e || 0).toFixed(2));
      s.underOs.add((m.under_o || 0).toFixed(2)); s.underEs.add((m.under_e || 0).toFixed(2));
      if (m.first_half) s.firstHalfs.add(m.first_half);
      if (m.match) s.matches.add(m.match);
      if (m.league_id && m.league)
        s.leagues.set(m.league_id, m.league.split(' - ')[0].trim());
      s.teams.add(m.home); s.teams.add(m.away);
  });
  return {
    oneOs: Array.from(s.oneOs).sort(), oneEs: Array.from(s.oneEs).sort(),
    xOs: Array.from(s.xOs).sort(), xEs: Array.from(s.xEs).sort(),
    twoOs: Array.from(s.twoOs).sort(), twoEs: Array.from(s.twoEs).sort(),
    btsOs: Array.from(s.btsOs).sort(), btsEs: Array.from(s.btsEs).sort(),
    btsNoOs: Array.from(s.btsNoOs).sort(), btsNoEs: Array.from(s.btsNoEs).sort(),
    overOs: Array.from(s.overOs).sort(), overEs: Array.from(s.overEs).sort(),
    underOs: Array.from(s.underOs).sort(), underEs: Array.from(s.underEs).sort(),
    firstHalfs: Array.from(s.firstHalfs).sort(), matches: Array.from(s.matches).sort(),
    leagues: Array.from(s.leagues.entries()).map(([id, name]) => ({ id, name })),
    teams: Array.from(s.teams).sort(),
  };
}

/* ========== чистая фильтрация ========== */
function filterMatches(ms: Match[], f: Partial<FilterState>): Match[] {
  let res = [...ms];

  if (f.selectedLeagues?.length)
    res = res.filter(m => f.selectedLeagues!.includes(m.league_id));

  if (f.selectedTeam?.length) {
    const [team] = f.selectedTeam!;
    const loc: string[] = [];
    if (f.showHome) loc.push('home');
    if (f.showAway) loc.push('away');
    res = res.filter(m =>
      loc.length
        ? (loc.includes('home') && m.home === team) ||
          (loc.includes('away') && m.away === team)
        : (m.home === team || m.away === team)
    );
  }

  const filterNum = (k: keyof Match, vals?: string[]) => {
    if (!vals?.length) return;
    res = res.filter(m => vals!.includes((m[k] as number).toFixed(2)));
  };

  filterNum('one_o', f.selectedOneOs); filterNum('one_e', f.selectedOneEs);
  filterNum('x_o', f.selectedXOs); filterNum('x_e', f.selectedXEs);
  filterNum('two_o', f.selectedTwoOs); filterNum('two_e', f.selectedTwoEs);
  filterNum('bts_o', f.selectedBtsOs); filterNum('bts_e', f.selectedBtsEs);
  filterNum('bts_no_o', f.selectedBtsNoOs); filterNum('bts_no_e', f.selectedBtsNoEs);
  filterNum('over_o', f.selectedOverOs); filterNum('over_e', f.selectedOverEs);
  filterNum('under_o', f.selectedUnderOs); filterNum('under_e', f.selectedUnderEs);

  if (f.selectedFirstHalfs?.length)
    res = res.filter(m => m.first_half && f.selectedFirstHalfs!.includes(m.first_half));
  if (f.selectedMatches?.length)
    res = res.filter(m => m.match && f.selectedMatches!.includes(m.match));
  if (f.selectedBtsResult?.length)
    res = res.filter(m => {
      if (!m.match?.includes(' - ')) return false;
      const [h, a] = m.match.split(' - ').map(Number);
      return f.selectedBtsResult!.includes(h > 0 && a > 0 ? 'Yes' : 'No');
    });
  if (f.selectedTotalGoals?.length)
    res = res.filter(m => {
      if (!m.match?.includes(' - ')) return false;
      const total = m.match.split(' - ').reduce((s, n) => s + Number(n), 0);
      return f.selectedTotalGoals!.some(v => {
        const val = parseFloat(v.replace(/Over|Under/, ''));
        return v.startsWith('Over') ? total > val : total < val;
      });
    });

  return res;
}

/* ========== маппинг полей ========== */
const filterKeyMap: Record<keyof Sets, keyof FilterState> = {
  oneOs: 'selectedOneOs', oneEs: 'selectedOneEs',
  xOs: 'selectedXOs', xEs: 'selectedXEs',
  twoOs: 'selectedTwoOs', twoEs: 'selectedTwoEs',
  btsOs: 'selectedBtsOs', btsEs: 'selectedBtsEs',
  btsNoOs: 'selectedBtsNoOs', btsNoEs: 'selectedBtsNoEs',
  overOs: 'selectedOverOs', overEs: 'selectedOverEs',
  underOs: 'selectedUnderOs', underEs: 'selectedUnderEs',
  firstHalfs: 'selectedFirstHalfs', matches: 'selectedMatches',
  teams: 'selectedTeam', leagues: 'selectedLeagues',
};

/* ========== хук ========== */
export function useCascadingFilters(allMatches: Match[], filters: FilterState) {
  /* ----------- итоговые матчи ----------- */
  const filtered = useMemo(() => filterMatches(allMatches, filters), [allMatches, filters]);

  /* ----------- базовые наборы ----------- */
  const fullSets = useMemo(() => buildSets(allMatches), [allMatches]);

  /* ----------- статистика ----------- */
  const statistics = useMemo((): Statistics | null => {
    if (!filtered.length) return null;
    let total = 0, home = 0, draw = 0, away = 0, btsY = 0, btsN = 0, over = 0, under = 0;
    let stakeH = 0, stakeD = 0, stakeA = 0, stakeY = 0, stakeN = 0, stakeO = 0, stakeU = 0;

    filtered.forEach(m => {
      if (!m.match?.includes(' - ')) return;
      const [h, a] = m.match.split(' - ').map(Number);
      const tot = h + a; total++;

      if (h > a) { home++; if (m.one_e) stakeH += m.one_e - 1; } else stakeH -= 1;
      if (h === a) { draw++; if (m.x_e) stakeD += m.x_e - 1; } else stakeD -= 1;
      if (h < a) { away++; if (m.two_e) stakeA += m.two_e - 1; } else stakeA -= 1;

      const bts = h > 0 && a > 0;
      if (bts) { btsY++; if (m.bts_e) stakeY += m.bts_e - 1; } else stakeY -= 1;
      if (!bts) { btsN++; if (m.bts_no_e) stakeN += m.bts_no_e - 1; } else stakeN -= 1;

      if (tot > 2.5) { over++; if (m.over_e) stakeO += m.over_e - 1; } else stakeO -= 1;
      if (tot < 2.5) { under++; if (m.under_e) stakeU += m.under_e - 1; } else stakeU -= 1;
    });

    return {
      total_matches: total,
      home_wins_count: home, draws_count: draw, away_wins_count: away,
      bts_yes_count: btsY, bts_no_count: btsN,
      over_count: over, under_count: under,
      roi_home: stakeH, roi_draw: stakeD, roi_away: stakeA,
      roi_bts_yes: stakeY, roi_bts_no: stakeN,
      roi_over: stakeO, roi_under: stakeU,
    };
  }, [filtered]);

  /* ----------- селекторы ----------- */
  const isAnyFilterActive = useMemo(
    () => Object.entries(filters).some(([_, v]) => Array.isArray(v) && v.length > 0),
    [filters]
  );

  /* строковые рынки */
  const mkStringSelector = (key: keyof Sets) => () => {
    const filterKey = filterKeyMap[key];
    const currentArr: string[] = (filters[filterKey] as string[]) ?? [];
    const pool = new Set<string>();

    if (!isAnyFilterActive) {
      (fullSets[key] as string[]).forEach(v => pool.add(v));
    } else {
      // каскад без текущего фильтра
      const filtersEx = { ...filters, [filterKey]: [] };
      const cascaded  = filterMatches(allMatches, filtersEx);
      (buildSets(cascaded)[key] as string[]).forEach(v => pool.add(v));
      // + уже выбранные в этом фильтре
      currentArr.forEach(v => pool.add(v));
    }
    return Array.from(pool).sort();
  };

  /* лиги */
  const mkLeagueSelector = () => {
    if (!isAnyFilterActive) return fullSets.leagues;
    const filtersEx = { ...filters, selectedLeagues: [] };
    const cascaded  = filterMatches(allMatches, filtersEx);
    const setsEx    = buildSets(cascaded);
    const pool      = new Map(setsEx.leagues.map(l => [l.id, l]));
    filters.selectedLeagues.forEach(id => {
      if (!pool.has(id)) {
        const fromFull = fullSets.leagues.find(l => l.id === id);
        if (fromFull) pool.set(id, fromFull);
      }
    });
    return Array.from(pool.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  /* ----------- возвращаем ----------- */
  return {
    filteredMatches: filtered,
    statistics,

    getUniqueOneOs: mkStringSelector('oneOs'), getUniqueOneEs: mkStringSelector('oneEs'),
    getUniqueXOs:   mkStringSelector('xOs'),   getUniqueXEs:   mkStringSelector('xEs'),
    getUniqueTwoOs: mkStringSelector('twoOs'), getUniqueTwoEs: mkStringSelector('twoEs'),
    getUniqueBtsOs: mkStringSelector('btsOs'), getUniqueBtsEs: mkStringSelector('btsEs'),
    getUniqueBtsNoOs: mkStringSelector('btsNoOs'), getUniqueBtsNoEs: mkStringSelector('btsNoEs'),
    getUniqueOverOs:  mkStringSelector('overOs'),  getUniqueOverEs:  mkStringSelector('overEs'),
    getUniqueUnderOs: mkStringSelector('underOs'), getUniqueUnderEs: mkStringSelector('underEs'),
    getUniqueFirstHalfs: mkStringSelector('firstHalfs'), getUniqueMatches: mkStringSelector('matches'),

    getUniqueLeagues: mkLeagueSelector,
    getUniqueTeams:   mkStringSelector('teams'),
  };
}