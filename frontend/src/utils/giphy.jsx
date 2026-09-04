import React from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid, SearchBar, SearchContext, SearchContextManager } from '@giphy/react-components';

const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY;
const gf = new GiphyFetch(giphyApiKey);

const GifPickerModal = ({ onSelectGif, onClose }) => {
  const { searchKey } = React.useContext(SearchContext);

  // Fetch function passed to Giphy Grid (handles trending + search)
  const fetchGifs = (offset) => {
    if (searchKey) {
      return gf.search(searchKey, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  return (
    <div className="absolute z-50 p-3 mb-2 bg-white border border-gray-200 shadow-2xl bottom-full left-4 w-80 dark:bg-gray-800 rounded-xl dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600">✕</button>
      </div>

      {/* Search Input Bar */}
      <div className="mb-3">
        <SearchBar />
      </div>

      {/* Scrollable GIF Grid */}
      <div className="h-64 overflow-y-auto rounded-lg">
        <Grid
          key={searchKey}
          fetchGifs={fetchGifs}
          width={290}
          columns={2}
          gutter={6}
          onGifClick={(gif, e) => {
            e.preventDefault();
            // Retrieve the direct image URL from selected GIF
            onSelectGif(gif.images.fixed_height.url);
          }}
        />
      </div>
    </div>
  );
};

// Wrapper with SearchContextManager to bind the SearchBar to the Grid automatically
export const GifPicker = ({ onSelectGif, onClose }) => (
  <SearchContextManager apiKey={giphyApiKey}>
    <GifPickerModal onSelectGif={onSelectGif} onClose={onClose} />
  </SearchContextManager>
);