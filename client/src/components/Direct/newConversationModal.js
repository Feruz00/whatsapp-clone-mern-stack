import {Modal, Form, Button} from 'react-bootstrap'
import {useState, useEffect} from 'react'
import { useConversation } from '../../conversation'
import config from '../../config';
import axios from 'axios'
import {Auth} from '../../context'
import {Spin} from 'antd'
import { useSocket } from '../../socket';

export default function ConversationModal({setShow,  filter}){
    
    const {user} = Auth()
    const [loading, setLoading] = useState(true)
    
    const socket = useSocket()

    const [contacts, setContacts] = useState([])
    const [selectedContacts, setSelectedContacts] = useState([])

    const { setCurrentConversation,setConversations, setChat, currentConversation } = useConversation()

    const [ hloading, sethLoading ] = useState(false) 

    async function forcreate(){
        await axios({
            method: "POST",
            data:{
                recipients: selectedContacts,
                admin: user._id
            },
            withCredentials: true,
            url: config + '/api/conversations/findOrCreate'
        }).then( res=>{
            const {ans, qty} = res.data;
            // console.log(ans, qty)
            if(!qty){
                setChat( prev => { return [ { _id: ans._id, messages: [] } , ...prev ]  } )
                setConversations( prev => { return [ ans , ...prev ] } )
            
            }
            
            setCurrentConversation( ans )
            setShow(false)

        } ).catch( err=>{
            // console.log("forcreate err: ",err);
            alert('Something wrong went! Try again!')
        } ).finally( ()=>{
            sethLoading(false)
        } )
    } 
    
    
    function foradd(){
        const {recipients, ...other} = currentConversation
        const nw = [...recipients, user]
        const ns = {recipients: nw, ...other}
        socket.emit( 'add_user', { add: selectedContacts, currentConversation: ns }, ({err})=>{
            if(err){
                alert('Sorry something wrong went')
            }
            else{
                setConversations( prev=>{
                    return prev.map( i=>{
                        if(i._id !== currentConversation._id) return i;
                        else {
                            const {recipients, ...other} = i;
                            return { ...other , recipients: [...recipients, ...selectedContacts] }
                        }
                    } )
                } )
            }
        } )
    }
    async function handleSubmit(e){
        e.preventDefault()

        sethLoading(true)

        if( filter.length > 0 ){
            foradd()
        }
        else{
            forcreate()
        }        

    }

    function handleCheckbox(cn){
        setSelectedContacts( prev => {
            if( prev.findIndex( i=> {return cn._id=== i._id }) >= 0 ) {
                return prev.filter( prevId => {
                    return prevId._id !== cn._id
                } )
            }
            else{
                return [...prev, cn]
            }
        } )
    }
    
    useEffect( ()=>{
        if(user.following.length === 0) {setContacts( []);}
        else {
            axios({
                method:'POST',
                url: config+'/api/users/all',
                data: user.following,
                withCredentials: true
            }).then( res=>{
                let all = res.data;
                if( filter.length > 0 ){
                    all = all.filter( i=>{
                        const k = filter.findIndex( p=>{
                            return p._id === i._id
                        })
                        return k === -1
                    })
                }
                setContacts( all ); 
            } ).catch(err=>{  
                alert("Something wrong went!");
            }).finally( ()=>{
                setLoading(false)
            } )
        }
    },[])


    return ( <>
        <Modal.Header closeButton> {filter.length > 0 ? 'Add Users' : "Start new messaging"} </Modal.Header>
        <Modal.Body>
            {
                loading ? <div> <Spin /> </div> :
            
                <Form onSubmit={handleSubmit}>
                    { contacts.map( contact => (
                        <Form.Group controlId={contact._id} key={contact._id}>
                            <Form.Check 
                                type="checkbox"
                                value={
                                    selectedContacts.findIndex( i=> {return contact._id === i._id }) >= 0 
                                }
                                label={contact.username}
                                onChange={ ()=>handleCheckbox(contact) }
                            />
                        </Form.Group>
                    ) ) }
                    <Button type="submit" className="rounded-0" disabled = {hloading} > 
                        {filter.length>0 ? 'Add' :"Create"} {hloading && '...'} 
                    </Button>
                </Form>
            }
        </Modal.Body>
    </>)
} 