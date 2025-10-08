const API_URL = "http://localhost:4000";

export async function getPacientes() {
    const res = await fetch(`${API_URL}/pacientes`);
    return res.json();
}


export async function addPaciente(data) {
    const res = await fetch(`${API_URL}/pacientes` , {
        method: "POST" ,
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(data),
    });
    return res.json();
}