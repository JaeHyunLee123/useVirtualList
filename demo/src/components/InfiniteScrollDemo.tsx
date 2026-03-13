import { useRef, useEffect, useState } from 'react';
import type { UIEventHandler } from 'react';
import useVirtualList from '@radhan000123/use-virtual-list';

interface Item {
  id: number;
  title: string;
  description: string;
}

const ROW_HEIGHT = 70;

export default function InfiniteScrollDemo() {
  const outerContainerRef = useRef<HTMLDivElement>(null);
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Initial Fetch & Fetch More logic
  const loadMoreItems = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/items?offset=${offset}&limit=20`);
      const data = await response.json();
      
      setItems(prev => [...prev, ...data.items]);
      setOffset(data.nextOffset);
      
      if (data.items.length === 0 || data.nextOffset >= data.totalCount) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load items', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoreItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const {
    handleOuterContainerScroll,
    visibleRows,
    slidingWindowTranslatePx,
    innerContainerHeight,
  } = useVirtualList({
    allItems: items,
    rowHeightPx: ROW_HEIGHT,
    itemsPerRow: 1,
    outerContainerRef,
    buffer: 3,
  });

  // Combined scroll handler to compute bottom reach + virtual scroll updates
  const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
    // 1. Update virtual list internal state
    handleOuterContainerScroll(e);

    // 2. Check if we reached the bottom for infinite loading
    const target = e.currentTarget;
    const threshold = 150; // pixels from bottom to trigger fetch
    const bottomHit = target.scrollHeight - target.scrollTop - target.clientHeight < threshold;
    
    if (bottomHit) {
      loadMoreItems();
    }
  };

  return (
    <div className="demo-section">
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Fetched Items</span>
          <span className="stat-value">{items.length} / 1000</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Status</span>
          <span className={`stat-value ${loading ? 'highlight' : ''}`}>
            {loading ? 'Fetching...' : hasMore ? 'Scroll down' : 'All loaded'}
          </span>
        </div>
      </div>

      <div className="container-wrapper">
        <div
          ref={outerContainerRef}
          onScroll={handleScroll}
          className="scroll-container"
          style={{ height: '500px', overflow: 'auto' }}
        >
          <div style={{ height: `${innerContainerHeight}px`, position: 'relative' }}>
            <div style={{ transform: `translateY(${slidingWindowTranslatePx}px)` }}>
              {visibleRows.map((row) => {
                const item = row[0];
                return (
                  <div key={item.id} className="list-item" style={{ height: `${ROW_HEIGHT}px` }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: '#38bdf8', color: '#0f172a', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', marginRight: '16px'
                      }}>
                        {item.id}
                      </div>
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {loading && (
            <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
              Loading more from MSW...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
