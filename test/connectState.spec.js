import * as actionTypes from '../src/actionTypes'

import React, {Children, Component, PropTypes} from 'react'
import {combineReducers, createStore} from 'redux'

import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'

import connectState from '../src/connectState'
import expect from 'expect'
import sinon from 'sinon'
import statesReducer from '../src/statesReducer'
import staty from '../src/staty'


describe(`redux-state`, () => {
    describe(`connectState`, () => {
        const createStoreWithStates = (states = {}) => createStore(() => ({
            states
        }))

        class Passthrough extends Component {
            render() {
                return (
                    <div {...this.props}/>
                )
            }
        }

        class ProviderMock extends Component {
            getChildContext() {
                return {store: this.props.store}
            }

            render() {
                return Children.only(this.props.children)
            }
        }

        ProviderMock.childContextTypes = {
            store: PropTypes.object.isRequired
        }

        it(`should throw error when connectState called first time without reducer`, () => {
            const store = createStoreWithStates()

            @connectState()
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            expect(() => TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container/>
                </ProviderMock>
            )).toThrow(/with reducer/)
        })

        it(`should not throw error if parent's stateId is 0`, () => {
            const store = createStoreWithStates({
                0: {}
            })

            @connectState()
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            class ParentContainer extends Component {

                getChildContext() {
                    return {
                        stateId: 0
                    }
                }

                render() {
                    return this.props.children
                }
            }

            ParentContainer.childContextTypes = {
                stateId: PropTypes.any
            }

            expect(() => TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <ParentContainer>
                        <Container/>
                    </ParentContainer>
                </ProviderMock>
            )).toNotThrow()
        })

        it(`should call dispatch with initial action`, () => {
            const stateId = `001`
            const store = createStoreWithStates({
                [stateId]: {}
            })
            const dispatchSpy = sinon.spy(store, `dispatch`)
            const stateReducer = () => ({})

            @connectState(undefined, undefined, undefined, stateReducer)
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container stateId={stateId}/>
                </ProviderMock>
            )


            expect(dispatchSpy.withArgs({
                type: actionTypes.INIT_STATE,
                payload: {
                    stateReducer,
                    stateId
                }
            }))
        })

        it(`should call dispatch with removal action`, (done) => {
            const stateId = `001`
            const store = createStoreWithStates({
                [stateId]: {}
            })
            const dispatchSpy = sinon.spy(store, `dispatch`)
            const stateReducer = () => ({})

            @connectState(undefined, undefined, undefined, stateReducer)
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const div = document.createElement(`div`)
            ReactDOM.render(
                <ProviderMock store={store}>
                    <Container stateId={stateId}/>
                </ProviderMock>
                , div)

            ReactDOM.unmountComponentAtNode(div)

            setTimeout(() => {
                expect(dispatchSpy.withArgs({
                    type: actionTypes.REMOVE_STATE,
                    payload: {
                        stateId
                    }
                }).calledOnce).toBeTruthy()
                done()
            }, 0)
        })

        it(`should call dispatch with stateId`, () => {
            const stateId = `001`
            const store = createStoreWithStates({
                [stateId]: {
                    state: {}
                }
            })
            const dispatchSpy = sinon.spy(store, `dispatch`)
            const stateReducer = () => ({})

            @connectState(undefined, undefined, undefined, stateReducer)
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const tree = TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container stateId={stateId}/>
                </ProviderMock>
            )
            const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)

            passthrough.props.stateDispatch({
                type: `SOME_TYPE`
            })

            expect(dispatchSpy.withArgs({
                type: `SOME_TYPE`,
                meta: {
                    stateId
                }
            }).calledOnce).toBeTruthy()
        })

        it(`should not override meta field in action`, () => {
            const stateId = `001`
            const store = createStoreWithStates({
                [stateId]: {
                    state: {}
                }
            })
            const dispatchSpy = sinon.spy(store, `dispatch`)
            const stateReducer = () => ({})

            @connectState(undefined, undefined, undefined, stateReducer)
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const tree = TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container stateId={stateId}/>
                </ProviderMock>
            )
            const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)

            passthrough.props.stateDispatch({
                type: `SOME_TYPE`,
                meta: {
                    foo: `bar`
                }
            })

            expect(dispatchSpy.withArgs({
                type: `SOME_TYPE`,
                meta: {
                    foo: `bar`,
                    stateId
                }
            }).calledOnce).toBeTruthy()
        })


        it(`should pass stateId into the context`, () => {
            const stateId = `001`
            const store = createStoreWithStates({
                [stateId]: {
                    state: {}
                }
            })
            const stateReducer = () => ({})
            Passthrough.contextTypes = {
                stateId: PropTypes.string
            }

            try {

                @connectState(undefined, undefined, undefined, stateReducer)
                class Container extends Component {
                    render() {
                        return (
                            <Passthrough {...this.props}/>
                        )
                    }
                }

                const tree = TestUtils.renderIntoDocument(
                    <ProviderMock store={store}>
                        <Container stateId={stateId}/>
                    </ProviderMock>
                )

                const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)

                expect(passthrough.context.stateId).toEqual(stateId)

            } finally {
                Passthrough.contextTypes = {}
            }
        })
        
        it(`should not pass stateId into the context if this option disabled`, () => {
            const stateId = `001`
            const store = createStoreWithStates({
                [stateId]: {
                    state: {}
                }
            })
            const stateReducer = () => ({})
            Passthrough.contextTypes = {
                stateId: PropTypes.string
            }

            try {

                @connectState(undefined, undefined, undefined, stateReducer, false)
                class Container extends Component {
                    render() {
                        return (
                            <Passthrough {...this.props}/>
                        )
                    }
                }

                const tree = TestUtils.renderIntoDocument(
                    <ProviderMock store={store}>
                        <Container stateId={stateId}/>
                    </ProviderMock>
                )

                const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)

                expect(passthrough.context.stateId).toNotExist()

            } finally {
                Passthrough.contextTypes = {}
            }
        })

        it(`should work like thunk-middleware when function passed as an action`, () => {
            const stateId = `001`
            const localState = {
                foo: `bar`
            }
            const store = createStoreWithStates({
                [stateId]: {
                    state: localState
                }
            })
            const dispatchSpy = sinon.spy(store, `dispatch`)
            const stateReducer = () => ({})

            @connectState(undefined, undefined, undefined, stateReducer)
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const tree = TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container stateId={stateId}/>
                </ProviderMock>
            )
            const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)

            passthrough.props.stateDispatch((stateDispatch, _localState, _store) => {
                expect(_store).toBe(store)
                expect(_localState).toBe(_localState)

                stateDispatch({
                    type: `SOME_TYPE`
                })
            })

            expect(dispatchSpy.withArgs({
                type: `SOME_TYPE`,
                meta: {
                    stateId
                }
            }).calledOnce).toBeTruthy()
        })

        it(`should subscribe component to the store changes`, () => {
            const mapStateToProps = state => ({
                state
            })
            const mapDispatchToProps = dispatch => ({
                dispatch
            })

            const reducer = combineReducers({
                states: statesReducer
            })
            const store = createStore(reducer)
            const stateReducer = (state = ``, action = {}) => action.type === `TEST` ? (state + action.result) : state

            @connectState(mapStateToProps, mapDispatchToProps, undefined, stateReducer)
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const tree = TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container />
                </ProviderMock>
            )
            const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)

            expect(passthrough.props.state).toEqual(``)
            passthrough.props.dispatch({
                type: `TEST`,
                result: `a`
            })
            expect(passthrough.props.state).toEqual(`a`)
        })

        it(`should unsubscribe from store updates when component did unmount`, () => {
            const reducer = combineReducers({
                states: statesReducer
            })
            const store = createStore(reducer)

            const subscribe = store.subscribe
            const spy = sinon.spy()
            store.subscribe = (listener) => {
                const unsubscribe = subscribe(listener)
                return () => {
                    spy()
                    return unsubscribe()
                }
            }

            @connectState(undefined, undefined, undefined, () => null)
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const div = document.createElement(`div`)
            ReactDOM.render(
                <ProviderMock store={store}>
                    <Container />
                </ProviderMock>
                , div)

            ReactDOM.unmountComponentAtNode(div)

            expect(spy.calledOnce).toBeTruthy()
        })

        it(`should transfer updated props when dispatch fires on componentWillMount`, () => {
            const mapStateToProps = state => ({
                state
            })
            const mapDispatchToProps = dispatch => ({
                dispatch
            })

            const reducer = combineReducers({
                states: statesReducer
            })
            const store = createStore(reducer)
            const stateReducer = (state = ``, action = {}) => action.type === `TEST` ? (state + action.result) : state

            @connectState(mapStateToProps, mapDispatchToProps, undefined, stateReducer)
            class Container extends Component {
                componentWillMount() {
                    const {dispatch} = this.props

                    dispatch({
                        type: `TEST`,
                        result: `a`
                    })
                }

                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const tree = TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container />
                </ProviderMock>
            )
            const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)
            expect(passthrough.props.state).toEqual(`a`)
        })

        it(`should transfer updated props when dispatch fires on componentDidMount`, () => {
            const mapStateToProps = state => ({
                state
            })
            const mapDispatchToProps = dispatch => ({
                dispatch
            })

            const reducer = combineReducers({
                states: statesReducer
            })
            const store = createStore(reducer)
            const stateReducer = (state = ``, action = {}) => action.type === `TEST` ? (state + action.result) : state

            @connectState(mapStateToProps, mapDispatchToProps, undefined, stateReducer)
            class Container extends Component {
                componentDidMount() {
                    const {dispatch} = this.props

                    dispatch({
                        type: `TEST`,
                        result: `a`
                    })
                }

                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const tree = TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container />
                </ProviderMock>
            )
            const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)
            expect(passthrough.props.state).toEqual(`a`)
        })
        
        it(`should create 'react API'-style props for state`, () => {

            const stateId = `001`
            const state = {
                foo: `bar`
            }
            const store = createStoreWithStates({
                [stateId]: {
                    state
                }
            })

            @staty({})
            class Container extends Component {
                render() {
                    return (
                        <Passthrough {...this.props}/>
                    )
                }
            }

            const tree = TestUtils.renderIntoDocument(
                <ProviderMock store={store}>
                    <Container stateId={stateId}/>
                </ProviderMock>
            )
            const passthrough = TestUtils.findRenderedComponentWithType(tree, Passthrough)
            expect(passthrough.props.state).toEqual(state)
            expect(passthrough.props.setState).toExist()

            expect.spyOn(store, `dispatch`)
                .andCallThrough()

            passthrough.props.setState({
                foo: `baz`
            })

            const callsCount = 1
            expect(store.dispatch.calls.length).toEqual(callsCount)

            const {arguments: args} = store.dispatch.calls[ 0 ]

            expect(args[0].payload.state).toEqual({
                foo: `baz`
            })

        })
    })
})