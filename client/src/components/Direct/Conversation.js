import config from '../../config'
import {Avatar} from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useConversation } from '../../conversation'
import { useCallback } from 'react'

function UserAvatar({logo, isGroup}){
    const sz = isGroup ? 'default': 'large';

    const st={ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', objectFit: 'cover' }
    
    return <div className="photo_section"> <Avatar.Group>
        { logo.map( (i,index)=>{
            if(i.length === 0) return <Avatar icon={ <UserOutlined/> } size={sz} style={st} key={index} />
            else return <Avatar src={config+'/'+i} size={sz} style={st} key={index}  />
        } ) }
    </Avatar.Group> </div>

}

export default function Conversations(){
    
    const {typing,chat, count, conversations,currentConversation, setCurrentConversation} = useConversation()
    
    const currentMessage = (id)=>{
        const ind = typing.findIndex( i=>{return i.current._id === id} ) >= 0
        
        if(ind) return <p> Typing... </p>
        const num = chat.findIndex( i=>{return i._id === id } )
        if(num === -1) return <p></p>
        const m = chat[num].messages
        if(m.length === 0) return  <p></p>
        let p = m[m.length-1].text
        if(p.length > 15) p = p.substr(0,15)+'...'
        let ok = count.findIndex( i=>{return i === id} ) >= 0
        if( ok ) return <b style={{color: 'black'}}> {p} </b>
        else return <p>{p}</p>
    }
    
    const okCount = useCallback( (id)=>{
        return count.findIndex( i=>{return i === id} ) >= 0   
    },[count])

    return (
        <>
            {
                conversations.length === 0 ? <div> You dont have any chat! </div>:
                conversations.map( (i)=>(
                    <div 
                        key={i._id} 
                        
                        onClick = { ()=>{ 
                            setCurrentConversation(i)
                            }
                        }
                        
                        className={"message_item " + (currentConversation!==null && i._id === currentConversation._id ? " _color ": "") }
                        
                    >
                        <UserAvatar logo={i.logo} isGroup={i.isGroup} />
                        <div className="message_section">
                            <div className="message_name">
                                <h6 className="_chat_user_name" > {i.name} </h6>
                            </div>
                            <div className="message_text">
                                <div className="text_mes">
                                    {
                                        currentMessage(i._id) 
                                    }
                                    
                                </div>
                                {
                                    okCount(i._id) && <div className="message_time"> </div>
                                }
                                
                            </div> 

                        </div>

                    </div>)

                )
            }  
        </>
    )
}