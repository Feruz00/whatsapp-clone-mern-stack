import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import {Auth} from './context';

const SocketContext = React.createContext()

export function useSocket() {
  return useContext(SocketContext)
}

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState()
  const {user} = Auth()
  let id = null;
  if( user!==null ) id = user._id;
  useEffect(() => {
    if(id===null) return;
    const newSocket = io(
      'http://localhost:3001',
      { query: { id } }
    )
    setSocket(newSocket)

    return () => newSocket.close()
  }, [id])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
