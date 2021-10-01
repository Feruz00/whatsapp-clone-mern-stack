import {useCallback, useMemo} from 'react'
import { useConversation } from "../../conversation";
import {Avatar} from 'antd'
import {UserOutlined} from '@ant-design/icons'
import config from "../../config";

import {Auth} from '../../context'

const st={ marginRight: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', objectFit: 'cover' }
export default function Chatcenter(){

    const {  typing, currentConversation, selectedChat } = useConversation()
    const {user} = Auth()
    
    const setRef = useCallback(node => {
        if (node) {
          node.scrollIntoView({ smooth: true })
        }
    }, [])
    const tp = useMemo( ()=>{
      let k = typing.findIndex( i=>{
        return i.current._id === selectedChat._id;
      } )
      if(k >= 0 ) return typing[k];
      else return null;
    },[typing, selectedChat] );
    return (
      <div className="open_chat_center">
            {
            selectedChat.messages.map( (message, index)=>{
              const lastMessage = selectedChat.messages.length - 1 === index
              return (
                <div
                  ref={ (tp === null && lastMessage) ? setRef: null}
                  key={index}
                  className={`my-1 d-flex flex-column ${message.sender._id === user._id  ? 'align-self-end align-items-end' : 'align-items-start'} `}
                > 
                  <div style={{ display: 'flex' }}>
                    { message.sender._id !== user._id && 
                      ( message.sender.logo.length === 0 ? <Avatar icon={<UserOutlined/> } style={st} />:
                        <Avatar src={config+'/'+message.sender.logo} style={st} />
                      )
                    }
                    <div className={`my_boder px-2 py-1 ${message.sender._id === user._id ? 'bg-fer' : 'border'}`}> 
                      {message.text}
                    </div>
                  
                  </div>
                  {
                    message.sender._id !== user._id && currentConversation.isGroup && 
                    <div className="text-muted small"> {message.sender.username} </div>
                  }
                </div>
                )
              } )
            }
            { tp !== null &&
              tp.writers.map( (i, index)=>{
                const ls = tp.writers.length - 1 === index;
                return <div 
                  key={index}
                  ref={ ls ? setRef: null }
                  className="my-1 d-flex flex-column align-items-start" style={{color: '#aaa5a5', paddingLeft: '1rem', fontSize: '0.9rem'}} >
                  {currentConversation.isGroup ? i.username+' typing...': 'Typing...'}
                </div>
              } )
            }
      </div>
    );
}