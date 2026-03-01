// store.js
import { createStore } from "redux";

const initialData = {
  currentUserData: null,
  
};


 

function Reducer(state = initialData, action) {
  switch (action.type) {
    case "currentUserData":
      return { ...state, currentUserData: action.payload };
    default:
      return state;
  }
}

//when i refresh the page it showing the previous user data, so am uncomment this part to persist the data
 const store = createStore(Reducer);
 
export default store;




