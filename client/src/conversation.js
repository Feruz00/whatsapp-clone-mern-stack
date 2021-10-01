import React, {useContext, useEffect, useState, useMemo} from 'react'

import axios from 'axios'
import config from './config'

import {useSocket} from './socket'

import {Auth} from './context'

const ConversationsContext = React.createContext()

export function useConversation(){
    return useContext(ConversationsContext)
}

export default function ConversationProvider( {children} ){
    
    const socket = useSocket()
    const [conversations, setConversations] = useState([])
    const [currentConversation, setCurrentConversation] = useState(null)
    const [chat, setChat] = useState([])
    const [typing, setTyping] = useState([])
    const [loading, setLoading] = useState(false)
    const {user} = Auth()

    useEffect( ()=>{
      if(user === null) return;
      setLoading(true)
      axios( {
        method: "GET",
        withCredentials: true,
        url: config + '/api/conversations/mylist'
      } ).then( res=>{
          const { conversation, message } = res.data;
          setConversations( conversation )
          setChat(message)

      } ).catch(err=>{
          alert( "Cannot upload conversation list!" )
      })
      setLoading(false)
    },[] )

    const formatted = useMemo ( ()=>{
      console.log("formatedde")
      return conversations.map( i=>{
        const { recipients, groupName, ...other } = i;
        const all = recipients.filter( t=>{
            return t._id !== user._id
        })
        const logos = all
        let l = [], name = ""

        l.push( logos[0].logo )
        name = logos[0].username

        if( i.isGroup ){
            if(logos.length > 1){
              l.push(logos[1].logo)
              name +=','+ logos[1].username
            }

            if( l.length === 1 ){ 
              l.push('') 
              name+=",..."
            }
            if( groupName.length > 0 ) name = groupName
            else name = name.substr(0,15) + ( name.length > 15 ? "..." : "" )
        }
        const isAdmin = i.admins.includes(user._id)

        return {...other, recipients: all, name, groupName, logo: l, isAdmin  }
    } ) 
  }, [conversations, setConversations])

    const count = useMemo( ()=>{
      let aa = []
      chat.forEach( p=>{
        const {_id, messages} = p;
        let ok = false;
        for (let i = messages.length - 1; i >=0 ; i--) {
          const {readers, sender} = messages[i]
          if(sender._id === user._id) break
          if( readers.findIndex( l=>{ return l === user._id } ) === -1 ){
            ok = true;
            break
          }
        }
        if(ok) {
          aa.push(_id)
        }
      } )
      return aa
    }, [chat] )

    const addMessageToConversation =  ( { current, sender, text, readers}) => {
      let c = count.findIndex( i=>{return i === current._id})
      let ok = false;
      setChat( prev=>{
        const nw = prev.map( (i)=>{
          if(i._id !== current._id) return i;
          else{
            if(c!== -1) readers.push(user._id)
            const {messages, ...other} = i;
            ok = true
            return { messages: [...messages, {sender, text, readers}], ...other }
          }
        } )
        if( ok ) return nw;
        else {
          if( c !== -1 ) readers.push(user._id)
          return [...prev, {_id: current._id, messages: [{sender, text, readers}] }]
        }
      } )
      if(!ok)  setConversations( prev=>{return [...prev, current]} )

    }
    useEffect(() => {
        if (socket == null) return
        

        socket.off('receive-message').on('receive-message', addMessageToConversation)
        
        socket.off('group-add').on('group-add', ({geldim})=>{
          setChat( prev => {
            return [...prev, {_id: geldim._id, messages: []}]
          } )
          setConversations( prev=> {
            return [...prev, geldim]
          } )
        })
        socket.off('somebody-added').on('somebody-added', ({geldim})=>{
          
          setConversations( prev=> {
            return prev.map(i=>{
              if(i._id !== geldim._id) return i;
              else return geldim;
            })
          } )
        })
        
        socket.off('leave-somebody').on('leave-somebody', ({cr, fer})=>{
          setConversations( prev=> {
            return prev.map( i=>{
              if(i._id !== cr._id) return i;
              else {
                const {recipients, admins, ...other} = i;
                const nw = recipients.filter( k=> {return k._id !== fer._id})
                const a = admins.filter( k=> {return k !== fer._id})
                return {...other, recipients: nw, admins: a }
              }
            } )
          } )
        })

        socket.off("iamdeleted").on('iamdeleted', ({cr})=>{
       
          setCurrentConversation(prev=>{
            if( prev === null ) return null;
            else if( prev._id === cr._id) return null;
            else return prev; 
          })
          
          setConversations(prev=>{
            return prev.filter( i=>{ return i._id !== cr._id} )
          })
        })

        socket.off('somebodydeleted').on('somebodydeleted', ({cr, current})=>{
          setConversations(prev=>{
            return prev.map( i=>{
              if(i._id !== cr._id) return i;
              else{
                const {recipients, admins, ...other} = i;
                const nw = recipients.filter( t=>{ return t._id !== current } )
                const a = admins.filter( t=> {return t !== current} )
                return {recipients: nw, ...other, admins: a}
              }
            } )
          })
        })
        
        socket.off("adminout").on("adminout", ({cr, current})=>{
          setConversations(prev=>{
            return prev.map( i=>{
              if(i._id !== cr._id) return i;
              else {
                const {admins, ...other} = i;
                return {admins: admins.filter(t=>{return t !== current}), ...other }
              }
            } )
          })
        })
        socket.off("adminin").on("adminin", ({cr, current})=>{
          setConversations(prev=>{
            return prev.map( i=>{
              if(i._id !== cr._id) return i;
              else {
                const {admins, ...other} = i;
                return {admins: [...admins, current], ...other }
              }
            } )
        })
      })
        socket.off('groupname').on('groupname', ({cr, name})=>{
          setConversations(prev=>{
            return prev.map( i=>{
              if(i._id!==cr._id) return i;
              else{
                const {groupName, ...other} = i;
                return {groupName: name, ...other};
              }
            } )
          })
        })
        socket.off("users").on("users", ({baza})=>{
          const k = baza.map(i=>{
            const {username, online} = i;

            return {username, online};
          })
        })

        socket.off('get-typing').on('get-typing', ({current, writer})=>{
          
          setTyping( prev=>{
            let ok = false;
            const nw = prev.map( i=>{
              if( i.current._id === current._id ){
                ok = true;
                return {current, writers: [...i.writers, writer]}
              }
              else return i;
            } )
            if(ok) return nw;
            else return [...prev, {current, writers: [writer]}]
          })
        })
        
        socket.off('dur-typing').on('dur-typing', ({current, writer})=>{
          
          setTyping( prev=>{
            const nw = prev.map( i=>{
              if( i.current._id === current._id ){
                const wr =  i.writers.filter( t =>{
                  return t._id !== writer._id
                } ) ;

                return {current, writers: wr }
              }
              else return i;
            } ).filter( i=>{
              return i.writers.length > 0
            } )
            return nw;
          })
        })

    }, [socket])

    const t_cur = useMemo( ()=>{
      if( currentConversation === null ) return null;
      else  return formatted[formatted.findIndex( t => {
        return ( t._id === currentConversation._id );
      } )]
    }, [formatted,currentConversation] )
    

    function sendMessage(recipients,  current,  text) {
        socket.emit('send-message', { recipients, sender: user, current, text }, ({err})=>{
          if(err) alert(" Cannot send message! ")
        });
        addMessageToConversation({ current,  sender:user , text,  readers:[] })
    }
    
    
    useEffect( ()=>{
      if( t_cur === null ) return;
      
      let c = count.findIndex( i=>{return i === currentConversation._id})
      if(c===-1) return;
      
      socket.emit('read-message', {currentConversation: t_cur}, ({err})=>{
        if(err) alert('Cannot read message')
      });

      let k = chat.findIndex( i=>{return i._id === currentConversation._id} )

      setChat( prev=>{
        return prev.map( (i,index)=>{
          if(index !== k) return i;
          else{
            const {messages, ...other} = i;
            const arr = messages.map( i=>{
              let {sender, text, readers, ...fer} = i;
              
              if( sender._id !== user._id ){
                if( readers.findIndex( i=>{return i === user._id} ) === -1 ) readers.push(user._id)
              }
              
              return {sender, text, readers, ...fer}
            }); 
            return {messages: arr, ...other}
          }
        } )
        } )
      
    }, [currentConversation, chat] )

    const selectedChat = useMemo( ()=>{
      if(t_cur === null) return []
      return chat[chat.findIndex( t => {
        return ( t._id === t_cur._id );
      } )]
    },[t_cur, chat] )

    const ero = useMemo( ()=>{return chat}, [chat] )

    const value = {
        selectedChat,
        setConversations,
        conversations: formatted,
        setCurrentConversation,
        currentConversation: t_cur,
        sendMessage,
        typing,
        count,
        chat: ero,
        setChat,
        loading,
        setLoading
    }

    return (
        <ConversationsContext.Provider value={value}>
            { children }
        </ConversationsContext.Provider>
    )

}