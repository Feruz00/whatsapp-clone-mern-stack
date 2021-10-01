
import axios from 'axios';
import { useState,useEffect } from 'react';
import {Link} from 'react-router-dom'
import config from '../../config';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import './modal.css'
import {Spin} from 'antd'

export default function SearchModal({ findUser }){

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(()=>{
        const ENDPOINT = config+'/';
        setLoading(true);
        setError('')
        let cancel;
        axios({
            method: "POST",
            url: ENDPOINT,
            data:{
                tapmaly: findUser
            },
            withCredentials: true,
            cancelToken: new axios.CancelToken(c => cancel = c)
        }).then(res=>{
            setData(res.data);
        }).catch(err=>{
            if( err.response ) setError(err.response.data.message);
            else setError("Please try again! We have server error");
            setLoading(false);
            if(axios.isCancel(err)) return
        }).finally(()=>{
            setLoading(false);
        })
        return ()=>cancel()

    },[findUser]);
    let point = config + '/';
    return (
        <div className="__search__container">
            { loading ? <div className="_search_loading"> Loading... </div> : 
                <div className="_search_list">
                    { data.length === 0 && <div> Nothing found </div> }
                    {error.length > 0 && <div> {error} </div>}
                    {
                        data.map( (i,index)=>{
                            return (
                                <div className="_search_item" key={index}>
                                    <div className="_search_logo"> 
                                        { i.logo.length>0 ? 
                                            <img src={point+i.logo} alt="Tr" className="_search_img"  /> :
                                            <AccountCircleRoundedIcon className="_search_img" />
                                        } 
                                    </div>
                                    <Link className="_search_body" to={`/user/${i.username}`} > {i.username} </Link>
                                </div>
                            );
                        } )
                    }
                </div>
        }
        </div>

    );

}