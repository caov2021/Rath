/**
 * distVis 是分布式可视化的推荐，是比较新的模块，目前暂时用于dev模块，即voyager模式下的测试。
 */
import { IPattern } from "../dev";
import { IFieldMeta, IResizeMode } from "../interfaces";
import { encodingDecorate } from "./base/utils";
import { applyInteractiveParams2DistViz, applySizeConfig2DistViz } from "./distribution/utils";
export const geomTypeMap: { [key: string]: any } = {
    interval: "boxplot",
    line: "line",
    point: "point",
    // density: 'rect'
    density: "point"
};

const channels = {
    quantitative: ['y' , 'x', 'size', 'opacity', 'color'],
    ordinal: ['y', 'x', 'opacity', 'color', 'size', 'shape'],
    nominal: ['y', 'x', 'color', 'row', 'column', 'opacity', 'size', 'shape'],
    temporal: ['y', 'x', 'opacity', 'color', 'shape']
} as const;
// const channels = {
//     quantitative: ['y' , 'x', 'size', 'color', 'opacity'],
//     ordinal: ['y', 'x', 'color', 'size', 'shape'],
//     nominal: ['y', 'x', 'color', 'row', 'column', 'size', 'shape'],
//     temporal: ['y', 'x', 'opacity', 'color', 'shape']
// } as const;

const highOrderChannels = {
    dimension: ['row', 'column'],
    measure: ['repeat']
} as const;

interface BaseVisProps {
    // dataSource: DataSource;
    pattern: IPattern;
    interactive?: boolean;
    resizeMode?: IResizeMode;
    width?: number;
    height?: number;
}
function humanHabbit (encoding: any) {
    if (encoding.x && encoding.x.type !== 'temporal') {
        if (encoding.y && encoding.y.type === 'temporal') {
            const t = encoding.x;
            encoding.x = encoding.y;
            encoding.y = t;
        }
    }
}

interface EncodeProps{
    fields: IFieldMeta[];
    usedChannels?: Set<string>;
    statFields?: IFieldMeta[];
    statEncodes?: IFieldEncode[]
}
function encode (props: EncodeProps) {
    const {
        fields,
        usedChannels = new Set(),
        statFields = [],
        statEncodes = []
    } = props;
    const orderFields = [...fields];
    let encoding: any = {}
    let inHighOrderStatus: keyof typeof highOrderChannels | null = null;
    let highOrderIndex: number = 0;
    orderFields.sort((a, b) => b.features.entropy - a.features.entropy);
    statFields.sort((a, b) => b.features.entropy - a.features.entropy);
    const totalFields = [...statFields, ...orderFields].sort((a, b) => b.features.entropy - a.features.entropy);
    // orderFields.unshift(...statFields);
    for (let i = 0; i < totalFields.length; i++) {
        const chs = channels[totalFields[i].semanticType];
        let encoded: boolean = false;
        const statIndex = statFields.findIndex(f => f.fid === totalFields[i].fid)
        const orderIndex = orderFields.findIndex(f => f.fid === totalFields[i].fid)
        const isStatField = statIndex > -1;
        if (isStatField) {
            for (let j = 0; j < chs.length; j++) {
                if (!usedChannels.has(chs[j])) {
                    encoding[chs[j]] = statEncodes[statIndex]
                    usedChannels.add(chs[j])
                    // if (statFields[statIndex].semanticType === 'quantitative') {
                    //     if (statFields[statIndex].features.entropy / Math.log2(16) < 0.2) {
                    //         encoding[chs[j]].scale = { type: 'sqrt' }
                    //     }
                    // }
                    encoded = true;
                    break;
                }
            }
            // 发生可能很低
            // FIXME 多度量repeat设计
            if (!encoded) {
                inHighOrderStatus = statFields[statIndex].analyticType;
                if (inHighOrderStatus === 'dimension' && highOrderIndex < highOrderChannels[inHighOrderStatus].length) {
                    encoding[highOrderChannels[inHighOrderStatus][highOrderIndex]] = statEncodes[statIndex]
                    highOrderIndex++
                }
            }
        } else {
            for (let j = 0; j < chs.length; j++) {
                if (!usedChannels.has(chs[j])) {
                    encoding[chs[j]] = {
                        field: orderFields[orderIndex].fid,
                        type: orderFields[orderIndex].semanticType,
                        title: orderFields[orderIndex].name || orderFields[orderIndex].fid
                    }
                    usedChannels.add(chs[j])
                    encoded = true;
                    break;
                }
            }
            if (!encoded) {
                inHighOrderStatus = orderFields[orderIndex].analyticType;
                if (inHighOrderStatus === 'dimension' && highOrderIndex < highOrderChannels[inHighOrderStatus].length) {
                    encoding[highOrderChannels[inHighOrderStatus][highOrderIndex]] = {
                        field: orderFields[orderIndex].fid,
                        type: orderFields[orderIndex].semanticType
                    }
                    highOrderIndex++
                }
            }
        }
    }

    // for (let i = 0; i < statFields.length; i++) {
    //     const chs = channels[statFields[i].semanticType];
    //     let encoded: boolean = false;
    //     for (let j = 0; j < chs.length; j++) {
    //         if (!usedChannels.has(chs[j])) {
    //             encoding[chs[j]] = statEncodes[i]
    //             usedChannels.add(chs[j])
    //             encoded = true;
    //             break;
    //         }
    //     }
    //     // 发生可能很低
    //     if (!encoded) {
    //         inHighOrderStatus = statFields[i].analyticType;
    //         if (inHighOrderStatus === 'dimension' && highOrderIndex < highOrderChannels[inHighOrderStatus].length) {
    //             encoding[highOrderChannels[inHighOrderStatus][highOrderIndex]] = statEncodes[i]
    //             highOrderIndex++
    //         }
    //     }
    // }
    // for (let i = 0; i < orderFields.length; i++) {
    //     const chs = channels[orderFields[i].semanticType];
    //     let encoded: boolean = false;
    //     for (let j = 0; j < chs.length; j++) {
    //         if (!usedChannels.has(chs[j])) {
    //             encoding[chs[j]] = {
    //                 field: orderFields[i].fid,
    //                 type: orderFields[i].semanticType,
    //                 title: orderFields[i].name || orderFields[i].fid
    //             }
    //             usedChannels.add(chs[j])
    //             encoded = true;
    //             break;
    //         }
    //     }
    //     if (!encoded) {
    //         inHighOrderStatus = orderFields[i].analyticType;
    //         if (inHighOrderStatus === 'dimension' && highOrderIndex < highOrderChannels[inHighOrderStatus].length) {
    //             encoding[highOrderChannels[inHighOrderStatus][highOrderIndex]] = {
    //                 field: orderFields[i].fid,
    //                 type: orderFields[i].semanticType
    //             }
    //             highOrderIndex++
    //         }
    //     }
    // }
    return encoding
}

function isSetEqual (a1: any[], a2: any[]) {
    const s1 = new Set(a1);
    const s2 = new Set(a2);
    if (s1.size !== s2.size) return false;
    for (let ele of s1) {
        if (!s2.has(ele)) return false;
    }
    return true;
}

function autoMark (fields: IFieldMeta[], statFields: IFieldMeta[]= [], originFields: IFieldMeta[] = [], statEncodes: IFieldEncode[] = []) {
    // const orderFields = [...fields];
    // const orderStatFields = [...statFields];
    // orderFields.sort((a, b) => b.features.entropy - a.features.entropy);
    // orderStatFields.sort((a, b) => b.features.entropy - a.features.entropy);
    const semantics = [...statFields, ...originFields].sort((a, b) => b.features.entropy - a.features.entropy).slice(0, 2).map(f => f.semanticType)
    // if (fields.length === 1) {
    //     return 'bar'
    // }
    // FIXME: 时间序列多目标
    // if (statFields.length > 0) {
    //     // 仅对count生效。
    //     return 'bar'
    // }
    if (statEncodes.find(f => f.aggregate === 'count')) {
        return 'bar'
    }
    // if (fields.length === 1) {
    //     return 'bar'
    // }
    const cond_sinleTargets = fields.filter(f => f.analyticType === 'measure').length === 1;

    if (cond_sinleTargets) {
        if (isSetEqual(semantics, ['nominal', 'nominal'])) {
            return 'text'
        } else if (isSetEqual(semantics, ['nominal', 'quantitative'])) {
            return 'bar'
        } else if (isSetEqual(semantics, ['ordinal', 'quantitative'])) {
            return 'point'
        } else  if (isSetEqual(semantics, ['nominal', 'ordinal'])) {
            return 'point'
        } else  if (isSetEqual(semantics, ['nominal', 'temporal'])) {
            return 'point'
        } else if (isSetEqual(semantics, ['quantitative', 'quantitative'])) {
            return 'circle'
        } else if (isSetEqual(semantics, ['temporal', 'quantitative'])) {
            return 'line'
        }
    } else {
        if (isSetEqual(semantics, ['nominal', 'nominal'])) {
            return 'text'
        } else if (isSetEqual(semantics, ['nominal', 'quantitative'])) {
            return 'tick'
        } else if (isSetEqual(semantics, ['ordinal', 'quantitative'])) {
            return 'point'
        } else  if (isSetEqual(semantics, ['nominal', 'ordinal'])) {
            return 'point'
        } else if (isSetEqual(semantics, ['quantitative', 'quantitative'])) {
            return 'circle'
        }
    }
    return 'point'
}

function markFixEncoding (markType: string, usedChannels: Set<string>) {
    if (markType === 'bar') {
        usedChannels.add('size');
        usedChannels.add('shape');
    }
}

// function autoAgg (props: {encoding: any; fields: IFieldMeta[]; markType: string; op?: string; statFields?: IFieldMeta[]}) {
//     const {
//         encoding,
//         fields,
//         markType,
//         op = 'mean',
//         statFields = []
//     } = props
//     if (fields.length > 1) {
//         if (markType === 'bar' || markType === 'line') {
//             if (encoding.x && encoding.x.type === 'quantitative') {
//                 encoding.x.aggregate = op;
//                 if (encoding.x.title) {
//                     encoding.x.title = `${op}(${encoding.x.title})`
//                 }
//             }
//             if (encoding.y && encoding.y.type === 'quantitative') {
//                 encoding.y.aggregate = op;
//                 if (encoding.y.title) {
//                     encoding.y.title = `${op}[${encoding.y.title}]`
//                 }
//             }
//         }
//     }
// }

interface IFieldEncode {
    field?: string;
    title?: string;
    type?: string;
    aggregate?: string;
    bin?: boolean;
}

// FIXME: 统一aggregate逻辑。
function autoStat (fields: IFieldMeta[]): {
    statFields: IFieldMeta[];
    distFields: IFieldMeta[];
    statEncodes: IFieldEncode[];
} {
    const statFields: IFieldMeta[] = [];
    const statEncodes: IFieldEncode[] = [];
    const cond_singlefield = fields.length === 1;
    const cond_nonquanmeasure = fields.filter(f => f.analyticType === 'measure').filter(f => f.semanticType === 'nominal' || f.semanticType === 'ordinal').length > 0;
    if (cond_singlefield || cond_nonquanmeasure) {
        statFields.push({
            fid: '__tmp_stat_id_unique',
            semanticType: 'quantitative',
            analyticType: 'measure',
            geoRole: 'none',
            features: {
                entropy: Infinity,
                maxEntropy: Infinity,
                unique: 1000
            },
            distribution: []
        })
        statEncodes.push({
            aggregate: 'count'
        })
        fields.filter(f => f.semanticType === 'quantitative').forEach(f => {
            statFields.push({ ...f })
            statEncodes.push({
                field: f.fid,
                title: f.name || f.fid,
                type: f.semanticType,
                bin: true
            })
        })
    } else {
        const targets = fields.filter(f => f.analyticType === 'measure');
        // 单目标的场景
        if (targets.length === 1) {
            // 连续型 度量做聚合，非连续型度量做分箱；
            targets.forEach(f => {
                statFields.push({ ...f })
                statEncodes.push({
                    field: f.fid,
                    type: f.semanticType,
                    title: `mean(${f.name || f.fid})`,
                    aggregate: 'mean'
                })
            })
            fields.filter(f => f.analyticType === 'dimension' && f.semanticType === 'quantitative').forEach(f => {
                statFields.push({ ...f })
                statEncodes.push({
                    field: f.fid,
                    title: f.name || f.fid,
                    type: f.semanticType,
                    bin: true
                })
            })
        }
    }
    const distFields = fields.filter(f => !statFields.find(sf => sf.fid === f.fid));
    return { statFields, distFields, statEncodes }
}

export function distVis(props: BaseVisProps) {
    const { pattern, resizeMode = IResizeMode.auto, width, height, interactive } = props;
    const { fields } = pattern;
    const usedChannels: Set<string> = new Set();
    const { statFields, distFields, statEncodes } = autoStat(fields);
    let markType = autoMark(fields, statFields, distFields, statEncodes)
    markFixEncoding(markType, usedChannels)
    // if (filters && filters.length > 0) {
    //     usedChannels.add('color')
    // }
    const enc = encode({
        fields: distFields, usedChannels, statFields,
        statEncodes
    })
    // if (filters && filters.length > 0) {
    //     const field = filters[0].field;
    //     enc.color = {
    //         // field: field.fid,
    //         // type: field.semanticType,
    //         condition: {
    //             test: `datum['${field.fid}'] == '${filters[0].values[0]}'`
    //         },
    //         value: '#aaa'
    //         // value: '#000'
    //     }
    // }
    // autoAgg({
    //     encoding: enc, fields, markType,
    //     statFields
    // })
    humanHabbit(enc);

    if (resizeMode === IResizeMode.control) {
        encodingDecorate(enc, fields, statFields);
    }

    let basicSpec: any = {
        // "config": {
        //     "range": {
        //       "category": {
        //         "scheme": "set2"
        //       }
        //     }
        //   },
        data: { name: 'dataSource' },
        mark: {
            type: markType,
            opacity: markType === 'circle' ? 0.56 : 0.88
        },
        encoding: enc
    };
    applySizeConfig2DistViz(basicSpec, {
        mode: resizeMode,
        width,
        height
    })
    if (interactive) {
        applyInteractiveParams2DistViz(basicSpec);
    }
    // if (filters && filters.length > 1) {
    //     basicSpec.transform = filters.slice(1).map(f => ({
    //         filter: `datum.${f.field.fid} == '${f.values[0]}'`
    //     }))
    // }
    // if (filters && filters.length > 0) {
    //     basicSpec.transform = filters.map(f => ({
    //         filter: `datum.${f.field.fid} == '${f.values[0]}'`
    //     }))
    // }
    return basicSpec;
}
