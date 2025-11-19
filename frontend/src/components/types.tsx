// types.ts
export interface League {
  id: string;
  name: string;
}

export interface Match {
  id: number;
  date: string;
  home: string;
  away: string;
  league: string;
  league_id: string;
  one_o: number;
  one_e: number;
  x_o: number;
  x_e: number;
  two_o: number;
  two_e: number;
  bts_o: number;
  bts_e: number;
  bts_no_o: number;
  bts_no_e: number;
  over_o: number;
  over_e: number;
  under_o: number;
  under_e: number;
  first_half: string | null;
  match: string | null;
  goals: string | null;
  link: string | null;
  notes: string | null;
  outcome: 'home' | 'draw' | 'away';
}

export interface Statistics {
  total_matches: number;
  home_wins_count: number;
  draws_count: number;
  away_wins_count: number;
  bts_yes_count: number;
  bts_no_count: number;
  over_count: number;
  under_count: number;
  roi_home: number;
  roi_draw: number;
  roi_away: number;
  roi_bts_yes: number;
  roi_bts_no: number;
  roi_over: number;
  roi_under: number;
}