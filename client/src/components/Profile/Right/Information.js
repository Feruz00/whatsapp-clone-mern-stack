
import axios from 'axios';
import { useState } from 'react';
import {Form, Button, Alert} from 'react-bootstrap'
import config from '../../../config';
import {Auth} from '../../../context'
import './Style.css'

export default function Information(){
    const {user, setUser} = Auth()

    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [username, setUsername] = useState(user.username);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e){
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        if( !( firstName.length > 0 && firstName.length < 16 )  ) {
            setError('First name must be required and less than 16')
            return
        }
        
        if( !( lastName.length > 0 && lastName.length < 21 )  ) {
            setError('Last name must be required and less than 21')
            return
        }
        
        if( !( username.length > 0 && username.length < 30 )  ) {
            setError('Username must be required and less than 30')
            return
        }
        if( username.search(' ') !== -1 ){
            setError('In username field didnt use space')
            return
        }

        await axios({
            method: "POST",
            url: config+'/api/friends/upd_info',
            data:{
                firstName: firstName,
                lastName: lastName, 
                username: username
            },
            withCredentials: true
        }).then(res=>{
            setSuccess("Successfully updated!")
            setUser(res.data)
        }).catch(err=>{
            if( err.response ) setError(err.response.data.message);
            else setError("Please try again!");
        }).finally(()=>{
            setLoading(false)
        })

    }

    return (
        <div className="_fright">
            <Form onSubmit={handleSubmit} className="_info_form">
                { error!=='' && <Alert variant="danger" > {error} </Alert> }
                { success.length>0 && <Alert variant="success" > {success} </Alert> }
                <Form.Group className="_info_group">
                    <Form.Label className="_info_label"> Username: </Form.Label>
                    <Form.Control className="_info_input" type="text" 
                    onChange={(e)=>setUsername(e.target.value)} value={username} required />
                </Form.Group>
                <Form.Group className="_info_group">
                    <Form.Label className="_info_label"> First Name: </Form.Label>
                    <Form.Control className="_info_input" type="text" 
                    onChange={(e)=>setFirstName(e.target.value)} value={firstName} required />
                </Form.Group>
                <Form.Group className="_info_group">
                    <Form.Label className="_info_label"> Last Name: </Form.Label>
                    <Form.Control className="_info_input" type="text" 
                    onChange={(e)=>setLastName(e.target.value)} value={lastName} required />
                </Form.Group>
                <Button type="submit" variant="primary" className=" _info_button"
                    disabled={loading} 
                >Change { loading && "..." } </Button>
            </Form>
        </div>
    );
}