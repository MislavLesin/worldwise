import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";
/* eslint-disable react/prop-types */

const CitiesContext = createContext();
const BASE_URL = "http://localhost:9000";

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  addedNewCity: false,
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
        addedNewCity: false,
      };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "city/created": //ovdje dodat addedcity na true!
      return { ...state, isLoading: false, addedNewCity: true };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error("Unknown action type!");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, addedNewCity }, dispatch] =
    useReducer(reducer, initialState);

  useEffect(
    function () {
      async function fetchCities() {
        dispatch({ type: "loading" });
        try {
          const res = await fetch(`${BASE_URL}/cities`);
          const data = await res.json();
          dispatch({ type: "cities/loaded", payload: data });
        } catch {
          dispatch({
            type: "rejected",
            payload: "There was an error loading cities...",
          });
        }
      }
      fetchCities();
    },
    [addedNewCity]
  );

  const getCity = useCallback(
    async function getCity(id) {
      if (id === currentCity.id) return;
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading the city...",
        });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city...",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });

      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleteing the city...",
      });
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside of the CitiesProvider!");
  return context;
}

export { CitiesProvider, useCities };
