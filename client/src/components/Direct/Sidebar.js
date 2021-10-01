
import { useState, useEffect } from 'react';
import { Button, Modal} from 'react-bootstrap'
import axios from 'axios'
import config from '../../config';
import { useConversation } from '../../conversation';
import Conversations from './Conversation'
import ConversationModal from './newConversationModal'
import {Spin} from 'antd'

export default function Sidebar(){
    const [show, setShow] = useState(false)
    const [change, setChange] = useState(false)
    
    const {setConversations, conversations, setChat, loading, setLoading} = useConversation()

    useEffect( ()=>{
        setLoading(true)
        axios( {
            method: "GET",
            withCredentials: true,
            url: config + '/api/conversations/mylist'
        } ).then( res=>{
              const { conversation, message } = res.data;
            //   console.log("conversation:", conversation, "\nmessages:", message);
              setConversations( conversation )
              setChat(message)
    
        } ).catch(err=>{
              alert( "Cannot upload conversation list!" )
        })
        setLoading(false)
    }, [change] )

    return (
        <>
        <div className="sidebar" >
            <div className="sidebar_list">
                { loading && conversations.length === 0 ? 
                    <Spin size="large" style={{ color: "black", marginTop: '3rem', marginLeft: '2rem' }} />: 
                    <Conversations />
                }

            </div>
            <Button className="rounded-0 conversation_button" onClick={()=>setShow(true)}> Send Message </Button>           
        </div>
        <Modal show={show} onHide={ ()=>setShow(false) } > 
            <ConversationModal setShow={setShow} setChange = {setChange} filter={[]} />
        </Modal> 
        </>
    );
}