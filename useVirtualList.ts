import { RefObject, UIEventHandler, useEffect, useMemo, useState } from "react";

/**
 * @description Parameter object for configuring the virtual list.
 * @template T Type of the items to render
 * @template E Type of the HTML element used as the scrolling container
 */
interface UseVirtualListParams<T, E> {
  /** The complete list of items to render */
  allItems: T[];
  /** The height of a single row in pixels (px) */
  rowHeightPx: number;
  /** The number of items displayed per row (useful for grids) */
  itemsPerRow: number;
  /** Additional rows to render outside the visible area to prevent flickering during fast scrolling. (Default: 5) */
  buffer?: number;
  /** A React ref pointing to the external container where scrolling occurs */
  outerContainerRef: RefObject<E | null>;
}

/**
 * @description A custom hook for implementing virtualized lists in React.
 * Optimizes performance by rendering only the items currently visible in the scrollable viewport when dealing with large datasets.
 *
 * @template T Type of the items to render
 * @template E Type of the HTML element used as the scrolling container (Default: HTMLDivElement)
 *
 * @param {UseVirtualListParams<T, E>} params - Configuration parameters for the virtual list
 * @returns {object} An object containing the necessary state and functions to implement the virtual list
 * @property {UIEventHandler<E>} handleOuterContainerScroll - Handler to attach to the `onScroll` event on the outer scroll container element.
 * @property {T[][]} visibleRows - A 2D array of items that should currently be rendered on screen. Each inner array represents a single row.
 * @property {number} slidingWindowTranslatePx - The `translateY()` value in pixels to correctly offset the sliding window container.
 * @property {number} innerContainerHeight - The total calculated inner height (in px) as if all elements were fully rendered. Maintains proper scrollbar scaling.
 *
 * @example
 * // Basic Usage:
 * const MyComponent = () => {
 *   const allItems = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);
 *   const outerContainerRef = useRef<HTMLDivElement>(null);
 *
 *   const {
 *     handleOuterContainerScroll,
 *     visibleRows,
 *     slidingWindowTranslatePx,
 *     innerContainerHeight,
 *   } = useVirtualList({
 *     allItems,
 *     rowHeightPx: 50,
 *     itemsPerRow: 3,
 *     outerContainerRef,
 *   });
 *
 *   return (
 *     <div
 *       ref={outerContainerRef}
 *       onScroll={handleOuterContainerScroll}
 *       style={{ height: '500px', overflow: 'auto' }}
 *     >
 *       <div style={{ height: `${innerContainerHeight}px`, position: 'relative' }}>
 *         <div style={{ transform: `translateY(${slidingWindowTranslatePx}px)` }}>
 *           {visibleRows.map((row, rowIndex) => (
 *             <div key={rowIndex} style={{ display: 'flex', height: '50px' }}>
 *               {row.map(item => (
 *                 <div key={item} style={{ flex: 1 }}>{item}</div>
 *               ))}
 *             </div>
 *           ))}
 *         </div>
 *       </div>
 *     </div>
 *   );
 * };
 */
export default function useVirtualList<
  T,
  E extends HTMLElement = HTMLDivElement,
>({
  itemsPerRow,
  allItems,
  rowHeightPx,
  outerContainerRef,
  buffer = 5,
}: UseVirtualListParams<T, E>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleOuterContainerScroll: UIEventHandler<E> = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    const container = outerContainerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setContainerHeight(container.clientHeight);
      setContainerWidth(container.clientWidth);
    };

    // Set initial dimensions
    updateDimensions();

    // Observe container for resize events
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    // Cleanup observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [outerContainerRef]);

  const { visibleRows, slidingWindowTranslatePx, innerContainerHeight } =
    useMemo<{
      visibleRows: T[][];
      slidingWindowTranslatePx: number;
      innerContainerHeight: number;
    }>(() => {
      if (
        !containerHeight ||
        allItems.length === 0 ||
        !containerWidth ||
        itemsPerRow < 1
      ) {
        return {
          visibleRows: [],
          slidingWindowTranslatePx: 0,
          innerContainerHeight: 0,
        };
      }

      const totalRows = Math.ceil(allItems.length / itemsPerRow);
      const innerContainerHeight = totalRows * rowHeightPx;

      const newStartIndex = Math.floor(scrollTop / rowHeightPx);
      const visibleRowCount = Math.ceil(containerHeight / rowHeightPx);

      const startRowIndex = Math.max(0, newStartIndex - buffer);
      const endRowIndex = Math.min(
        totalRows,
        newStartIndex + visibleRowCount + buffer,
      );

      const startItemIndex = startRowIndex * itemsPerRow;
      const endItemIndex = endRowIndex * itemsPerRow;

      const slicedItems = allItems.slice(startItemIndex, endItemIndex);

      const groupedRows: T[][] = [];
      for (let i = 0; i < slicedItems.length; i += itemsPerRow) {
        groupedRows.push(slicedItems.slice(i, i + itemsPerRow));
      }

      return {
        visibleRows: groupedRows,
        slidingWindowTranslatePx: newStartIndex * rowHeightPx,
        innerContainerHeight,
      };
    }, [
      containerHeight,
      allItems,
      containerWidth,
      itemsPerRow,
      rowHeightPx,
      scrollTop,
      buffer,
    ]);

  return {
    handleOuterContainerScroll,
    visibleRows,
    slidingWindowTranslatePx,
    innerContainerHeight,
  };
}
