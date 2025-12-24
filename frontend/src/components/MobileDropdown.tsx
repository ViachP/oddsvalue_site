
// components/MobileDropdown.tsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

type DropdownType = 
  | 'leagues' 
  | 'one_o' 
  | 'two_o' 
  | 'x_o'
  | 'bts_result' 
  | 'total_goals';

interface DropdownItem {
  value: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: DropdownType;
  items: DropdownItem[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  position?: { top: number; left: number; width: number };
}

const MobileDropdown: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  selectedValues,
  onSelect,
  position
}) => {
  console.log('🚀 MobileDropdown props:', {
    isOpen,
    position,
    itemsCount: items.length,
    hasPosition: !!position,
    positionValues: position ? {
      top: position.top,
      left: position.left,
      width: position.width
    } : 'null'
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // const handleClickOutside = (event: MouseEvent) => {
    //   if (dropdownRef.current?.contains(event.target as Node)) {
    //     return;
    //   }
      
    //   onClose();
    // };

    const handleClickOutside = (event: MouseEvent) => {
      // Проверяем, был ли клик по кнопке фильтра
      const isFilterButton = (event.target as Element).closest('[data-filter-button="true"]');
      
      if (isFilterButton) {
        // Не закрываем при клике на кнопку фильтра
        return;
      }
      
      if (dropdownRef.current?.contains(event.target as Node)) {
        return;
      }
      
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(value);
  };

  if (!isOpen || !position) return null;

  const dropdownStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: `${Math.min(position.width, window.innerWidth - 20)}px`,
    maxHeight: '50vh',
    overflowY: 'auto',
    backgroundColor: '#333',
    border: '1px solid #555',
    borderRadius: '3px',
    zIndex: 99999,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  };

  return ReactDOM.createPortal(
    <div 
      ref={dropdownRef} 
      style={dropdownStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
        {items.map((item) => {
          const isSelected = selectedValues.includes(item.value);
          
          return (
            <div
              key={item.value}
              style={{
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #444',
                backgroundColor: isSelected ? '#2a2e3a' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={(e) => handleItemClick(item.value, e)}
            >
              <div style={{
                width: '12px',
                height: '12px',
                border: '1px solid white',
                borderRadius: '2px',
                marginRight: '8px',
                backgroundColor: isSelected ? 'white' : '#333',
                flexShrink: 0,
              }} />
              
              <span style={{ 
                color: 'white', 
                fontSize: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
};

export default MobileDropdown;