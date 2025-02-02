import React from 'react';
import { callTerminator, cancelTerminator, IErrorInfo } from './store';
import { Icon } from 'office-ui-fabric-react';
// import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'
import styled from 'styled-components';
interface MessageProps extends IErrorInfo {
    onClose: () => void;
};

const Cont = styled.div`
    box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;
    min-width: 360px;
    z-index: 999;
    background-color: #ffffff;
    @keyframes cont-show{
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
    animation: cont-show 0.36s;
    .cancel-icon{
        position: absolute;
        right: 1em;
        top: 1em;
        cursor: pointer;
    }
    .text-red-500{
        color: #EF4444;
    }
    .text-yellow-500{
        color: #F59E0B;
    }
    .text-green-500{
        color: #10B981;
    }
    .text-blue-500{
        color: #3B82F6;
    }
    .text-2xl{
        font-size: 1.5em;
    }
`

const MessageCard: React.FC<MessageProps> = props => {
    const { title, content, type, onClose } = props;

    return <Cont className="z-50 mt-4 bg-white p-4 border-solid border-1 border-grey-50 grid grid-cols-6 relative"
        onMouseLeave={() => {
            callTerminator();
        }}
        onMouseEnter={() => {
            cancelTerminator()
        }}>
            <Icon iconName="Cancel" className="cancel-icon" onClick={onClose} />
            <div>
                {type === 'error' && <Icon iconName="ErrorBadge" className="text-red-500 text-2xl" />}
                {type === 'warning' && <Icon iconName="Blocked2" className="text-yellow-500 text-2xl" />}
                {type === 'success' && <Icon iconName="Completed" className="text-green-500 text-2xl" />}
                {type === 'info' && <Icon iconName="Info" className="text-blue-500 text-2xl" />}
            </div>
        {/* <CloseOutlined className="absolute right-4 top-4 text-gray-500 cursor-pointer" onClick={onClose} />
        <div>
            {type === 'error' && <CloseCircleOutlined className="text-red-500 text-2xl" />}
            {type === 'warning' && <WarningOutlined className="text-yellow-500 text-2xl" />}
            {type === 'success' && <CheckCircleOutlined className="text-green-500 text-2xl" />}
            {type === 'info' && <InfoCircleOutlined className="text-blue-500 text-2xl" />}
        </div> */}
        <div className="col-span-5">
            <h1 className="text-base">{title}</h1>
            <div className="text-sm mt-1 text-gray-600">{content}</div>
        </div>
    </Cont>
}

export default MessageCard;