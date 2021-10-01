import { Auth } from "../../context";
import { useConversation } from '../../conversation'
import {NavLink, Link, useLocation} from 'react-router-dom';
import './Navbar.css';
import TelegramIcon from '@material-ui/icons/Telegram';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import NotificationsNoneRoundedIcon from '@material-ui/icons/NotificationsNoneRounded';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import SearchIcon from '@material-ui/icons/Search';
import { useState, useEffect } from "react";
import NotificationModal from '../Notifications/NotificationModal.'
import AccountModal from '../Account/AccountModal';
import SearchModal from "../Search/SearchModal";
import {Badge} from 'antd'

export default function Navbar(){
    
    const [notifications, setNotifications] = useState(false);
    const [account, setAccount] = useState(false);
    const [search, setSearch] = useState('');
    const {user} = Auth();
    const {count} = useConversation()

    const location = useLocation()

    useEffect( ()=>{
        setAccount(false)
        setNotifications(false)
        setSearch('')
    },[location] )
    
    if(user===null) return null;
    else return (
        <div className="_navbar">
            <div className="_navbar__brand">
                <Link to ="/"> Travel </Link>
            </div>
            <div className="_navbar__search">
                <SearchIcon className="_navbar__icon" />
                <input type="text" className="_navbar__search" value={search} onChange={ (e)=>setSearch(e.target.value) } />
                { search.length > 0 && <SearchModal findUser={ search } /> }
            </div>
            <div className="_navbar__menu">
                <NavLink to="/" activeClassName="_navbar__active" className="_menu__item"> 
                    <HomeIcon 
                    className="__item"/> <div className="nyshan"></div> 
                </NavLink>

                <NavLink to="/direct" activeClassName="_navbar__active" className="_menu__item"> 
                    { count === [] ?  
                    <TelegramIcon 
                    className="__item"/>:
                    <Badge count={count.length}>
                         <TelegramIcon 
                    className="__item"/> 
                    </Badge>
                    }
                </NavLink>
                
                <NavLink to="/explore" activeClassName="_navbar__active" className="_menu__item">
                    <ExploreIcon 
                    className="__item"/> 
                </NavLink>
                
                <div className="_menu__item" > <NotificationsNoneRoundedIcon onClick={
                    ()=>{
                        setNotifications(!notifications)
                        setAccount(false);
                    }
                    
                } 
                    className="__item"
                /> 
                    <div className="nyshan"></div>
                    { notifications &&  <NotificationModal />  }
                </div>
                    
                <div className="_menu__item"> <AccountCircleRoundedIcon onClick={
                    ()=>{
                        setAccount(!account)
                        setNotifications(false);
                    }
                } 
                    className="__item"
                /> 
                
                {account && <AccountModal /> }     
                </div>   
            </div>
        </div>
    );
}