import './Style.css'
import {useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {PlusOutlined} from '@ant-design/icons'
import {Alert, Button} from 'react-bootstrap'
import axios from 'axios'
import config from '../../../config';

export default function Upload(){
    
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    
    
    const [file, setFile] = useState(null)
    const {
        getRootProps, 
        getInputProps,
    } = useDropzone({
        accept:'image/*', 
        multiple: false,
        onDrop: acceptedFiles => {
            setFile(acceptedFiles.map(prev => Object.assign(prev, {
              preview: URL.createObjectURL(prev)
            })));
        }
    });
    // console.log(file)
    async function handleSubmit(){
        setError('')
        setSuccess('')
        if(file === null){
            setError("Select picture")
            return
        }
        const form = new FormData();
        form.append('file', file[0]);

        await axios({
            method: "POST",
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            url:config+'/api/users/picture' ,
            data: form,
            withCredentials:true
        }).then(res=>{
            setSuccess("Successfully uploaded!")
        }).catch(err=>{
            if( err.response ) setError(err.response.data.message);
            else setError("Please try again!");
        }).finally(()=>{
            setLoading(false)
        })

    }

    return (
        <div className="_fright _upload">

        <h2> Upload your profile picture </h2>
        
        { error.length > 0 && <Alert variant="danger"> {error} </Alert> }
        {success.length > 0 && <Alert variant="success"> {success} </Alert>}
        <div className="pictures">

            <div {...getRootProps({className:'dropzone'})}>
                <input {...getInputProps()} />
                <PlusOutlined style={{ fontSize: '3rem' , color: 'lightgray' }} />
            </div>
            {
                file && <div className="_img">
                    <img src={file[0].preview} alt="User upload picture" /> 
                </div>
            }
            
        </div>
        
        <Button variant="primary" className="" onClick={handleSubmit} disabled={loading} > Upload {loading && '...'} </Button>
        
        </div>
    )

}