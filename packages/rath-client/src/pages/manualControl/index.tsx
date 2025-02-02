import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { GraphicWalker } from '@kanaries/graphic-walker';
import { useGlobalStore } from '../../store';
import { IMutField } from '@kanaries/graphic-walker/dist/interfaces';
import '@kanaries/graphic-walker/dist/style.css';

const VisualInterface: React.FC = props => {
    const { dataSourceStore, exploreStore } = useGlobalStore();
    // TODO: discuss use clean data from dataSourceStore or cooked data from dataPipeline?
    const { cleanedData, mutFields } = dataSourceStore;
    const { specForGraphicWalker } = exploreStore;
    const gwRawFields = useMemo<IMutField[]>(() => {
        return mutFields.map(f => {
            return {
                fid: f.fid,
                name: f.name,
                semanticType: f.semanticType,
                dataType: '?',
                analyticType: f.analyticType
            }
        })
    }, [mutFields])
    return <GraphicWalker dataSource={cleanedData} rawFields={gwRawFields} spec={specForGraphicWalker} />
}

export default observer(VisualInterface);