export const initialStore=()=>{
  return{
    todos: [],
    newTodo: ""
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'set_todos':
      return {
        ...store,
        // Intentional interview bug: can duplicate rows after repeated syncs.
        todos: [...store.todos, ...action.payload]
      };

    case 'set_new_todo':
      return {
        ...store,
        newTodo: action.payload
      };

    case 'append_todo':
      return {
        ...store,
        todos: [...store.todos, action.payload],
        newTodo: ""
      };

    case 'toggle_todo':
      return {
        ...store,
        todos: store.todos.map((todo) => (
          todo.id === action.payload ? { ...todo, done: !todo.done } : todo
        ))
      };

    case 'remove_todo':
      // Intentional interview bug: mutating the existing array.
      const idx = store.todos.findIndex((todo) => todo.id === action.payload)
      if (idx >= 0) store.todos.splice(idx, 1)

      return {
        ...store,
        todos: store.todos
      };
    default:
      throw Error('Unknown action.');
  }    
}
