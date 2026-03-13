# @radhan000123/use-virtual-list

A high-performance React hook for rendering virtual lists. It renders only the items currently visible in the DOM (plus a small buffer), making it highly efficient for rendering massive lists or grids.

## Website
- [npm](https://www.npmjs.com/package/@radhan000123/use-virtual-list)
- [github](https://github.com/JaeHyunLee123/useVirtualList)

## Installation

```bash
npm install @radhan000123/use-virtual-list
```

## Features
- **High Performance:** Renders only visible items.
- **Buffer Support:** Configurable buffer size to prevent flickering during fast scrolling.
- **Grid Setup:** Easily supports multiple items per row (`itemsPerRow`).
- **TypeScript:** Written in TypeScript with full type definitions.

---

## Usage

Explore different use cases for implementing the virtual list hook.

### 1. Single Column (Basic)
The most common use case for rendering a simple, single-column vertical list.

```tsx
import React, { useRef, useMemo } from 'react';
import useVirtualList from '@radhan000123/use-virtual-list';

const SingleColumnList = () => {
  const allItems = useMemo(() => Array.from({ length: 100000 }, (_, i) => `Item ${i + 1}`), []);
  const outerContainerRef = useRef<HTMLDivElement>(null);

  const {
    handleOuterContainerScroll,
    visibleRows,
    slidingWindowTranslatePx,
    innerContainerHeight,
  } = useVirtualList({
    allItems,
    rowHeightPx: 50,
    itemsPerRow: 1, // Rendering 1 item per row
    outerContainerRef,
    buffer: 5,
  });

  return (
    <div
      ref={outerContainerRef}
      onScroll={handleOuterContainerScroll}
      style={{ height: '500px', overflow: 'auto' }}
    >
      <div style={{ height: `${innerContainerHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${slidingWindowTranslatePx}px)` }}>
          {visibleRows.map((row, rowIndex) => (
            <div key={rowIndex} style={{ height: '50px' }}>
              {/* row[0] contains our single item */}
              {row[0]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 2. Responsive Multi-Column (Grid)
Calculate and pass the `itemsPerRow` dynamically by observing your container's width. Great for masonry or grid layouts.

```tsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import useVirtualList from '@radhan000123/use-virtual-list';

const MultiColumnGrid = () => {
  const allItems = useMemo(() => Array.from({ length: 10000 }, (_, i) => ({ id: i, label: `Card ${i}` })), []);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  
  const [itemsPerRow, setItemsPerRow] = useState(1);
  const MIN_COL_WIDTH = 200;

  // Dynamically calculate columns based on container width
  useEffect(() => {
    if (!outerContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setItemsPerRow(Math.max(1, Math.floor(width / MIN_COL_WIDTH)));
    });
    observer.observe(outerContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const {
    handleOuterContainerScroll,
    visibleRows,
    slidingWindowTranslatePx,
    innerContainerHeight,
  } = useVirtualList({
    allItems,
    rowHeightPx: 150, // Height of the grid row
    itemsPerRow,
    outerContainerRef,
    buffer: 3,
  });

  return (
    <div ref={outerContainerRef} onScroll={handleOuterContainerScroll} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${innerContainerHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${slidingWindowTranslatePx}px)` }}>
          {visibleRows.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex', gap: '8px', height: '150px' }}>
              {row.map(item => (
                <div key={item.id} style={{ flex: 1, background: '#eee' }}>
                  {item.label}
                </div>
              ))}
              {/* Fill empty grid spaces if the last row is incomplete */}
              {Array.from({ length: itemsPerRow - row.length }).map((_, i) => (
                <div key={`empty-${i}`} style={{ flex: 1 }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 3. With Infinite Scroll (API Fetching)
Combine the virtual window scroll handling with your own infinite loading logic when reaching the bottom of the scroll container.

```tsx
import React, { useRef, useState, useEffect } from 'react';
import type { UIEventHandler } from 'react';
import useVirtualList from '@radhan000123/use-virtual-list';

const InfiniteScrollList = () => {
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);

  // Example API fetch simulator
  const fetchMoreData = async () => {
    const res = await fetch(`/api/items?offset=${offset}&limit=20`);
    const data = await res.json();
    setItems(prev => [...prev, ...data.items]);
    setOffset(data.nextOffset);
  };

  useEffect(() => { fetchMoreData(); }, []);

  const {
    handleOuterContainerScroll,
    visibleRows,
    slidingWindowTranslatePx,
    innerContainerHeight,
  } = useVirtualList({
    allItems: items,
    rowHeightPx: 70,
    itemsPerRow: 1,
    outerContainerRef,
    buffer: 3,
  });

  // Intercept the onScroll event to detect bottom reach
  const onScroll: UIEventHandler<HTMLDivElement> = (e) => {
    // 1. Maintain virtual list position updates
    handleOuterContainerScroll(e);

    // 2. Fetch more when hitting the bottom threshold
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 150) {
      // Trigger fetch only if not currently loading
      fetchMoreData();
    }
  };

  return (
    <div ref={outerContainerRef} onScroll={onScroll} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: `${innerContainerHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${slidingWindowTranslatePx}px)` }}>
          {visibleRows.map((row) => (
            <div key={row[0].id} style={{ height: '70px', borderBottom: '1px solid #ccc' }}>
              {row[0].title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## API

### `useVirtualList(params)`

#### Parameters
- `allItems` (T[]): Array of total items to render.
- `rowHeightPx` (number): Height of each row in pixels.
- `itemsPerRow` (number): Number of items in each row (useful for grids).
- `outerContainerRef` (RefObject<HTMLElement>): A React ref attached to the scrolling container element.
- `buffer` (number, optional): Number of extra rows to render above and below the visible area to prevent flickering. Default is `5`.

#### Returns
- `handleOuterContainerScroll` (UIEventHandler): Event handler to attach to the `onScroll` event of the outer container.
- `visibleRows` (T[][]): 2D array of items to render in the current viewport. 
- `slidingWindowTranslatePx` (number): The pixel value for `translateY` to properly adjust the position.
- `innerContainerHeight` (number): Dynamic total height of the inner container to maintain appropriate scroll bounds.

## License

MIT
