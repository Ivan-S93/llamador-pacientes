import { useContext } from "react";
import { CallContext } from "../context/CallContext";

export default function WaitingRoom() {
    const { calledPatient } = useContext(CallContext);

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "#003366",
                color: "white",
                fontSize: "2rem",
            }}
        >
            <h1> Sala de Espera </h1>
            {calledPatient  ? (
                <>
                    <p>Paciente llamado: </p>
                    <h2>
                        {calledPatient.nombre} {calledPatient.apellido}    
                    </h2>
                    <h3>CI: {calledPatient.cinro}</h3>    
                </>  
            ) : (
                <p>Esperando próximo paciente ...</p>
            )}
        </div>
    );
}