import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config";
import {Auth} from '../../context'
import './Account.css';

export default function AccountModal(){
    const ENDPOINT = config + '/api/users/logout';
    const {user} = Auth()

    const Logout = async ()=>{
        try {
            await axios({
                method: "GET",
                withCredentials: true,
                url: ENDPOINT
            });
            window.location.reload();
            // setUser(null);
        } catch (error) {
            
        }
    }
    return (
        <div className="_account__modal"> 
            <Link to={"/user/"+user.username}  className="_account__item"> Profile </Link>
            <Link to="/settings" className="_account__item"> Settings </Link>
            <div className="_account__item" onClick={Logout}> Logout </div>
        </div>
    );
}