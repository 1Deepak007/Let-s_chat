import React, { useEffect, useRef, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const MessageSearch = ({ messages = [], onSelectMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      const filtered = messages.filter((msg) =>
        msg?.content?.toLowerCase().includes(value.trim().toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectResult = (messageId) => {
    // Close search first
    closeSearch();
    // Then scroll to message
    if (onSelectMessage) {
      onSelectMessage(messageId);
    }
  };

  const closeSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchContainer = document.getElementById('message-search-container');
      if (searchContainer && !searchContainer.contains(event.target)) {
        if (!query.trim()) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  return (
    <div id="message-search-container" className="relative flex-1 min-w-0 sm:flex-none">
      {/* Search Results Dropdown */}
      {isOpen && query.trim() && results.length > 0 && (
        <div className="absolute right-0 z-50 w-[min(20rem,calc(100vw-2rem))] mt-2 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700 top-full max-h-64">
          <div className="sticky top-0 px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600">
            {results.length} message{results.length > 1 ? 's' : ''} found
          </div>
          {results.map((msg) => (
            <button
              type="button"
              key={msg._id || msg.id}
              onClick={() => handleSelectResult(msg._id || msg.id)}
              className="w-full px-3 py-2 text-left transition-colors border-b border-gray-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 last:border-0"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate dark:text-gray-200">
                    {msg.content || '[Media]'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {msg.isEdited && (
                      <span className="text-[10px] text-gray-400">(edited)</span>
                    )}
                    {msg.sender && (
                      <span className="text-[10px] text-gray-400">
                        from {typeof msg.sender === 'object' ? msg.sender?.firstname : 'User'}
                      </span>
                    )}
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs text-primary-500">↗</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute right-0 z-50 w-[min(16rem,calc(100vw-2rem))] mt-2 bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700 top-full">
          <div className="px-3 py-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">No messages found</p>
            <p className="mt-1 text-[10px] text-gray-400">Try different keywords</p>
          </div>
        </div>
      )}

      {/* Search Toggle / Input */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-500 transition rounded-lg hover:bg-gray-100 hover:text-primary-500 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Search messages"
        >
          <FiSearch className="w-5 h-5" />
        </button>
      ) : (
        <div className="relative">
          <FiSearch className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search messages..."
            className="w-full min-w-0 py-2 pl-9 pr-8 text-xs bg-gray-100 border border-gray-200 rounded-lg sm:w-56 sm:py-1.5 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={closeSearch}
            className="absolute text-gray-400 -translate-y-1/2 right-2.5 top-1/2 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close message search"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageSearch;



// import React, { useEffect, useRef, useState } from 'react';
// import { FiSearch, FiX } from 'react-icons/fi';

// const MessageSearch = ({ messages = [], onSelectMessage }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState([]);
//   const inputRef = useRef(null);

//   const handleSearch = (e) => {
//     const value = e.target.value;
//     setQuery(value);

//     if (value.trim()) {
//       const filtered = messages.filter((msg) =>
//         msg?.content?.toLowerCase().includes(value.trim().toLowerCase())
//       );
//       setResults(filtered);
//     } else {
//       setResults([]);
//       setIsOpen(false);
//     }
//   };

//   const closeSearch = () => {
//     setQuery('');
//     setResults([]);
//     setIsOpen(false);
//   };

//   useEffect(() => {
//     if (isOpen) inputRef.current?.focus();
//   }, [isOpen]);

//   return (
//     <div className="relative flex-1 min-w-0 sm:flex-none">
//       {isOpen && query.trim() && (
//         <div className="absolute right-0 z-50 w-[min(16rem,calc(100vw-2rem))] mt-2 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700 top-full max-h-56">
//           {results.length > 0 ? results.map((msg) => (
//             <button
//               type="button"
//               key={msg._id || msg.id}
//               onClick={() => {
//                 onSelectMessage(msg._id || msg.id);
//                 closeSearch();
//               }}
//               className="w-full px-3 py-2 text-xs text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 last:border-0"
//             >
//               <p className="font-medium text-gray-800 truncate dark:text-gray-200">{msg.content || '[Media]'}</p>
//               <p className="text-[10px] text-gray-400">
//                 {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </p>
//             </button>
//           )) : (
//             <p className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">No messages found</p>
//           )}
//         </div>
//       )}


//       {!isOpen ? (
//         <button
//           type="button"
//           onClick={() => setIsOpen(true)}
//           className="p-2 text-gray-500 transition rounded-lg hover:bg-gray-100 hover:text-primary-500 dark:text-gray-300 dark:hover:bg-gray-800"
//           aria-label="Search messages"
//         >
//           <FiSearch className="w-5 h-5" />
//         </button>
//       ) : (
//         <div className="relative">
//           <FiSearch className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
//           <input
//             ref={inputRef}
//             type="text"
//             value={query}
//             onChange={handleSearch}
//             placeholder="Search messages..."
//             className="w-full min-w-0 py-2 pl-9 pr-8 text-xs bg-gray-100 border border-gray-200 rounded-lg sm:w-48 sm:py-1.5 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
//           />
//           <button
//             type="button"
//             onClick={closeSearch}
//             className="absolute text-gray-400 -translate-y-1/2 right-2.5 top-1/2 hover:text-gray-600 dark:hover:text-gray-200"
//             aria-label="Close message search"
//           >
//             <FiX className="w-4 h-4" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessageSearch;