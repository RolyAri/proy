let productos;
let centroCostos;
let usuarios;
let selectedRowsSet = new Set(); // Conjunto para almacenar las filas seleccionadas

const userInput = document.getElementById("usuario");
const inputFecha = document.getElementById("fecha");
const ccInput = document.getElementById("centroCostos");

const fecha = new Date();

inputFecha.value = formatDate(fecha);

let fechaValue;
let userValue;
let ccValue;

const options = document.getElementById('centroCostos');
const form_poductos = document.querySelector("#form_productos tbody");

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

fetch("acciones.php?action=getProductos",{
    method: 'GET'
}).then(response => response.json())
.then(data => {
    productos = data;
    /* productos.forEach((p, index) => {
        form_poductos.innerHTML += `
            <tr>
                <td>${p.ccodprod}</td>
                <td>${p.cdesprod}</td>
            </tr>`;
    }) */
    iniciarPaginador(productos);
})

fetch("acciones.php?action=getCentroCostos",{
    method: 'GET'
}).then(response => response.json())
.then(data => {
    centroCostos = data;
    centroCostos.forEach(p => {
        options.innerHTML+=`<option value="${p.nidreg}">${p.ccodproy} - ${p.cdesproy}</option>`
        /* selectOptions.innerHTML+=`<div class="option" id-cc="${p.nidreg}">${p.ccodproy} - ${p.cdesproy}</div>`; */
    });
    
    
})

fetch("acciones.php?action=getUsuarios",{
    method: 'GET'
}).then(response => response.json())
.then(data => {
    usuarios = data;
})

function validarUsuario(user){
    let found = false;
    usuarios.forEach(u => {
        if(user == u.cnameuser){
            found = true
        }
    })
    document.getElementById("usuario").classList.toggle('notFound', !found);
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("btn_add");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "flex";
  modal.style.alignItems = "center";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function iniciarPaginador(data) {
    const content = document.querySelector('.container-prod');
    let itemsPerPage = 25; // Valor por defecto
    let currentPage = 0;
    const maxVisiblePages = 10; // Número máximo de botones visibles

    // Convertir los datos a filas de tabla
    const items = data.map(item => {
        return `<tr data-id="${item.id_cprod}">
            <td>${item.ccodprod}</td> <!-- Cambia 'id' y 'name' según tu estructura de datos -->
            <td>${item.cdesprod}</td>
        </tr>`;
    });

    // Mostrar una página específica
    function showPage(page) {
        const startIndex = page * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const visibleItems = items.slice(startIndex, endIndex);
        
        // Mostrar los elementos en la tabla
        content.innerHTML = `
            <table class="table" id="data_productos">
                <thead>
                    <tr><th>Código</th><th>Descripción</th></tr>
                </thead>
                <tbody>${visibleItems.join('')}</tbody>
            </table>
        `;

         // Restaurar las selecciones
         restoreSelections();

         const modalTable = document.getElementById('data_productos');
         modalTable.addEventListener('click', function (event) {
             const row = event.target.closest('tr');
             if (row) {
                 const id = row.getAttribute('data-id'); // Usamos el atributo data-id para identificar las filas
                 row.classList.toggle('selected');
 
                 if (row.classList.contains('selected')) {
                     selectedRowsSet.add(id); // Añadir al conjunto de filas seleccionadas
                 } else {
                     selectedRowsSet.delete(id); // Quitar del conjunto si se deselecciona
                 }
             }
         });

        updateActiveButtonStates();
        createPageButtons();
    }

    function restoreSelections() {
        const modalTableRows = document.querySelectorAll('#data_productos tbody tr');
        modalTableRows.forEach(row => {
            const id = row.getAttribute('data-id');
            if (selectedRowsSet.has(id)) {
                row.classList.add('selected');
            }
        });
    }

    // Crear los botones de paginación y el selector de elementos por página
    function createPageButtons() {
        const totalPages = Math.ceil(items.length / itemsPerPage);
        let paginationContainer = document.querySelector('.pagination');

        // Si el contenedor de paginación no existe, crearlo
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.classList.add('pagination');
            content.appendChild(paginationContainer);
        } else {
            // Limpiar el contenedor existente
            paginationContainer.innerHTML = '';
        }

        // Crear el selector para elementos por página
        const itemsPerPageSelect = document.createElement('select');
        const options = [5, 10, 15, 25, 50, 100];

        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            if (option === itemsPerPage) opt.selected = true; // Establecer 5 como seleccionado por defecto
            itemsPerPageSelect.appendChild(opt);
        });

        // Agregar evento al selector
        itemsPerPageSelect.addEventListener("change", function() {
            itemsPerPage = parseInt(this.value); // Actualizar el número de elementos por página
            currentPage = 0; // Reiniciar a la primera página
            createPageButtons();
            showPage(currentPage);
        });

        paginationContainer.appendChild(itemsPerPageSelect); // Agregar el selector al contenedor de paginación

        // Botón "Primera"
        const firstButton = document.createElement('button');
        firstButton.textContent = 'Primera';
        firstButton.disabled = currentPage === 0;
        firstButton.addEventListener('click', () => {
            currentPage = 0;
            showPage(currentPage);
        });
        paginationContainer.appendChild(firstButton);

        // Botón "Anterior"
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.disabled = currentPage === 0;
        prevButton.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                showPage(currentPage);
            }
        });
        paginationContainer.appendChild(prevButton);

        // Mostrar botones limitados
        const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages);

        for (let i = startPage; i < endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i + 1;
            pageButton.disabled = i === currentPage; // Deshabilitar botón si es la página actual
            pageButton.classList.toggle('active', i === currentPage); // Agregar la clase 'active' si es la página actual
            pageButton.addEventListener('click', () => {
                currentPage = i;
                showPage(currentPage);
            });

            paginationContainer.appendChild(pageButton);
        }

        // Botón "Siguiente"
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.disabled = currentPage === totalPages - 1;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                showPage(currentPage);
            }
        });
        paginationContainer.appendChild(nextButton);

        // Botón "Última"
        const lastButton = document.createElement('button');
        lastButton.textContent = 'Última';
        lastButton.disabled = currentPage === totalPages - 1;
        lastButton.addEventListener('click', () => {
            currentPage = totalPages - 1;
            showPage(currentPage);
        });
        paginationContainer.appendChild(lastButton);
    }

    // Actualizar los estados activos de los botones de paginación
    function updateActiveButtonStates() {
        const pageButtons = document.querySelectorAll('.pagination button');
        pageButtons.forEach((button, index) => {
            // Remover clase 'active' de todos los botones
            button.classList.remove('active');
            // Si el botón es el de la página actual, agregar la clase 'active'
            if (parseInt(button.textContent) === currentPage + 1) {
                button.classList.add('active');
            }
        });
    }

    // Inicializar la paginación
    createPageButtons();
    showPage(currentPage); // Mostrar la primera página
}

function buscar(cadena){
    /* let filteredItems = productos.filter(item => {
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(cadena)
        );
    }); */
    let filteredItems = productos.filter(item => {
        return Object.values(item).some(value => 
            value !== null && value !== undefined && value.toString().toLowerCase().includes(cadena.toLowerCase())
        );
    });
    iniciarPaginador(filteredItems);
    /* currentPage = 0;
    createPageButtons();
    showPage(currentPage); */
    /* iniciarPaginador(filteredItems); */
}

let cont = 0;
// Función para agregar filas seleccionadas al índice
document.getElementById('add_data').addEventListener('click', function () {
    const selectedRows = [...selectedRowsSet]; // Convertir el Set a array para iterar
    if (selectedRows.length > 0) {
        const indexTable = document.querySelector('#data_form tbody');
        selectedRows.forEach(id => {
            const product = productos.find(p => p.id_cprod === id);
            if (product) {
                const newRow = indexTable.insertRow();
                newRow.insertCell(0).textContent = ++cont;
                newRow.insertCell(1).textContent = product.ccodprod;
                newRow.insertCell(2).textContent = product.cdesprod;
                newRow.insertCell(3).innerHTML = `<input type="number" class="cantidad" id="${product.id_cprod}" placeholder="Digite cantidad">`;
                newRow.insertCell(4).innerHTML = `<td><button class="btn btn-danger" onclick="eliminar(this)">Eliminar<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg></button></td>`
                
                // Añadir más celdas según sea necesario
            }
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Ningún item seleccionado",
            text: "Seleccione al menos un item para poder agregarla"
        });
    }
    selectedRowsSet = new Set();
    iniciarPaginador(productos)
    modal.style.display = "none";
});

let detalle = [];
document.getElementById("btn_grabar").addEventListener('click', function() {
    const content = document.querySelector('#data_form');
    const items = Array.from(content.getElementsByTagName('tr')).slice(1);
    const valueInputs = Array.from(content.querySelectorAll('tr .cantidad'));
    fechaValue = inputFecha.value;
    userValue = userInput.value;
    ccValue = parseInt(ccInput.value);
    items.forEach((i, index) => {
        const valueFila = `${i.innerText}\t${valueInputs[index].value}\t${valueInputs[index].id}`
        const partes = valueFila.split('\t');

        const filaJson = {
            codprod: partes[1],
            idprod: partes[6],
            desprod: partes[2],
            cantprod: parseInt(partes[5]),
            numdoc: userValue,
            fecha: fechaValue,
            centrocosto: ccValue
        };
        detalle.push(filaJson);
    })
    console.log(detalle)
    let sendValidation;
    if(detalle.length > 0){
        detalle.forEach(d => {
            if(d.cantprod <= 0 || isNaN(d.cantprod) || d.numdoc.trim() == "" || d.fecha == "" || d.centroCosto == 0 ){
                sendValidation = false;
            }        
        })
    }
    

    if(sendValidation==false){
        if(inputFecha.value == "" || ccInput.value == 0 || userInput.value.trim()==""){
            let msg = "";
            inputFecha.value == "" ? msg+=" [Fecha]" : "";
            ccInput.value == 0 ? msg+=" [Centro de Costos]" : "";
            userInput.value.trim() == "" ? msg+=" [DNI]" : ""; 
            Swal.fire({
                icon: "error",
                title: "Campos necesarios",
                text: "Por favor revise los campos:"+ msg
            });
        }else {
            Swal.fire({
                icon: "error",
                title: "Agregue una cantidad",
                text: "Agregar cantidades mayores a 0"
            });
        }
        /* detalle = []; */
        
    }else if(userInput.value.length < 8){
        Swal.fire({
            icon: "error",
            title: "DNI no válido",
            text: "Por favor, digite un DNI válido de 8 digitos"
        });
    }else{
        fetch("acciones.php?action=saveDetalle",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(detalle)
        }).then(response => response.json())
        .then(data => {
            if(data.success){
                Swal.fire({
                    icon: "success",
                    title: "Registro exitoso",
                    text: "Los registros se han guardado exitosamente"
                });
                eliminarTodasLasFilas();
            }else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al procesar los registros, intente nuevamente"
                });
            }
        })
        
    }
    detalle = [];
});

function eliminar(Id) {
    Swal.fire({
        title: "¿Estás seguro de eliminar el item?",
        confirmButtonText: "Si, Eliminar",
        showDenyButton: true,
        denyButtonText: "No, Cancelar"
      }).then((result) => { 
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            let row = Id.parentNode.parentNode;
            let table = document.getElementById("data_form"); 
            table.deleteRow(row.rowIndex);
          Swal.fire("Item Eliminado!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("No se eliminó el item", "", "info");
        }
      });
  
    
  
};

function eliminarTodasLasFilas() {
    let table = document.getElementById("data_form");
    let rowCount = table.rows.length;
  
    // Bucle para eliminar las filas, comenzando desde abajo
    for (let i = rowCount - 1; i > 0; i--) {
      table.deleteRow(i);
    }
}
document.getElementById("btn_limpiar").addEventListener('click', function() {
    
    Swal.fire({
        title: "¿Estás seguro de eliminar todos los items?",
        confirmButtonText: "Si, Eliminar",
        showDenyButton: true,
        denyButtonText: "No, Cancelar"
      }).then((result) => { 
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            eliminarTodasLasFilas();
          Swal.fire("Items Eliminados!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("No se eliminó ningún item", "", "info");
        }
      });
})

function validarDNI() {
    let input = document.getElementById("usuario");
    let errorMensaje = document.getElementById("errorDNI");
    let dangerIcon = document.getElementById("danger-icon");

    if (input.value.length !== 8) {
        // Mostrar el mensaje de error si la longitud no es de 8
        errorMensaje.style.display = "block";
        dangerIcon.style.display = "block"
    } else {
        // Ocultar el mensaje si es válido
        errorMensaje.style.display = "none";
        dangerIcon.style.display = "none"
    }
}
let reporte;
document.getElementById("btn_excel").addEventListener('click', function() {
    const fech= new Date();
    fetch("acciones.php?action=getReporte",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({fecha: formatDate(fech)})
    }).then(response => response.json())
    .then(data => {
        /* reporte = data; */
        let dataConCabeceras = data.map(row => ({
            'ID Producto': row.nidprod,
            'Código Producto': row.ccodprod,
            'Descripción': row.cdesprod,
            'Cantidad': row.ncantprod,
            'Número Documento': row.cnumdoc,
            'Fecha': row.dfecha,
            'ID Proyecto': row.nidproy,
            'Codigo de Centro de Costos': row.ccodproy,
            'Descripción de Centro de Costos' : row.cdesproy
        }));
        filename=`Reporte ${formatDate(fech)}.xlsx`;
        var ws = XLSX.utils.json_to_sheet(dataConCabeceras);
        ws['!cols'] = [
            { wpx: 100 }, // ID Producto (ancho en píxeles)
            { wpx: 150 }, // Código Producto
            { wpx: 300 }, // Descripción
            { wpx: 80 },  // Cantidad
            { wpx: 150 }, // Número Documento
            { wpx: 100 }, // Fecha
            { wpx: 120 },  // ID Proyecto
            { wpx: 150 },  // Codigo Proyecto
            { wpx: 300 }  // Descripcion Proyecto
        ];

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
        XLSX.writeFile(wb,filename);
    })

            
     
})
/* const customSelect = document.querySelector('.custom-select');
const selectPlaceholder = document.querySelector('.select-placeholder');
const selectOptions = document.querySelector('.select-options');
const options = document.querySelectorAll('.option');

// Toggle the options list on click
customSelect.addEventListener('click', () => {
    selectOptions.style.display = selectOptions.style.display === 'block' ? 'none' : 'block';
});

// Handle option selection
options.forEach(option => {
    option.addEventListener('click', (event) => {
        // Update placeholder text
        selectPlaceholder.textContent = event.target.textContent;

        // Highlight selected option
        options.forEach(opt => opt.classList.remove('selected'));
        event.target.classList.add('selected');

        // Hide the options list
        selectOptions.style.display = 'none';
    });
});

// Close options list if clicked outside
document.addEventListener('click', (event) => {
    if (!customSelect.contains(event.target)) {
        selectOptions.style.display = 'none';
    }
});
 */

