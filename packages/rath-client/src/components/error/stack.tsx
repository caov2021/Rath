import { observer } from 'mobx-react-lite';
import React from 'react';
import { getErrorStore } from './store';
import MessageCard from './message';
import styled from 'styled-components'

const Cont = styled.div`
    position: fixed;
    display: flex;
    top: 1em;
    right: 1em;
    z-idnex: 50;
    width: 360px;
    flex-wrap: wrap;
    > div{
        margin-top: 1em;
    }
`;

interface StackProps {

}
const Stack: React.FC<StackProps> = props => {
    const store = getErrorStore();
    const { queue } = store;
    return <Cont>
        {
            queue.map((err, i) => <MessageCard key={i}
                title={err.title}
                content={err.content}
                type={err.type}
                onClose={() => {
                    store.remove(i)
                }}
            />)
        }
    </Cont>
}

export default observer(Stack);