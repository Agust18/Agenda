var inputDni = document.querySelector(".inputDni");
var inputNombre = document.querySelector(".inputNombre");
var inputEmail = document.querySelector(".inputEmail");
var inputTelefono = document.querySelector(".inputTelefono");
var horarios = document.querySelector(".horarios");
var cargarUser = document.querySelector(".cargarUser");
var selectUser = document.querySelector(".selectUser");
var inputAsunto = document.querySelector(".asunto");
var cargarReunion = document.querySelector(".reunion");
var tablaAgenda = document.querySelector(".tablaAgenda tbody");
var personas = [];
   
var agenda = {
    "08:00": [],
    "09:00": [],
    "10:00": [],
    "11:00": [],
    "12:00": [],
    "13:00": [],
    "14:00": [],
    "15:00": [],
    "16:00": [],
    "17:00": [],
    "18:00": [],
}

cargarUser.addEventListener("click",function(){
    var valorDni = inputDni.value;
	var valorNombre = inputNombre.value;
	var valorEmail = inputEmail.value;
	var valorTelefono = parseInt(inputTelefono.value);

    if (valorDni==""){
        alert("Porfavor ingrese su Dni")
        return false
    }
    if (valorNombre==""){
        alert("Porfavor ingrese su nombre")
        return false
    }
    if (valorEmail==""){
        alert("Porfavor ingrese su email")
        return false
    }
    if (valorTelefono==""){
        alert("Porfavor ingrese su telefono")
        return false
    }


  
       
    
    
    if (isNaN(valorTelefono)){
        alert("El telefono debe ser un numero")
        return false
    }
   
    

    if (personas[valorDni] === undefined) {		
		personas[valorDni] = {
            "dni": valorDni,
            "nombre" : valorNombre,
            "email" : valorEmail,
            "telefono" : valorTelefono,
			
		}
    }
    seleccionarUser();
    console.log(personas)
})

function seleccionarUser(){
    selectUser.innerHTML="";
    for (valorDni in personas){
        selectUser.innerHTML+= `<option>${valorDni}</option>`
    }

}

cargarReunion.addEventListener("click", function() {
    var horario = horarios.value;
    var asunto = inputAsunto.value;
    var persona = selectUser.value;
    var personaCompleta = personas[persona];

    // Verificar si el horario está ocupado
    if (agenda[horario] && agenda[horario].length > 0) {
        alert("El horario ya está ocupado");
        return false;
    }

    // Verifica si el horario fue seleccionado
    if (horario == "") {
        alert("Debe seleccionar un horario");
        return false;
    }

    // Verifica si el asunto fue ingresado
    if (asunto == "") {
        alert("Debe ingresar un asunto");
        return false;
    }

    // Realiza la llamada a Google Apps Script
    fetch("https://script.google.com/macros/s/AKfycbybmprrqDm0UKRm1UxT_Qgl6ow9gJya0bztTsdBGeHPAiWLIVGN2RWHL55oLoWFdWle/exec", {
        method: "POST",
        body: JSON.stringify({
            dni: personaCompleta.dni,
            nombre: personaCompleta.nombre,
            email: personaCompleta.email,
            telefono: personaCompleta.telefono,
            horario: horario,
            asunto: asunto
        }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        // Si la respuesta es exitosa, actualiza el horario en la agenda
        if (data.status === "success") {
            agenda[horario] = {
                "asunto": asunto,
                "persona": persona,
                "datos": personaCompleta
            };

            // Deshabilita el horario seleccionado en el HTML
            let option = horarios.querySelector(`option[value="${horario}"]`);
            if (option) {
                option.disabled = true;
            }

            // Actualiza la tabla con los nuevos datos
            mostrartabla();

            // Guarda el horario deshabilitado en el localStorage
            let horariosOcupados = JSON.parse(localStorage.getItem("horariosOcupados")) || [];
            horariosOcupados.push(horario);
            localStorage.setItem("horariosOcupados", JSON.stringify(horariosOcupados));
        } else {
            alert("Error al guardar los datos: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Hubo un error al procesar la solicitud.");
    });
});

// Cargar el estado de los horarios deshabilitados al recargar la página
window.onload = function() {
    // Recuperar los horarios ocupados de localStorage
    var horariosOcupados = JSON.parse(localStorage.getItem("horariosOcupados")) || [];

    // Deshabilitar los horarios ocupados en el select
    horariosOcupados.forEach(function(horario) {
        let option = horarios.querySelector(`option[value="${horario}"]`);
        if (option) {
            option.disabled = true;
        }
    });
};

// Función para actualizar la tabla de agenda
function mostrartabla() {
    tablaAgenda.innerHTML = ""; // Vacía la tabla antes de actualizarla

    for (var horario in agenda) {
        var selechorario = agenda[horario];
        var dni = selechorario['persona'];
        var personaCompleta = personas[dni];

        if (!selechorario) {
            tablaAgenda.innerHTML += `
            <tr>
                <td>-</td>
                <td>${horario}</td>
                <td>-</td>
            </tr>
            `;
        } else {
            tablaAgenda.innerHTML += `
            <tr>
                <td>${personaCompleta['dni']}</td>
                <td>${personaCompleta['nombre']}</td>
                <td>${personaCompleta['email']}</td>
                <td>${personaCompleta['telefono']}</td>
                <td>${horario}</td>
                <td>${selechorario['asunto']}</td>
            </tr>
            `;
        }
    }
}
