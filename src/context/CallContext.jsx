import { createContext, useState } from "react";

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
    const [calledPatient, setCalledPatient] = useState(null);

    const callPatient = (patient) => {
        setCalledPatient(patient);
    };

    return (
        <CallContext.Provider value={{ calledPatient, callPatient}}>
            {children}
        </CallContext.Provider>
    );
};