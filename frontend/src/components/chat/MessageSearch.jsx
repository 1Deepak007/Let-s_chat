import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const MessageSearch = ({ messages, onSelectMessage }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      const filtered = messages.filter(msg =>
        msg.content.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <FiSearch className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search messages..."
          className="input-field pl-10 pr-8 py-1.5 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg top-full max-h-48">
          {results.map((msg) => (
            <button
              key={msg._id}
              onClick={() => {
                onSelectMessage(msg);
                setShowResults(false);
              }}
              className="w-full px-4 py-2 text-sm text-left border-b hover:bg-gray-50 last:border-0"
            >
              <p className="font-medium text-gray-700">{msg.content}</p>
              <p className="text-xs text-gray-400">
                {new Date(msg.timestamp).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;