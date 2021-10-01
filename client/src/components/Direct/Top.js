import {InfoCircleFilled} from '@ant-design/icons'
import { useEffect} from 'react';
import { useConversation } from "../../conversation";

export default function Top({ setIsOpen, isOpen }){
    const { currentConversation } = useConversation()
    
    useEffect(()=>{
        setIsOpen(false)
    }, [currentConversation])

    return (
        <div className="open_top">
            <div className={"open_top_name " + (isOpen ? ' opened_top ': '')  }>
                 <h6>{ isOpen ? 'Information' :currentConversation.name}</h6>
            </div>
            <div className="open_top_info">
                <InfoCircleFilled onClick = { ()=> setIsOpen(!isOpen) } 
                    style={{
                        color: isOpen ? 'black': '#ccc',
                        fontSize: '1.7rem'
                    }}
                    
                />
            </div>
        </div>
    )
}