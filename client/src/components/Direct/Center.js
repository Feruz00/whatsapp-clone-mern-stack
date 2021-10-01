import { useConversation } from "../../conversation";
import {Auth} from '../../context'
import { useState, useEffect } from "react";
import {Modal} from 'react-bootstrap'
import {Input, Button, Avatar, Spin} from 'antd'
import ConversationModal from './newConversationModal'
import {UserOutlined} from '@ant-design/icons'
import config from "../../config";

import { useSocket } from '../../socket';
import axios from "axios";

export default function Center(){
    const st={ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', objectFit: 'cover' }
    
    const { setCurrentConversation, currentConversation,setConversations, setChat, } = useConversation()
    const [name, setName] = useState('')
    const [current, setCurrent] = useState('')
    const {user} = Auth()
    const [cloading, setcLoading] = useState(false)
    const [dloading, setdLoading] = useState(false)
    const [ac, setAc] = useState(false)
    
    const [show, setShow] = useState(false)
    
    const socket = useSocket()


    useEffect( ()=>{
        setName(currentConversation.groupName)
        setCurrent('')
        setAc(false)
        setcLoading(false)
    },[currentConversation] )

    const leaveGroup = ()=>{
        socket.emit('leave-group', {currentConversation, user}, ({err})=>{
            if( err ) alert("errr boldy");
            else{
                setCurrentConversation(null)
                setConversations( prev=>{
                    return prev.filter(i=>{
                        return i._id !== currentConversation._id
                    })
                } )
            }
        } )
    }
    
    const handleChange = () => {
        socket.emit('handleChange', {currentConversation, name}, ({err})=>{
          if(err) alert("handleChange name error")
          else{
            setConversations(prev=>{
              return prev.map( i=>{
                if(i._id!==currentConversation._id) return i;
                else{
                  const {groupName, ...other} = i;
                  return {groupName: name, ...other};
                }
              } )
            })
          }
        })
      }
    const deleteUser = () => {
        setdLoading(true)
        socket.emit('deleteUser', { currentConversation, current }, ({err})=>{
          if(err) alert("User cannot deleted")
          else { 
            setdLoading(false); 
            setAc(false) 
            setConversations( prev=>{
                return prev.map(i=>{
                    if(i._id !== currentConversation._id) return i;
                    else{
                        const {recipients, ...other} = i;
                        return {recipients: recipients.filter( t=>{return t._id !== current} ), ...other}
                    }
                })
            } )
        }
        } )
      }
      const changeUser = ()=>{
        setdLoading(true)
        socket.emit( 'changeUser', {currentConversation, current}, ({err, ans})=>{
          if(err) alert("User cannot change status")
          else {
            setdLoading(false)
            setConversations(prev=>{
              return prev.map( i=>{
                if(i._id !== currentConversation._id) return i;
                else {
                  const {admins, ...other} = i;
                  let k = []
                  if( ans ) k = admins.filter(t=>{return t !== current})
                  else k = [...admins, current ]
                  return {admins: k, ...other};
                }
              } )
            })
            setAc(false)
          }
        })
      }
      
    
    async function deleteChat(){
        await axios({
            method: "POST",
            url: config+'/api/conversations/deleteChat',
            withCredentials: true,
            data:{
                currentConversation
            }
        }).then( ()=>{
            const id = currentConversation._id
            setCurrentConversation(null)
            setConversations( prev=>{
                return prev.filter( i=>{
                    return i._id !== id
                } )
            } )
            setChat( prev=>{
                return prev.filter( i=>{
                    return i._id !== id
                } )
            } )
            
        }).catch(()=>{
            alert("error delete chat")
        })
    }

    return (<div className="open_info_center">
        { currentConversation.isGroup && 
            ( currentConversation.isAdmin ? 
                <div className="open_item open_first_line">
                
                <Input type="text" 
                    value={name} 
                    placeholder="Change your group name" 
                    onChange={(e)=>setName(e.target.value)} 
                />
                
                <Button 
                    onClick={handleChange } 
                    className="rounded-0" disabled={cloading} > 
                        Change {cloading && '...'}  
                </Button> 
                </div> :
                <div className="open_item open_first_line">
                    <h6 style = {{ fontSize: '0.9rem' }} > {currentConversation.name} </h6>
                </div>
            )
        }
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center"
        }}>
            <h6
                style={{
                    color: "#007bff"
                }}
            > Users </h6>
            {currentConversation.isGroup && currentConversation.isAdmin &&
            <h6 
                onClick={()=>setShow(true)} 
                style={{
                    color: "#007bff",
                    cursor: 'pointer'
                }}
            > Add Users </h6>}
        </div>

        <div className="open_item open_show_users">
            {
                currentConversation.recipients.map( (i,index)=>(
                    <div className="open_all_users" key={index}>
                        <div className="open_user_place" >
                            {
                                i.logo.length === 0 ?
                                <Avatar size="large" icon={<UserOutlined/> } style={st} /> : 
                                <Avatar size="large" src={config + '/' + i.logo} style={st} />
                            }
                            <Button type="link" href={`/user/${i.username}`} > {i.username} </Button>
                        </div>
                        {currentConversation.isGroup && currentConversation.isAdmin &&
                            <hr className="hr ucnokat" 
                                onClick={ ()=>{ 
                                        setCurrent(i._id);
                                        setAc(true)
                                    } 
                                } />
                        }
                    </div>
                ) )
            }
        </div>
        <div className="open_item">
            <h5 
            onClick={deleteChat}>
                Delete Chat
            </h5>
            {currentConversation.isGroup && 
                <h5 
                    onClick={leaveGroup}
                > Leave group </h5>}
        </div>
        
            <Modal show={show} onHide={ ()=>setShow(false) } > 
                <ConversationModal 
                    setShow={setShow} 
                    filter={currentConversation.recipients}
                />
            </Modal>
        
            <Modal show={ac} onHide={ ()=>setAc(false) } > 
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body className="used_admin">
                <h6 
                    onClick={ changeUser  }
                >{currentConversation.admins.includes(current) ? 'Clear admin users list' : 'Add to admin users list'}</h6>
                <h6 
                    onClick={ deleteUser }
                > Delete User </h6>
                { dloading && <Spin size="small" /> } 
            </Modal.Body>
        </Modal>
        
    </div>)
}