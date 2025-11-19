// MatchList.styles.ts
import type { CSSProperties } from 'react';

export const activeCardStyle: CSSProperties = {
  border: '2px solid #fff',
  boxSizing: 'border-box',
};

export const cellStyle: CSSProperties = {
  padding: '4px 6px',
  border: '1px solid #444',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
};

export const cellStyle_2: CSSProperties = {
  padding: '4px 6px',
  border: '1px solid #444',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 150,
  boxSizing: 'border-box',
  cursor: 'default',
};

export const teamCellStyle: React.CSSProperties = {
  ...cellStyle,
  minWidth: '120px',
  maxWidth: '120px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'left',
  cursor: 'default',
};

export const leagueHeaderStyle: CSSProperties = {
  // minWidth: '120px',
  textAlign: 'left',
  paddingLeft: '40px', // ← ЯВНЫЙ ОТСТУП ОТ ЛЕВОГО КРАЯ
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

export const verticalHeaderStyle: CSSProperties = {
  writingMode: 'vertical-lr',
  textOrientation: 'mixed',
  transform: 'rotate(180deg)',
  whiteSpace: 'nowrap',
  padding: '4px 6px',
  textAlign: 'center',
  verticalAlign: 'middle',
  minWidth: '30px',
  boxSizing: 'border-box',
  border: '1px solid #444',
};

export const fixedWidthColumnStyle: CSSProperties = {
  minWidth: '45px',
};

export const cardContainerStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '10px',
  marginBottom: '10px',
  backgroundColor: '#333',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

export const cardStyle: CSSProperties = {
  backgroundColor: '#444',
  padding: '10px',
  borderRadius: '8px',
  textAlign: 'center',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '80px',
};

export const cardCountStyle: CSSProperties = {
  fontSize: '1.5em',
  fontWeight: 'bold',
  marginBottom: '3px',
};

export const cardTitleStyle: CSSProperties = {
  fontSize: '0.8em',
  color: '#bbb',
  marginBottom: '3px',
};

export const cardRoiStyle: CSSProperties = {
  fontSize: '0.7em',
  fontWeight: 'bold',
};

export const topBlockStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: '#282c34',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
};

export const searchResultsStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#333',
  border: '1px solid #555',
  borderRadius: '3px',
  maxHeight: '200px',
  overflowY: 'auto',
  zIndex: 101,
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

export const searchResultItemStyle: CSSProperties = {
  padding: '8px 10px',
  cursor: 'pointer',
  borderBottom: '1px solid #333',
};

export const tableStyle: CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  fontSize: '0.85em',
  margin: '0 auto',
};

export const filtersContainerStyle: CSSProperties = {
  // marginBottom: '15px',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#2a2a2a',
};

export const filtersRowStyle: CSSProperties = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const filterItemStyle: CSSProperties = {
  minWidth: '90px',
  flex: '0 1 auto',
};

export const selectStyle: CSSProperties = {
  padding: '3px 5px',
  border: '1px solid #555',
  borderRadius: '3px',
  fontSize: '0.8em',
  backgroundColor: '#333',
  color: 'white',
  height: '26px',
  width: '100%',
};

export const inputStyle: CSSProperties = {
  // padding: '3px 5px',
  padding: '0 0 0 5px',
  // margin: '0 0 0 3px',
  border: '1px solid #555',
  borderRadius: '3px',
  fontSize: '0.8em',
  backgroundColor: '#333',
  color: 'white',
  height: '26px',
  width: '100%',
};

export const labelStyle: CSSProperties = {
  fontSize: '0.75em',
  color: '#bbb',
  marginBottom: '2px',
  display: 'block',
};

export const checkboxLabelStyle: CSSProperties = {
  fontSize: '0.75em',
  color: '#bbb',
  marginRight: '8px',
  marginLeft: '14px',
};

export const resetButtonStyle: CSSProperties = {
  padding: '4px 14px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '0.8em',
  height: '26px',
};

export const stickyHeaderRowStyle: CSSProperties = {
  position: 'sticky',
  top: '0',
  zIndex: 90,
  backgroundColor: '#282c34',
};

export const tableContainerStyle: CSSProperties = {
  overflowX: 'hidden', // Убираем горизонтальный скролл'auto',
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 250px)',
  marginTop: '0', // Убедитесь что нет отступов
  padding: '0', // Уберите внутренние отступы
  backgroundColor: '#282c34' // Фон контейнера должен совпадать
};

export const applyButtonStyle: CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#28a745', // Зеленый цвет вместо синего
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '0.8em',
  height: '26px',
};

export const rangeInputStyle: React.CSSProperties = {
  padding: '2px',
  margin: '2px 0',
  width: '60px',
  fontSize: '12px',
  border: '1px solid #ccc',
  borderRadius: '3px'
};

export const checkboxDropdownStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#333',
  border: '1px solid #555',
  borderRadius: '3px',
  padding: '5px',
  maxHeight: '150px',
  overflowY: 'auto',
  zIndex: 1000,
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
};

export const checkboxItemStyle: CSSProperties = {
  padding: '3px 5px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.8em',
  color: 'white'
};

export const customCheckboxStyle: CSSProperties = {
  marginRight: '6px',
  cursor: 'pointer',
  backgroundColor: '#333',
  border: '1px solid #fff',
  borderRadius: '2px',
  width: '12px',
  height: '12px'
};

export const customCheckboxCheckedStyle: CSSProperties = {
  backgroundColor: '#fff'
};

export const selectWithDropdownStyle = {
  ...selectStyle, // ваш базовый стиль
  textAlign: 'left' as const,
  cursor: 'pointer' as const,
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 0.5rem center' as const,
  backgroundSize: '16px 12px',
  paddingRight: '25px'
};

export const checkboxDropdownWideStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#333',
  border: '1px solid #4a5568',
  borderRadius: '4px',
  padding: '8px',
  zIndex: 1000,
  maxHeight: '200px',
  overflowY: 'auto',
  minWidth: '200px',
  width: 'auto'
} as const; // ← Добавьте as const для типизации

export const selectedRowStyle: CSSProperties = {
  backgroundColor: '#e3f2fd',
  border: '2px solid #2196f3'
};

export const selectableCellStyle: CSSProperties = {
  cursor: 'pointer',
  userSelect: 'none'
};

