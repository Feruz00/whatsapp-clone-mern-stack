
import axios from 'axios';
import { useState } from 'react';
import {Form, Button, Alert} from 'react-bootstrap'
import config from '../../../config';
import './Style.css'


export default function Information(){

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const confirmPassword = (s) =>{
        if( s.length < 6 ) return false;
        let bo = false;
        for( let i=0; i<s.length;i++ ){
            if( '0' <= s[i] && s[i]<='9' ) bo = true;
        }
        if( !bo ) return false;
        bo = false;
        for( let i=0; i<s.length;i++ ){
            if( ('a' <= s[i] && s[i]<='z') || ('A' <= s[i] && s[i]<='Z') ) bo = true;
        }
        if(!bo) return false;
        return true;
    }

    async function handleSubmit(e){
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        if( !confirmPassword(oldPassword)  ) {
            setError('Password must be greater than 5 and password must be numbers and characters')
            return
        }
        if( !confirmPassword(newPassword)  ) {
            setError('Password must be greater than 5 and password must be numbers and characters')
            return
        }
        
        await axios({
            method: "PATCH",
            url: config+'/api/users/change',
            data:{
                oldPassword: oldPassword,
                newPassword: newPassword
            },
            withCredentials: true
        }).then(res=>{
            setSuccess(res.data.message)
        }).catch(err=>{
            if( err.response ) setError(err.response.data.message);
            else setError("Please try again!");
        }).finally(()=>{
            setLoading(false)
        })

        setOldPassword('')
        setNewPassword('')
    }

    return (
        <div className="_fright">
            <Form onSubmit={handleSubmit} className="_info_form">
                { error.length>0 && <Alert variant="danger" > {error} </Alert> }
                { success.length>0 && <Alert variant="success" > {success} </Alert> }
                <Form.Group className="_info_group">
                    <Form.Label className="_info_label"> Old Password: </Form.Label>
                    <Form.Control className="_info_input" type="password" onChange={(e)=>setOldPassword(e.target.value)} value={oldPassword} required />
                </Form.Group>
                <Form.Group className="_info_group">
                    <Form.Label className="_info_label"> New Password: </Form.Label>
                    <Form.Control className="_info_input" type="password" onChange={(e)=>setNewPassword(e.target.value)} value={newPassword} required />
                </Form.Group>
                
                <Button type="submit" variant="primary" className="_info_button"
                    disabled={loading} 
                >Change { loading && "..." } </Button>
            </Form>
        </div>
    );
}