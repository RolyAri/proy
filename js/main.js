let productos;
let centroCostos;
let usuarios;
let selectedRowsSet = new Set(); // Conjunto para almacenar las filas seleccionadas

const userInput = document.getElementById("usuario");
const inputFecha = document.getElementById("fecha");
const ccInput = document.getElementById("centroCostos");

const fecha = new Date();
console.log(formatDate(fecha))

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
    console.log(data);
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
    console.log(centroCostos);
    centroCostos.forEach(p => {
        options.innerHTML+=`<option value="${p.nidreg}">${p.ccodproy} - ${p.cdesproy}</option>`
    });
    
    
})

fetch("acciones.php?action=getUsuarios",{
    method: 'GET'
}).then(response => response.json())
.then(data => {
    usuarios = data;
    console.log(usuarios)
    console.log("cargado")
})

function validarUsuario(user){
    let found = false;
    usuarios.forEach(u => {
        if(user == u.cnameuser){
            found = true
        }
    })
    document.getElementById("usuario").classList.toggle('notFound', !found);
    console.log(found)
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("btn_add");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
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
                newRow.insertCell(3).innerHTML = `<input type="text" class="cantidad" value="0" id="${product.id_cprod}">`;
                
                // Añadir más celdas según sea necesario
            }
        });
    } else {
        alert('No hay filas seleccionadas');
    }
    selectedRowsSet = new Set();
    iniciarPaginador(productos)
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
        const valueFila = `${i.innerText}${valueInputs[index].value}\t${valueInputs[index].id}`
        const partes = valueFila.split('\t');
        console.log(valueFila)

        const filaJson = {
            codprod: partes[1],
            idprod: partes[4],
            desprod: partes[2],
            cantprod: parseInt(partes[3]),
            numdoc: userValue,
            fecha: fechaValue,
            centrocosto: ccValue
        };
        console.log(filaJson);
        detalle.push(filaJson);
    })
    /* console.log(items) */
    console.log(items.length);
    console.log(detalle);
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
        }else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al procesar los registros, intente nuevamente"
            });
        }
    })
    detalle = [];
});