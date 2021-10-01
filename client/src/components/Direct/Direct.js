import Sidebar from './Sidebar';
import OpenConversation from './OpenConversation';
import './stil.css'

export default function Direct(){
    
    return <div className="conversation" >
        <Sidebar />
        <OpenConversation   />
    </div>
}