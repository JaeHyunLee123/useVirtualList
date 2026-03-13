import { useRef, useMemo, useEffect, useState } from 'react';
import useVirtualList from '@radhan000123/use-virtual-list';

const TOTAL_ITEMS = 100000;
const ITEM_HEIGHT = 120;
const MIN_COLUMN_WIDTH = 200;

export default function MultiColumnDemo() {
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [itemsPerRow, setItemsPerRow] = useState(1);
  const [domNodeCount, setDomNodeCount] = useState(0);

  const allItems = useMemo(() => {
    return Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
      id: i,
      title: `Grid Item ${i + 1}`,
      color: `hsl(${(i * 137.5) % 360}, 70%, ${(i % 2 === 0 ? 30 : 20)}%)`
    }));
  }, []);

  // Update itemsPerRow based on container width
  useEffect(() => {
    if (!outerContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width - 24; // Exclude scrollbar & padding
        const newCols = Math.max(1, Math.floor(width / MIN_COLUMN_WIDTH));
        if (newCols !== itemsPerRow) {
          setItemsPerRow(newCols);
        }
      }
    });

    observer.observe(outerContainerRef.current);
    return () => observer.disconnect();
  }, [itemsPerRow]);

  const {
    handleOuterContainerScroll,
    visibleRows,
    slidingWindowTranslatePx,
    innerContainerHeight,
  } = useVirtualList({
    allItems,
    rowHeightPx: ITEM_HEIGHT,
    itemsPerRow,
    outerContainerRef,
    buffer: 5,
  });

  useEffect(() => {
    const listContainer = document.getElementById('sliding-window-multi');
    if (listContainer) {
      // Each row has `itemsPerRow` number of children elements in this demo's DOM structure
      let count = 0;
      for (let i = 0; i < listContainer.children.length; i++) {
        count += listContainer.children[i].childElementCount;
      }
      setDomNodeCount(count);
    }
  }, [visibleRows]);

  return (
    <div className="demo-section">
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Columns</span>
          <span className="stat-value">{itemsPerRow}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">DOM Nodes Rendered</span>
          <span className="stat-value highlight">{domNodeCount}</span>
        </div>
      </div>

      <div className="container-wrapper">
        <div
          ref={outerContainerRef}
          onScroll={handleOuterContainerScroll}
          className="scroll-container"
          style={{ height: '500px', overflow: 'auto', padding: '0 12px' }}
        >
          <div style={{ height: `${innerContainerHeight}px`, position: 'relative' }}>
            <div id="sliding-window-multi" style={{ transform: `translateY(${slidingWindowTranslatePx}px)` }}>
              {visibleRows.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex', gap: '12px', height: `${ITEM_HEIGHT}px`, paddingBottom: '12px', boxSizing: 'border-box' }}>
                  {row.map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        flex: 1, 
                        backgroundColor: item.color,
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)'
                      }}
                    >
                      <div>{item.title}</div>
                      <div className="item-index">ID: {item.id}</div>
                    </div>
                  ))}
                  {/* Fill empty spaces in last row if not perfectly divisible */}
                  {Array.from({ length: itemsPerRow - row.length }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ flex: 1 }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
