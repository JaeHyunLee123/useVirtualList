import { render, fireEvent, screen } from '@testing-library/react';
import React, { useRef } from 'react';
import { describe, it, expect } from 'vitest';
import useVirtualList from './useVirtualList';

function TestComponent({
  allItems,
  rowHeightPx = 50,
  itemsPerRow = 1,
  buffer = 0,
}: {
  allItems: string[];
  rowHeightPx?: number;
  itemsPerRow?: number;
  buffer?: number;
}) {
  const outerContainerRef = useRef<HTMLDivElement>(null);

  const {
    handleOuterContainerScroll,
    visibleRows,
    slidingWindowTranslatePx,
    innerContainerHeight,
  } = useVirtualList({
    allItems,
    rowHeightPx,
    itemsPerRow,
    outerContainerRef,
    buffer,
  });

  return (
    <div
      data-testid="outer-container"
      ref={outerContainerRef}
      onScroll={handleOuterContainerScroll}
      style={{ height: '400px', overflow: 'auto' }}
    >
      <div
        data-testid="inner-container"
        style={{ height: `${innerContainerHeight}px`, position: 'relative' }}
      >
        <div
          data-testid="sliding-window"
          style={{ transform: `translateY(${slidingWindowTranslatePx}px)` }}
        >
          {visibleRows.map((row, rowIndex) => (
            <div key={rowIndex} data-testid="row" style={{ display: 'flex', height: `${rowHeightPx}px` }}>
              {row.map((item) => (
                <div key={item} data-testid="item">
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

describe('useVirtualList', () => {
  it('should render initial items correctly based on container height', () => {
    const allItems = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
    render(<TestComponent allItems={allItems} rowHeightPx={50} itemsPerRow={1} buffer={0} />);

    // Container height is mocked to 400px. Row height is 50px.
    // 400 / 50 = 8 rows should be visible.
    const items = screen.getAllByTestId('item');
    expect(items.length).toBe(8);
    expect(items[0].textContent).toBe('Item 0');
    expect(items[7].textContent).toBe('Item 7');
  });

  it('should render correct items when scrolled', () => {
    const allItems = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
    render(<TestComponent allItems={allItems} rowHeightPx={50} itemsPerRow={1} buffer={0} />);

    const outerContainer = screen.getByTestId('outer-container');
    
    // Custom set scrollTop on the DOM node to trigger state update correctly
    fireEvent.scroll(outerContainer, { target: { scrollTop: 100 } });

    // Scrolled 100px down.
    // Start index = 100 / 50 = 2.
    // Should render from index 2.
    const items = screen.getAllByTestId('item');
    expect(items.length).toBe(8);
    expect(items[0].textContent).toBe('Item 2');
    expect(items[7].textContent).toBe('Item 9');
    
    // Sliding window translateY should be 100px
    const slidingWindow = screen.getByTestId('sliding-window');
    expect(slidingWindow.style.transform).toBe('translateY(100px)');
  });

  it('should handle buffer correctly', () => {
    const allItems = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
    render(<TestComponent allItems={allItems} rowHeightPx={50} itemsPerRow={1} buffer={2} />);

    // Container 400px / 50px = 8 rows.
    // Buffer = 2. Total rendered = 8 + 2 = 10 rows.
    const items = screen.getAllByTestId('item');
    expect(items.length).toBe(10);
    expect(items[0].textContent).toBe('Item 0');
    expect(items[9].textContent).toBe('Item 9');
  });
});
