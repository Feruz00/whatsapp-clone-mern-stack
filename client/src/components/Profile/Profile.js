
import {useState} from 'react'
import {Button} from 'react-bootstrap'
import './Profile.css'
import Information from './Right/Information'
import Security from './Right/Security'
import Upload from './Right/Upload'
import Delete from './Right/Delete'

const a = ['Information', 'Security', 'Upload picture', 'Delete account'];

export default function Profile(){
    const [select, setSelect] = useState(0);
    return (
        <div style={{marginTop: '3rem'}} className="_profile">
            <div className="__">
            <div className="left ">
                { a.map( (i, index)=>(
                    <Button variant={ index === select ? "primary": 'light' } className='rounded-0 _item' key={index} onClick = {()=> setSelect(index) } > {i} </Button>
                ) ) }
            </div>
            { select === 0 && <Information /> }
            { select === 1 && <Security /> }
            { select === 2 && <Upload /> }
            { select === 3 && <Delete /> }
            

            </div>

        </div>
    );
}