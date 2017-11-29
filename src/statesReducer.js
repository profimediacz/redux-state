import {INIT_LOCAL_STATE, INIT_STATE, REMOVE_STATE} from './actionTypes';

const stateCreator = (stateId, stateReducer, mapInitialState, getState) => {
    let initState = undefined;
    if(mapInitialState !== undefined && mapInitialState !== null && typeof(mapInitialState) === 'function') {
        initState = mapInitialState(getState());
    }
    return {
        stateId,
        state: stateReducer(initState, {type: INIT_LOCAL_STATE}),
        stateReducer
    }
};
const initialState = {};

const statesReducer = (state = initialState, action) => {

    switch (action.type) {
        case INIT_STATE:
            {
                const {stateId, stateReducer, mapInitialStateFromReduxState, getState} = action.payload;

                // TODO check if stateId's already registered
                return {
                    ...state,
                    [stateId]: stateCreator(stateId, stateReducer, mapInitialStateFromReduxState, getState)
                }
            }
        case REMOVE_STATE:
            {
                const {stateId} = action.payload;
                //const {[stateId]: stateToRemove, ...restStates} = state;
                const restStates = {...state};
                delete restStates[stateId];

                return restStates
            }
        default:
            break;
    }

    const stateId = action.meta && action.meta.stateId;

    if (typeof stateId !== `undefined`) {
        //const {[stateId]: stateToUpdate, ...restStates} = state;
        const stateToUpdate = state[stateId];
        const restStates = {...state};
        delete restStates[stateId];

        //const {state: stateOfStateToUpdate, ...restOfStateToUpdate} = stateToUpdate;
        const stateOfStateToUpdate = stateToUpdate["state"];
        const restOfStateToUpdate = {...stateToUpdate};
        delete restOfStateToUpdate["state"];

        return {
            ...restStates,
            [stateId]: {
                ...restOfStateToUpdate,
                state: stateToUpdate.stateReducer(stateOfStateToUpdate, action)
            }
        }
    }

    return Object
        .keys(state)
        .reduce((updatedStates, _stateId) => {
            //const {[_stateId]: stateToUpdate, ...restStates} = updatedStates;
            const stateToUpdate = updatedStates[_stateId];
            const restStates = {...updatedStates};
            delete restStates[_stateId];


            //const {state: stateOfStateToUpdate, ...restOfStateToUpdate} = stateToUpdate;
            const stateOfStateToUpdate = stateToUpdate["state"];
            const restOfStateToUpdate = {...stateToUpdate};
            delete restOfStateToUpdate["state"];

            return {
                ...restStates,
                [_stateId]: {
                    ...restOfStateToUpdate,
                    state: stateToUpdate.stateReducer(stateOfStateToUpdate, action)
                }
            }
        }, state)
};

export default statesReducer;