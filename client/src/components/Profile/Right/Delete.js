
import axios from 'axios';
import { useState } from 'react';
import { Button} from 'react-bootstrap'
import config from '../../../config';
import './Style.css'

export default function Delete(){
    
    const [loading, setLoading] = useState(false)

    async function deleteAccount(e){
        setLoading(true)
        e.preventDefault()
        await axios({
            method: "DELETE",
            url: config+'/api/users/delete',
            withCredentials: true
        }).then(res=>{
            window.location.reload()
        }).catch(err=>{
            alert('something wrong went! try again!')
        })
    }
    return(
        <div className="_fright">
            <Button type="button" variant="primary" onClick={deleteAccount} disabled={loading} className="_delete_button"> Delete Account {loading && '...'} </Button>
        </div>
    )
}