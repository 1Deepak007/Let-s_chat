// import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';
// import { useAuth } from './AuthContext';

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const { token } = useAuth();
//   const socketRef = useRef(null);

//   useEffect(() => {
//     if (token && !socketRef.current) {
//       const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
//         auth: { token },
//         transports: ['websocket'],
//       });

//       socketInstance.on('connect', () => {
//         console.log('Socket connected');
//         setIsConnected(true);
//       });

//       socketInstance.on('disconnect', () => {
//         console.log('Socket disconnected');
//         setIsConnected(false);
//       });

//       socketInstance.on('connect_error', (error) => {
//         console.error('Socket connection error:', error);
//         setIsConnected(false);
//       });

//       socketInstance.on('onlineUsers', (users) => {
//         setOnlineUsers(users);
//       });

//       socketRef.current = socketInstance;
//       setSocket(socketInstance);
//     }

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//         setSocket(null);
//         setIsConnected(false);
//       }
//     };
//   }, [token]);

//   const joinRoom = (userId) => {
//     if (socketRef.current && userId) {
//       socketRef.current.emit('join', userId);
//     }
//   };

//   const emitTyping = (receiverId, isTyping) => {
//     if (socketRef.current) {
//       socketRef.current.emit('typing', { receiverId, isTyping });
//     }
//   };

//   const value = {
//     socket,
//     isConnected,
//     onlineUsers,
//     joinRoom,
//     emitTyping,
//     // Also expose the raw socket instance if needed
//     socketInstance: socketRef.current,
//   };

//   return (
//     <SocketContext.Provider value={value}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error('useSocket must be used within SocketProvider');
//   }
//   return context;
// };



import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (token && !socketRef.current) {
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      socketInstance.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [token]);

  const joinRoom = (userId) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('join', userId);
    }
  };

  const emitTyping = (receiverId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { receiverId, isTyping });
    }
  };

  // Correct return statement with all values
  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      joinRoom, 
      emitTyping, 
      onlineUsers 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};