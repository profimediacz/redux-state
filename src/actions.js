import {INIT_STATE, REMOVE_STATE, UPDATE_STATY} from './actionTypes'

export const initState = (stateId, stateReducer, mapInitialStateFromReduxState, props, getState) => ({
    type: INIT_STATE,
    payload: {
        stateId,
        stateReducer,
        mapInitialStateFromReduxState,
        props,
        getState
    }
});

export const removeState = (stateId) => ({
    type: REMOVE_STATE,
    payload: {
        stateId
    }
});

export const updateStaty = (state) => ({
    type: UPDATE_STATY,
    payload: {
        state
    }
});