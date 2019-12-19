# rxw
a tool package for organization actions, reduce method in react redux

## Goal
keep action creation, reduce operation at the same place, avoid to pass action creation function by props or 'mapDispatchToProps'

## How to use by *ToDos* example

### 1. Define actions and state reduce function

todo_actions.js
```js

const TodoActions = {
    stateName: "todos",
    initState: [],
    idCount: 0, 
    
    addTodo: {
        type: 'ADD_TODO',
        reduce: (state, action) => { 
            TodoActions.idCount += 1;
            return [...state, { id: TodoActions.idCount, text: action.text, completed: false}];
        },
        // action creation function, just use function() {} style
        // DON'T use => lambda expression for 'this' will be 'undefined'
        action: function (text) { return {type: this.type, text: text }; }
    },

    deleteTodo: {
        type: 'DELETE_TODO',
        reduce: function (state, action) { 
            return [
            ...state.slice(0, action.index),
            ...state.slice(action.index+1, state.length)]; 
        },
        action: function (index) { return {type: this.type, index: index }; }
    },

    toggleTodo: {
        type: 'TOOGLE_TODO',
        reduce: function (state, action) {
            return state.map((todo, index) => {
                if (index === action.index) {
                    return Object.assign({}, todo, {completed: !todo.completed});
                }
                return todo;
            });
        },
        action: function (index) { return {type: this.type, index: index }; }
    },
};

export default TodoActions;
```

visible_actions.js
```js

const VisibleActions = {
    stateName: "visible",
    initState: 'all',
    
    setVisible: {
        type: 'SET_VISIBLE',
        reduce: (state, action) => { 
            return action.filter;
        },
        action: function (filter) { 
            return {type: this.type, filter: filter }; 
        }
    },
};

export default VisibleActions;
```

`stateName` and `initState` is used to create init state in `state` object. 
`todo_actions.js` and `visible_actions.js` will create a `state` like this:
```json
{
    "todos" : [],     /* from todo_actions.js */
    "visible" : "all" /* from visible_actions.js */
}
```

### 2. Use actions in components
app.js
```js
import React, { useState } from 'react';
import { Provider, connect } from 'react-redux';
import TodoActions from './todo_actions';
import VisibleActions from './visible_actions';
import createStoreFromActions from 'rxw';

// auto create store from actions define
let store = createStoreFromActions([VisibleActions, TodoActions]);

function _Item(props) {
    const { index, todo, dispatch } = props;

    return (<li>
        <p>{todo.text} {todo.completed ? 'completed' : 'processing'}
        <button onClick={() => { dispatch(TodoActions.toggleTodo.action(index)); }}>
            toggle
        </button>
        <button onClick={() => { dispatch(TodoActions.deleteTodo.action(index)); }}>
            delete
        </button>
        </p>
    </li>);
}

function _ItemList(props) {
    const { todos } = props;
    return (<ul>
        { todos.map((todo, i) => <Item key={todo.id} index={i} todo={todo} ></Item>) }
        </ul>);
}

function _AddButton(props) {
    const { dispatch } = props;
    const [input, setinput] = useState('');
    const [select, setSelect] = useState('all');
    const handleInputChange = (e) => { setinput(e.target.value); };
    const handleSelectChange = (e) => { 
        setSelect(e.target.value); 
        dispatch(VisibleActions.setVisible.action(e.target.value));
    };
    const handleClick = () => { 
        dispatch(TodoActions.addTodo.action(input));
        setinput(''); };
    return (
        <>
            <input value={input} onChange={handleInputChange}></input>
            <button onClick={handleClick}>+</button>
            <select value={select} onChange={handleSelectChange}>
                <option value='all'>all</option>
                <option value='completed'>completed</option>
                <option value='process'>process</option>
            </select>
        </>
    );
}


function diapatchMap(dispatch) {
    return { dispatch: dispatch };
}

const AddButton = connect(null, diapatchMap)(_AddButton);

const Item = connect(null, diapatchMap)(_Item);

const ItemList = connect(
    state => {
        // get `visible` from state use `VisibleActions.stateName`
        switch(state[VisibleActions.stateName]) {
            case 'all':
                // direct use state.todos
                return { todos: state.todos };
            case 'completed':
                return { todos: state.todos.filter(t => t.completed) };
            case 'process':
                return { todos: state.todos.filter(t => !t.completed)};
            default:
                return { todos: state.todos };
        }
    },
)(_ItemList)

class App extends React.Component {

    render() {
        return (
            <Provider store={store}>
                <AddButton/>
                <ItemList/>
            </Provider>
        );
    }
}

export default App;
```
