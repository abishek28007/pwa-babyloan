import React, {createContext, useReducer} from 'react';

const initialState = {
    key: "value"
};
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ( { children } ) => {
  const [state, dispatch] = useReducer((state, action) => {
      switch (action.type) {
          case "SET_CITY_BFR": {
              return {
                  ...state,
                  key: "world"
              };
          }
          default:
              // throw new Error();
            //   console.log(action.type);
              return state;
      };
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider }