import { useRef, useMemo, useEffect, useState } from 'react';
import useVirtualList from '@radhan000123/use-virtual-list';

const TOTAL_ITEMS = 100000;
const ROW_HEIGHT = 60;

export default function SingleColumnDemo() {
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [domNodeCount, setDomNodeCount] = useState(0);

  const allItems = useMemo(() => {
    return Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
      id: i,
      title: `Virtual List Item #${i + 1}`,
      description: `This is a description for item number ${i + 1}.`
    }));
  }, []);

  const {
    handleOuterContainerScroll,
    visibleRows,
    slidingWindowTranslatePx,
    innerContainerHeight,
  } = useVirtualList({
    allItems,
    rowHeightPx: ROW_HEIGHT,
    itemsPerRow: 1,
    outerContainerRef,
    buffer: 5,
  });

  useEffect(() => {
    const listContainer = document.getElementById('sliding-window-single');
    if (listContainer) {
      setDomNodeCount(listContainer.childElementCount);
    }
  }, [visibleRows]);

  return (
    <div className="demo-section">
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Total Items</span>
          <span className="stat-value">{TOTAL_ITEMS.toLocaleString()}</span>
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
          style={{ height: '500px', overflow: 'auto' }}
        >
          <div style={{ height: `${innerContainerHeight}px`, position: 'relative' }}>
            <div id="sliding-window-single" style={{ transform: `translateY(${slidingWindowTranslatePx}px)` }}>
              {visibleRows.map((row, rowIndex) => {
                const item = row[0];
                return (
                  <div key={rowIndex} className="list-item" style={{ height: `${ROW_HEIGHT}px` }}>
                    <div>
                      <strong>{item.title}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.description}</div>
                    </div>
                    <span className="item-index">Index: {item.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
