import {Input, Button } from 'antd'
import { useConversation } from "../../conversation";
import { SendOutlined } from '@ant-design/icons'
import {Auth} from '../../context'
import {useState, useEffect} from 'react'
import {useSocket} from '../../socket'

export default function Bottom(){
    const [text, setText] = useState('')
    const [ok, setok] = useState(false)
    const {sendMessage, currentConversation} = useConversation()
    const {user} = Auth()
    const socket = useSocket()
    useEffect( ()=>{
      if(text.length > 0 && !ok ) {
        socket.emit('send-typing', {currentConversation, user })
        setok(true)
      }
      if(text.length === 0 && ok){
        socket.emit('stop-typing', {currentConversation, user})
        setok(false)
      }
    },[text] )

    function handleSubmit() {
      if(text.length === 0) return;  
      const {recipients, ...other} = currentConversation;
        sendMessage(
            currentConversation.recipients.map(r => r._id),
            {recipients: [...recipients,user], ...other},
          text
        )
        setok(false)
        socket.emit('stop-typing', {currentConversation, user})
        setText('')
    }

    return (<div className="open_bottom">
          <Input placeholder="Write message" 
            value={text}  
            onChange={ (e) => setText(e.target.value) } 
            onKeyPress={ (e)=>{
              
              if(e.key === "Enter"){
                handleSubmit()
              }
            }}
            
          />
        
        <Button type="primary" onClick={handleSubmit} > <SendOutlined/> </Button>
    </div>)
}