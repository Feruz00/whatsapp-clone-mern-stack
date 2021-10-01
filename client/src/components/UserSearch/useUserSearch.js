import {useState, useEffect} from 'react'
import axios from 'axios'
import config from '../../config'

export default function useSearch(id){
    const [data, setData] = useState(null);
    useEffect(()=>{
        // let cancel;
        axios({
            method: "POST",
            url: config+'/get',
            data:{
                id: id
            },
            withCredentials: true
            // cancelToken: new axios.CancelToken( c=> cancel = c )
        }).then( res=>{
            console.log(res.data);
            setData(res.data)
        } ).catch(e=>{
            // if(axios.isCancel(e)) return
        })
        // return ()=>cancel()
    },[id])
    return { data };
}