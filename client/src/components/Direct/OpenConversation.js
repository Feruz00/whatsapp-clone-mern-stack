import { useConversation } from "../../conversation";
import {useState} from 'react'
import {MessageFilled} from '@ant-design/icons'
import Top from './Top'
import Center from "./Center";
import Chatcenter from "./Chatcenter";
import Bottom from "./Bottom";

export default function OpenConversation(){

    const { currentConversation } = useConversation()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="open_conver">
            {
                currentConversation===null ? <h4 className="_start_messaging"> Start messaging {' '} <MessageFilled style ={ { color:"#ccc", fontSize: '2rem'}}  /> </h4> :
                <>
                    <Top isOpen={isOpen} setIsOpen={setIsOpen}  />
                    {isOpen ? <Center/> : <Chatcenter />  }
                    {!isOpen && <Bottom />}
                </>
            }
        </div>
    )
}