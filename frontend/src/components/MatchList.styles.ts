// MatchList.styles.ts
import type { CSSProperties } from 'react';

export const activeCardStyle: CSSProperties = {
  border: '2px solid #fff',
  boxSizing: 'border-box',
};

export const cellStyle: CSSProperties = {
  padding: '4px 4px',
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

export const teamCellStyle: CSSProperties = {
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
  textAlign: 'left',
  paddingLeft: '40px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

// export const verticalHeaderStyle: CSSProperties = {
//   writingMode: 'vertical-lr',
//   textOrientation: 'mixed',
//   transform: 'rotate(180deg)',
//   whiteSpace: 'nowrap',
//   padding: '4px 6px',
//   textAlign: 'center',
//   verticalAlign: 'middle',
//   minWidth: '30px',
//   boxSizing: 'border-box',
//   border: '1px solid #444',
// };

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
  // position: 'fixed', 
  top: 0,
  left: 0,  // добавили
  right: 0, // или width: '100%'  
  zIndex: 100,
  backgroundColor: '#282c34',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  WebkitBackdropFilter: 'blur(10px)',
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
  backgroundColor: '#333',
  color: 'white',
  transition: 'background-color 0.2s',
};

export const tableStyle: CSSProperties = {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '0.85em',
    margin: '0 auto',
};

export const filtersContainerStyle: CSSProperties = {
  padding: '8px',
  // border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#2a2a2a',
  marginBottom: '2px',
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
  padding: '0 0 0 5px',
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
    overflowX: 'auto',
    overflowY: 'auto', 
    WebkitOverflowScrolling: 'touch',
    maxHeight: 'calc(100vh - 250px)',
    marginTop: '0',
    padding: '0',
    backgroundColor: '#282c34',
    // maxHeight: 'none' // Убираем ограничение высоты
};

export const applyButtonStyle: CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '0.8em',
  height: '26px',
};

export const rangeInputStyle: CSSProperties = {
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
  WebkitAppearance: 'none',
  appearance: 'none',
  marginRight: '6px',
  cursor: 'pointer',
  backgroundColor: '#333',
  border: '1px solid #fff',
  borderRadius: '2px',
  width: '12px',
  height: '12px',
};

export const customCheckboxCheckedStyle: CSSProperties = {
  backgroundColor: '#fff',
  borderColor: '#fff',
};

export const selectWithDropdownStyle = {
  ...selectStyle,
  textAlign: 'left' as const,
  cursor: 'pointer' as const,
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 0.5rem center' as const,
  backgroundSize: '16px 12px',
  paddingRight: '25px'
};

export const checkboxDropdownWideStyle: CSSProperties = {
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
} as const;

export const selectedRowStyle: CSSProperties = {
  backgroundColor: '#e3f2fd',
  border: '2px solid #2196f3'
};

export const selectableCellStyle: CSSProperties = {
  cursor: 'pointer',
  userSelect: 'none'
};

// =============================================
// МОБИЛЬНЫЕ СТИЛИ
// =============================================

export const mobileTableContainerStyle: CSSProperties = {
  ...tableContainerStyle, 
  overflowX: 'auto'as const,
  WebkitOverflowScrolling: 'touch'as const,
  margin: '0 -10px',
  padding: '0 10px',
};

export const mobileTableStyle: CSSProperties = {
    ...tableStyle,
    minWidth: '900px', // Было 1100px
    fontSize: '11px', // Было 12px
    tableLayout: 'fixed',
};

export const mobileCellStyle: CSSProperties = {
    ...cellStyle,
    padding: '4px 2px', // Было '8px 4px'
    minWidth: '40px', // Было 50px
    fontSize: '11px', // Было 12px
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

// Улучшенная версия мобильных ячеек - более компактная
export const mobileCellStyleEnhanced: CSSProperties = {
  ...mobileCellStyle,
  fontSize: '10px',
  padding: '4px 2px',
  minWidth: '40px',
  maxWidth: '60px',
};

export const mobileTeamCellStyle: CSSProperties = {
  ...teamCellStyle,
  minWidth: '100px',
  maxWidth: '100px',
  fontSize: '12px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

// Улучшенная версия для командных ячеек
export const mobileTeamCellStyleEnhanced: CSSProperties = {
  ...mobileTeamCellStyle,
  fontSize: '10px',
  minWidth: '80px',
  maxWidth: '90px',
  padding: '4px 3px',
};

export const mobileInputStyle: CSSProperties = {
  ...inputStyle,
  minHeight: '40px',
  fontSize: '14px',
  padding: '0 10px',
};

export const mobileSelectStyle: CSSProperties = {
  ...selectStyle,
  minHeight: '40px',
  fontSize: '14px',
  padding: '8px 25px 8px 10px',
};

export const mobileButtonStyle: CSSProperties = {
  ...resetButtonStyle,
  minHeight: '40px',
  padding: '12px 20px',
  fontSize: '14px',
};

export const mobileApplyButtonStyle: CSSProperties = {
  ...applyButtonStyle,
  minHeight: '40px',
  padding: '12px 20px',
  fontSize: '14px',
};

// Компактные мобильные кнопки
export const mobileButtonCompactStyle: CSSProperties = {
  ...mobileButtonStyle,
  padding: '8px 12px',
  fontSize: '12px',
  minHeight: '32px',
};

// Для очень маленьких экранов
export const cardViewContainerStyle: CSSProperties = {
  display: 'none',
};

export const cardViewItemStyle: CSSProperties = {
  backgroundColor: '#333',
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px',
};

export const cardViewRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #444',
};

export const cardViewLabelStyle: CSSProperties = {
  fontWeight: 'bold',
  color: '#9ca3af',
  minWidth: '100px',
};

export const mobileFilterItemStyle: CSSProperties = {
  ...filterItemStyle,
  minWidth: '70px',
  flexShrink: 0,
};

// Компактный стиль для фильтров на мобильных
export const mobileFilterItemCompactStyle: CSSProperties = {
  ...mobileFilterItemStyle,
  minWidth: '60px',
  fontSize: '10px',
};

// Улучшенный вертикальный заголовок для мобильных
// export const mobileVerticalHeaderStyle: CSSProperties = {
//   ...verticalHeaderStyle,
//   minWidth: '20px',
//   padding: '2px 4px',
//   fontSize: '9px',
// };

