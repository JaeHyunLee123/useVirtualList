import { useState } from 'react';
import SingleColumnDemo from './components/SingleColumnDemo';
import MultiColumnDemo from './components/MultiColumnDemo';
import InfiniteScrollDemo from './components/InfiniteScrollDemo';
import './index.css';

type DemoType = 'single' | 'multi' | 'infinite';

function App() {
  const [activeTab, setActiveTab] = useState<DemoType>('single');

  return (
    <>
      <div className="demo-header">
        <h1>useVirtualList Interactive Demo</h1>
        <p>Explore different use cases and rendering optimizations</p>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single Column (100k)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'multi' ? 'active' : ''}`}
          onClick={() => setActiveTab('multi')}
        >
          Responsive Multi-Column
        </button>
        <button 
          className={`tab-btn ${activeTab === 'infinite' ? 'active' : ''}`}
          onClick={() => setActiveTab('infinite')}
        >
          Infinite Scroll (MSW)
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'single' && <SingleColumnDemo />}
        {activeTab === 'multi' && <MultiColumnDemo />}
        {activeTab === 'infinite' && <InfiniteScrollDemo />}
      </div>
    </>
  );
}

export default App;
