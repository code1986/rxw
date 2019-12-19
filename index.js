import { createStore, combineReducers } from "redux";

function createReducer(actionGroup) {
    const handlers = [];
    for (let actionName in actionGroup) {
        const actionDefine = actionGroup[actionName];
        if (typeof actionDefine !== 'object') {
            continue
        }
        if (actionDefine.type && actionDefine.reduce && actionDefine.action) {
            if (typeof actionDefine.action !== 'function') {
                console.warn(`${actionName}.action is not function type`);
                console.warn(actionDefine);
            } else {
                if (actionDefine.action.prototype === undefined) {
                    console.warn(`${actionName}.action don't use => lambda syntax, 'this' in lambda will be 'undefined', replace with "function(){}" will be ok`);
                    console.warn(actionDefine);
                }
            }

            handlers.push(actionDefine);
        }
    }
    return function(state = actionGroup.initState, action) {
        for (let actionDefine of handlers) {
            if (actionDefine.type === action.type) {
                return actionDefine.reduce(state, action);
            }
        }
        return state;
    }
}

function install(o, actionGroup) {
    if (actionGroup.stateName in o) {
        console.warn(`stateName: ${actionGroup.stateName} already exists!, will be overwrite`);
        console.warn(actionGroup);
    }
    o[actionGroup.stateName] = createReducer(actionGroup);
}

export default function createStoreFromActions(actionGroupList, preloadedState, enhancer) {
    var o = {};
    for (var i = 0; i < actionGroupList.length; i++) {
        install(o, actionGroupList[i]);
    }
    return createStore(combineReducers(o), preloadedState, enhancer);
}
