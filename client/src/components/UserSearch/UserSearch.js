
import axios from 'axios'
import {Auth} from '../../context'
import config from '../../config';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import {Button, Modal,Alert} from 'react-bootstrap'
import './Style.css'
import {EditOutlined} from '@ant-design/icons'
import {useParams, Link} from 'react-router-dom'
// import useSearch from './useUserSearch';
import {useState, useEffect} from 'react'
import ModulE from './Modul_e'


export default function UserSearch(){
    
    const [toggle, setToggle] = useState(false)
    const {username} = useParams()
    const {user, setUser} = Auth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [show, setShow] = useState(false)
    const [arr, setArr] = useState([])
    const [title, setTitle] = useState('')
    const [error, setError] = useState('');
    const [change, setChange] = useState(false)
    

    useEffect( ()=>{
        setLoading(true)
        axios({
            method: "POST",
            url: config+'/get',
            data:{
                username: username
            },
            withCredentials: true
        }).then(res=>{
            setData(res.data)
        }).catch(err=>{
            if(err.response) setError(err.response.data.message);
            else setError( 'Something wrong went! Try again!' );
        }).finally(()=>{
            setLoading(false)
        })

    }, [username, change] )

    function isFollow(){
        const {_id} = data;
        return user.following.includes( _id ) 
    }

    function handleFollow(){
        let url = config + '/api/friends' + ( isFollow() ? '/unfollow' : '/follow' );
        setToggle(true)
        axios({
            method: "POST",
            url: url,
            data: {
                _id: data._id
            },
            withCredentials: true
        }).then(res=>{            
            setUser(res.data)
            
            setData( prev=>{
                const {followers, ...other} = prev;

                if(followers.includes( user._id )){
                    const nw = followers.filter( r => {
                        return ( r !== user._id ) 
                    })
                    return { followers: nw, ...other };
                }
                else{
                    followers.push(user._id)
                    return {followers: followers, ...other}
                }
            } )

        }).catch(err=>{
            alert(err)
        }).finally(()=>{
            setToggle(false)
        })
    
    }
    return (
        <div style={{ marginTop: '3rem' }} className="_profile">
            { error.length>0 && <Alert variant="danger"> {error} </Alert> }
            {
                (!loading && data ) ?
            
            <div className="_body">
                <div className="_picture">
                    {  data.logo.length > 0 ?
                        <img src={config + '/' + data.logo} alt="Logo" />:
                        <AccountCircleRoundedIcon style={{fontSize: '8rem'}} /> 
                    }
                </div>
                <div className="_user">
                    <div className="_first">
                        <h1> {data.username} </h1>
                        
                        {   data._id === user._id ?
                            <Link to="/settings"> <EditOutlined /> Edit Profile  </Link>
                            :  
                            <Button disabled={toggle} onClick={handleFollow} className=" _button " variant={ isFollow() ? 'primary' : 'outline-primary' } > 
                                { isFollow() ? `Unfollow${toggle?'...':''}`: `Follow${toggle?'...':''}` }  
                            </Button> 
                        }
                        {
                            data._id === user._id ?
                            <Button variant="primary" className="_btn"> Write New Blog </Button>
                            :
                            <Button variant="secondary" className="_btn"> Show Blogs </Button>
                        }
                    </div>
                    <div className="_second">
                        <Button variant="light" className="rounded-0 _fl" onClick={ ()=>{
                            setShow(true)
                            setArr( data.followers )
                            setTitle('Followers')
                        } } > {data.followers.length} followers </Button>
                        <Button variant="light" className="rounded-0 _fl" onClick={ ()=>{
                            setShow(true)
                            setArr( data.following )
                            setTitle('Followings')
                        } }> {data.following.length} following </Button>  
                    </div>
                    <div className="_third">
                        {data.firstName} {data.lastName}
                    </div>
                </div>
                
            </div>
            :
            <div> Loading... </div>
            }   
            <Modal show={show} onHide={ ()=>{ setShow(false); setChange(prev=>!prev) } } >
                <ModulE setShow={setShow} arr={arr} title={title} setChange={setChange}/>    
            </Modal>         
        </div> 
    );
}