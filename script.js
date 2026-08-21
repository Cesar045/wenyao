const API_URL = "https://script.google.com/macros/s/AKfycbzv4ocxixYc1_oW5ThKMG0r8MBcn2RAzJa4TXT4EMTFoPLOsJumBd7bcP2DPmsZgFh5bA/exec";
// ========================================
// WENYAO - SCRIPT PRINCIPAL
// ========================================

// LISTA DE CODIGOS ESCANEADOS
let scannedCodes = [];


// ========================================
// IDIOMAS
// ========================================

function toggleLanguage() {
    const menu = document.getElementById("languageMenu");

    if (menu) {
        menu.classList.toggle("active");
    }
}


function changeLanguage(language) {

    const translations = {

        es: {
            language: "Español",
            welcome: "¡Bienvenido!",
            subtitle: "Sistema de inventario y control de productos",
            user: "Usuario: Cano",
            role: "Rol:",
            supervisor: "Supervisor"
        },

        fr: {
            language: "Français",
            welcome: "Bienvenue !",
            subtitle: "Système d'inventaire et de contrôle des produits",
            user: "Utilisateur : Cano",
            role: "Rôle :",
            supervisor: "Superviseur"
        },

        zh: {
            language: "中文",
            welcome: "欢迎！",
            subtitle: "库存和产品管理系统",
            user: "用户：Cano",
            role: "职位：",
            supervisor: "主管"
        }

    };

    const text = translations[language];

    if (!text) return;

    const selectedLanguage = document.getElementById("selectedLanguage");
    const welcomeTitle = document.getElementById("welcomeTitle");
    const welcomeText = document.getElementById("welcomeText");
    const userName = document.getElementById("userName");
    const roleText = document.getElementById("roleText");
    const roleName = document.getElementById("roleName");
    const languageMenu = document.getElementById("languageMenu");

    if (selectedLanguage) selectedLanguage.innerText = text.language;
    if (welcomeTitle) welcomeTitle.innerText = text.welcome;
    if (welcomeText) welcomeText.innerText = text.subtitle;
    if (userName) userName.innerText = text.user;
    if (roleText) roleText.innerText = text.role;
    if (roleName) roleName.innerText = text.supervisor;

    if (languageMenu) {
        languageMenu.classList.remove("active");
    }
}


// ========================================
// ABRIR PANTALLA DE ESCANEAR
// ========================================

function openScanner() {

    const homePage = document.getElementById("homePage");
    const scannerPage = document.getElementById("scannerPage");
    const footer = document.getElementById("footer");

    // Verificar que existan los elementos
    if (!homePage || !scannerPage) {
        alert("Error: No se encontró la pantalla de escaneo.");
        return;
    }

    // Ocultar inicio
    homePage.style.display = "none";

    // Ocultar footer
    if (footer) {
        footer.style.display = "none";
    }

    // Mostrar pantalla escáner
    scannerPage.style.display = "block";
    scannerPage.classList.add("active");

    // Enviar cursor al campo de código
    setTimeout(function () {
        const input = document.getElementById("barcodeInput");

        if (input) {
            input.focus();
        }
    }, 100);
}


// ========================================
// VOLVER AL INICIO
// ========================================

function closeScanner() {

    const homePage = document.getElementById("homePage");
    const scannerPage = document.getElementById("scannerPage");
    const footer = document.getElementById("footer");

    // Ocultar escáner
    if (scannerPage) {
        scannerPage.style.display = "none";
        scannerPage.classList.remove("active");
    }

    // Mostrar inicio
    if (homePage) {
        homePage.style.display = "block";
    }

    // Mostrar footer
    if (footer) {
        footer.style.display = "block";
    }
}


// ========================================
// AGREGAR CODIGO
// ========================================

function addBarcode() {

    const input = document.getElementById("barcodeInput");

    if (!input) {

        showNotification(
            "No se encontró el campo para escanear.",
            "error"
        );

        return;
    }


    const code = input.value.trim();


    // Verificar ubicación
    if (currentLocationValue === "") {

        showNotification(
            "Primero debes confirmar una ubicación.",
            "warning"
        );

        input.focus();

        return;
    }


    // No permitir vacío
    if (code === "") {

        input.focus();

        return;
    }


    // Buscar código repetido
    const existingCode =
        scannedCodes.find(function(item) {

            return (
                item.code === code &&
                item.location === currentLocationValue
            );

        });


    if (existingCode) {

        // ========================================
        // CÓDIGO DUPLICADO
        // ========================================

        showNotification(
            "Código repetido: " + code,
            "warning"
        );

        // Sonido de alerta
        playDuplicateSound();


        // Aumentar cantidad
        existingCode.quantity++;

    } else {

        // ========================================
        // NUEVO CÓDIGO
        // ========================================

        scannedCodes.push({
            location: currentLocationValue,
            code: code,
            quantity: 1,
            date: new Date().toLocaleString("es-MX"),
            user: currentUser
        });

    }


    // Limpiar campo
    input.value = "";


    // Actualizar tabla
updateTable();

// Guardar automáticamente el trabajo
saveWorkInProgress();

// Mantener cursor listo para siguiente escaneo
input.focus();

}


// ========================================
// ACTUALIZAR TABLA
// ========================================

function updateTable() {

    const table = document.getElementById("barcodeTable");

    if (!table) return;

    // Limpiar tabla
    table.innerHTML = "";

    // Crear filas
    scannedCodes.forEach(function (item, index) {

        const row = document.createElement("tr");

        const numberCell = document.createElement("td");
        numberCell.textContent = index + 1;
        const locationCell = document.createElement("td");
locationCell.textContent = item.location;

        const codeCell = document.createElement("td");
        codeCell.textContent = item.code;

        const quantityCell = document.createElement("td");
        quantityCell.textContent = item.quantity;

        const dateCell = document.createElement("td");
        dateCell.textContent = item.date;

        const userCell = document.createElement("td");
        userCell.textContent = item.user;

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.className = "delete-button";
        deleteButton.onclick = function () {
            deleteCode(index);
        };

        actionCell.appendChild(deleteButton);

        row.appendChild(numberCell);
        row.appendChild(locationCell);
        row.appendChild(codeCell);
        row.appendChild(quantityCell);
        row.appendChild(dateCell);
        row.appendChild(userCell);
        row.appendChild(actionCell);

        table.appendChild(row);
    });

    // Actualizar códigos únicos
    const uniqueCodes = document.getElementById("uniqueCodes");

    if (uniqueCodes) {
        uniqueCodes.textContent = scannedCodes.length;
    }

    // Calcular total
    let total = 0;

    scannedCodes.forEach(function (item) {
        total = total + item.quantity;
    });

    // Actualizar total
    const totalBoxes = document.getElementById("totalBoxes");

    if (totalBoxes) {
        totalBoxes.textContent = total;
    }
}


// ========================================
// ELIMINAR UN CODIGO
// ========================================

function deleteCode(index) {

    scannedCodes.splice(index, 1);

    updateTable();

    const input = document.getElementById("barcodeInput");

    if (input) {
        input.focus();
    }
}


// ========================================
// LIMPIAR TODOS LOS CODIGOS
// ========================================

function clearAll() {

    if (scannedCodes.length === 0) {
        alert("No hay códigos para eliminar.");
        return;
    }

    const confirmacion = confirm(
        "¿Estás seguro de eliminar todos los códigos escaneados?"
    );

    if (confirmacion) {

        scannedCodes = [];

        updateTable();

        const input = document.getElementById("barcodeInput");

        if (input) {
            input.focus();
        }
    }
}


// ========================================
// GUARDAR REGISTRO
// POR AHORA SOLO CONFIRMA
// ========================================

async function saveRecords() {

    if (scannedCodes.length === 0) {

        showNotification(
            "No hay códigos para guardar.",
            "warning"
        );

        return;
    }

    const saveButton =
        document.querySelector(".save-button");

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerText = "GUARDANDO...";
    }

    try {

        await fetch(
            "https://script.google.com/macros/s/AKfycbzv4ocxixYc1_oW5ThKMG0r8MBcn2RAzJa4TXT4EMTFoPLOsJumBd7bcP2DPmsZgFh5bA/exec",
            {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify({
                    registros: scannedCodes
                })
            }
        );


        // ========================================
        // ÉXITO: SONIDO DE ESTRELLAS
        // ========================================

        playSuccessSound();


        // ========================================
        // NOTIFICACIÓN BONITA
        // ========================================

        showNotification(
            "Registros enviados correctamente",
            "success"
        );


        // Limpiar registros
        scannedCodes = [];

        updateTable();


        // Limpiar ubicación
        currentLocationValue = "";


        const locationInput =
            document.getElementById("locationInput");

        const currentLocation =
            document.getElementById("currentLocation");

        const locationStatus =
            document.getElementById("locationStatus");

        const barcodeInput =
            document.getElementById("barcodeInput");

        const addButton =
            document.querySelector(".add-button");


        if (locationInput) {
            locationInput.value = "";
            locationInput.focus();
        }


        if (currentLocation) {
            currentLocation.innerText = "Sin ubicación";
        }


        if (locationStatus) {

            locationStatus.innerText =
                "⚠️ Primero confirma una ubicación";

            locationStatus.classList.remove("confirmed");
        }


        if (barcodeInput) {

            barcodeInput.value = "";
            barcodeInput.disabled = true;

            barcodeInput.placeholder =
                "Primero selecciona una ubicación...";
        }


        if (addButton) {
            addButton.disabled = true;
        }


    } catch (error) {

        console.error(
            "Error al guardar:",
            error
        );


        showNotification(
            "Ocurrió un error al guardar los registros.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.innerHTML =
                '<i class="fa-solid fa-floppy-disk"></i> GUARDAR REGISTRO';
        }
    }
}

// ========================================
// DETECTAR ENTER DEL ESCANER
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("barcodeInput");

    if (input) {

        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                addBarcode();
            }

        });
    }
});
// ========================================
// UBICACION ACTUAL
// ========================================

let currentLocationValue = "";

function confirmLocation() {

    const locationInput = document.getElementById("locationInput");
    const barcodeInput = document.getElementById("barcodeInput");
    const locationStatus = document.getElementById("locationStatus");
    const currentLocation = document.getElementById("currentLocation");
    const addButton = document.querySelector(".add-button");

    const location = locationInput.value.trim();

    if (location === "") {
        alert("⚠️ Escanea o escribe una ubicación.");
        locationInput.focus();
        return;
    }

    // Guardar ubicación
    currentLocationValue = location;

    // Mostrar ubicación
    currentLocation.innerText = location;

    // Activar escaneo de productos
    barcodeInput.disabled = false;
    barcodeInput.placeholder = "Escanea o escribe el código...";

    if (addButton) {
        addButton.disabled = false;
    }

    // Cambiar mensaje
    locationStatus.innerText = "✅ Ubicación confirmada: " + location;
    locationStatus.classList.add("confirmed");

    // Enviar cursor al escáner
    barcodeInput.focus();
}
// ========================================
// ABRIR REPORTES
// ========================================

function openReports() {

    const homePage = document.getElementById("homePage");
    const reportsPage = document.getElementById("reportsPage");
    const footer = document.getElementById("footer");

    if (!reportsPage) {
        alert("❌ No se encontró la pantalla de REPORTES.");
        return;
    }

    // Ocultar inicio
    if (homePage) {
        homePage.style.display = "none";
    }

    // Ocultar footer
    if (footer) {
        footer.style.display = "none";
    }

    // Mostrar reportes
    reportsPage.classList.add("active");

    loadReports();

    // Por ahora mostrar datos vacíos
    document.getElementById("reportTotalRecords").textContent = "0";
    document.getElementById("reportTotalProducts").textContent = "0";
    document.getElementById("reportTotalLocations").textContent = "0";
}


// ========================================
// CERRAR REPORTES
// ========================================

function closeReports() {

    const homePage = document.getElementById("homePage");
    const reportsPage = document.getElementById("reportsPage");
    const footer = document.getElementById("footer");

    // Ocultar reportes
    if (reportsPage) {
        reportsPage.classList.remove("active");
    }

    // Mostrar inicio
    if (homePage) {
        homePage.style.display = "block";
    }

    // Mostrar footer
    if (footer) {
        footer.style.display = "block";
    }
}


// ========================================
// CARGAR REPORTES
// Próximamente conectaremos Google Sheets
// ========================================

async function loadReports() {

    const reportsTable = document.getElementById("reportsTable");

    if (!reportsTable) {
        alert("❌ No se encontró la tabla de reportes.");
        return;
    }

    reportsTable.innerHTML = `
        <tr>
            <td colspan="5">⏳ Cargando registros...</td>
        </tr>
    `;

    try {

        const response = await fetch(
            "https://script.google.com/macros/s/AKfycbzv4ocxixYc1_oW5ThKMG0r8MBcn2RAzJa4TXT4EMTFoPLOsJumBd7bcP2DPmsZgFh5bA/exec"
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Error al obtener los registros");
        }

        const registros = data.registros || [];

        reportsTable.innerHTML = "";

        let totalProducts = 0;
        const locations = new Set();

        registros.forEach(function(registro) {
            totalProducts += Number(registro.quantity) || 0;

            if (registro.location) {
                locations.add(registro.location);
            }
        });

        document.getElementById("reportTotalRecords").textContent = registros.length;
        document.getElementById("reportTotalProducts").textContent = totalProducts;
        document.getElementById("reportTotalLocations").textContent = locations.size;

        if (registros.length === 0) {
            reportsTable.innerHTML = `
                <tr>
                    <td colspan="5">No hay registros guardados todavía.</td>
                </tr>
            `;
            return;
        }

        registros.forEach(function(registro) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${registro.location || ""}</td>
                <td>${registro.code || ""}</td>
                <td>${registro.quantity || 0}</td>
                <td>${registro.date || ""}</td>
                <td>${registro.user || ""}</td>
            `;

            reportsTable.appendChild(row);
        });

    } catch (error) {

        console.error(error);

        reportsTable.innerHTML = `
            <tr>
                <td colspan="5">
                    ❌ Error al cargar los registros: ${error.message}
                </td>
            </tr>
        `;
    }
}
// ========================================
// USUARIO ACTUAL
// ========================================

let currentUser = "";
let currentRole = "";


// ========================================
// INICIAR SESIÓN
// ========================================

function loginUser() {

    const loginInput = document.getElementById("loginUser");
    const roleInput = document.getElementById("loginRole");
    const loginPage = document.getElementById("loginPage");
    const loginMessage = document.getElementById("loginMessage");

    const name = loginInput.value.trim();
    const role = roleInput.value;

    if (name === "") {
        loginMessage.textContent = "⚠️ Escribe tu nombre para continuar.";
        loginInput.focus();
        return;
    }

    if (role === "") {
        loginMessage.textContent = "⚠️ Selecciona tu rol para continuar.";
        roleInput.focus();
        return;
    }

    currentUser = name;
    currentRole = role;

    loginPage.classList.add("hidden");

    const userName = document.getElementById("userName");

    if (userName) {
        userName.textContent = "Usuario: " + currentUser;
    }

    const roleName = document.getElementById("roleName");

    if (roleName) {
        roleName.textContent = currentRole;
    }

    loginMessage.textContent = "";
}

// ========================================
// ENTER PARA INGRESAR
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const loginInput = document.getElementById("loginUser");

    if (loginInput) {

        loginInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                loginUser();
            }

        });

        // Poner el cursor automáticamente
        loginInput.focus();
    }
});
function logoutUser() {

    console.log("Cerrando sesión...");

    const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");

    if (!confirmar) {
        return;
    }

    // Limpiar datos de sesión
    currentUser = "";
    currentRole = "";

    // Obtener elementos
    const loginPage = document.getElementById("loginPage");
    const loginInput = document.getElementById("loginUser");
    const roleInput = document.getElementById("loginRole");
    const loginMessage = document.getElementById("loginMessage");

    // Limpiar campos
    if (loginInput) {
        loginInput.value = "";
    }

    if (roleInput) {
        roleInput.value = "";
    }

    if (loginMessage) {
        loginMessage.textContent = "";
    }

    // Mostrar nuevamente el login
    if (loginPage) {
        loginPage.classList.remove("hidden");
    } else {
        alert("Error: No se encontró la pantalla de inicio de sesión.");
    }

    // Colocar cursor en el nombre
    setTimeout(function () {
        if (loginInput) {
            loginInput.focus();
        }
    }, 100);
}
// ========================================
// MÓDULO INVENTARIO
// ========================================

let inventoryData = [];
let inventoryLocations = [];


async function openInventory() {

    const homePage = document.getElementById("homePage");
    const inventoryPage = document.getElementById("inventoryPage");
    const footer = document.getElementById("footer");

    if (homePage) {
        homePage.style.display = "none";
    }

    if (footer) {
        footer.style.display = "none";
    }

    if (inventoryPage) {
        inventoryPage.classList.add("active");
    }

    // Mostrar usuario actual
    const inventoryUserName =
        document.getElementById("inventoryUserName");

    if (inventoryUserName && currentUser) {
        inventoryUserName.textContent =
            currentUser + " · " + currentRole;
    }
loadInventory();
}


function closeInventory() {

    const homePage = document.getElementById("homePage");
    const inventoryPage = document.getElementById("inventoryPage");
    const footer = document.getElementById("footer");

    if (inventoryPage) {
        inventoryPage.classList.remove("active");
    }

    if (homePage) {
        homePage.style.display = "";
    }

    if (footer) {
        footer.style.display = "";
    }
}

function renderInventory(locations) {

    const inventoryTable =
        document.getElementById("inventoryTable");

    if (!inventoryTable) return;

    inventoryTable.innerHTML = "";

    if (locations.length === 0) {

        inventoryTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No hay ubicaciones registradas todavía.
                </td>
            </tr>
        `;

        return;
    }


    locations.forEach(function(item) {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>
                <div class="location-cell">

                    <div class="location-icon">
                        <i class="fa-solid fa-location-dot"></i>
                    </div>

                    <strong>${item.location}</strong>

                </div>
            </td>


            <td>
    <span class="code-badge">
        ${item.codes}
    </span>
</td>


            <td>
                <strong class="quantity-value">
                    ${item.quantity}
                </strong>
            </td>


            <td>
                <button
                    class="view-location-button"
                    onclick="viewLocation('${item.location.replace(/'/g, "\\'")}')"
                >
                    Ver inventario
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </td>

        `;

        inventoryTable.appendChild(row);

    });

}


function filterInventory() {

    const searchElement =
        document.getElementById("inventorySearch");

    if (!searchElement) return;

    const search =
        searchElement.value.toLowerCase().trim();


    if (search === "") {

        renderInventory(inventoryLocations);
        return;

    }


    const filteredLocations =
    inventoryLocations.filter(function(item) {

        const location = String(item.location || "").toLowerCase();
        const codes = String(item.codes || "").toLowerCase();

        return (
            location.includes(search) ||
            codes.includes(search)
        );

    });

    renderInventory(filteredLocations);

}


// ========================================
// VER DETALLE DE UBICACIÓN
// ========================================

function viewLocation(location) {

    // Buscar los registros de la ubicación seleccionada
    const products = inventoryData.filter(function(registro) {

        return String(
            registro.location || "SIN UBICACIÓN"
        ).trim() === location;

    });

    if (products.length === 0) {
        alert("No hay productos registrados en esta ubicación.");
        return;
    }

    // Agrupar cantidades por código
    const groupedCodes = {};

    products.forEach(function(registro) {

        const code = String(
            registro.code || "SIN CÓDIGO"
        ).trim();

        const quantity =
            Number(registro.quantity) || 0;

        if (!groupedCodes[code]) {
            groupedCodes[code] = 0;
        }

        groupedCodes[code] += quantity;

    });


    // =========================
    // CALCULAR TOTALES
    // =========================

    const totalCodes =
        Object.keys(groupedCodes).length;

    let totalQuantity = 0;

    Object.keys(groupedCodes).forEach(function(code) {
        totalQuantity += groupedCodes[code];
    });


    // =========================
    // CAMBIAR DE PANTALLA
    // =========================

    const inventoryPage =
        document.getElementById("inventoryPage");

    const locationDetailPage =
        document.getElementById("locationDetailPage");

    if (inventoryPage) {
        inventoryPage.classList.remove("active");
    }

    if (locationDetailPage) {
        locationDetailPage.classList.add("active");
    }


    // =========================
    // MOSTRAR UBICACIÓN
    // =========================

    document.getElementById("locationDetailTitle").textContent =
        "UBICACIÓN: " + location;

    document.getElementById("locationDetailSubtitle").textContent =
        "Productos registrados en la ubicación " + location;

    document.getElementById("locationDetailCodes").textContent =
        totalCodes;

    document.getElementById("locationDetailQuantity").textContent =
        totalQuantity;


    // =========================
    // LLENAR TABLA
    // =========================

    const table =
        document.getElementById("locationDetailTable");

    table.innerHTML = "";

    Object.keys(groupedCodes)
        .sort(function(a, b) {
            return a.localeCompare(
                b,
                undefined,
                { numeric: true }
            );
        })
        .forEach(function(code) {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    <strong>${code}</strong>
                </td>

                <td>
                    <strong class="quantity-value">
                        ${groupedCodes[code]}
                    </strong>
                </td>
            `;

            table.appendChild(row);

        });

}


// ========================================
// VOLVER AL INVENTARIO
// ========================================

function closeLocationDetail() {

    const inventoryPage =
        document.getElementById("inventoryPage");

    const locationDetailPage =
        document.getElementById("locationDetailPage");

    // Ocultar detalle
    if (locationDetailPage) {
        locationDetailPage.classList.remove("active");
    }

    // Mostrar inventario
    if (inventoryPage) {
        inventoryPage.classList.add("active");
    }

}
// ========================================
// MÓDULO ENTRADAS / SALIDAS
// ========================================

function openMovements() {

    const homePage = document.getElementById("homePage");
    const movementsPage = document.getElementById("movementsPage");
    const footer = document.getElementById("footer");

    // Ocultar pantalla principal
    if (homePage) {
        homePage.style.display = "none";
    }

    // Ocultar footer
    if (footer) {
        footer.style.display = "none";
    }

    // Mostrar movimientos
    if (movementsPage) {
        movementsPage.classList.add("active");
    }

    // Mostrar usuario actual
    const movementsUserName =
        document.getElementById("movementsUserName");

    if (movementsUserName && currentUser) {
        movementsUserName.textContent =
            currentUser + " · " + currentRole;
    }
    loadMovements();
}


// ========================================
// CERRAR MOVIMIENTOS
// ========================================

function closeMovements() {

    const homePage = document.getElementById("homePage");
    const movementsPage = document.getElementById("movementsPage");
    const footer = document.getElementById("footer");

    // Ocultar movimientos
    if (movementsPage) {
        movementsPage.classList.remove("active");
    }

    // Mostrar inicio
    if (homePage) {
        homePage.style.display = "";
    }

    // Mostrar footer
    if (footer) {
        footer.style.display = "";
    }
}
// ========================================
// ABRIR FORMULARIO DE ENTRADA
// ========================================

function openEntryForm() {

    const movementsPage =
        document.getElementById("movementsPage");

    const entryFormPage =
        document.getElementById("entryFormPage");

    // Ocultar movimientos
    if (movementsPage) {
        movementsPage.classList.remove("active");
    }

    // Mostrar formulario
    if (entryFormPage) {
        entryFormPage.classList.add("active");
    }

    // Colocar usuario actual automáticamente
    const entryUser =
        document.getElementById("entryUser");

    if (entryUser && currentUser) {

        entryUser.value =
            currentUser + " · " + currentRole;

    }

    // Limpiar campos anteriores
    const entryCode =
        document.getElementById("entryCode");

    const entryLocation =
        document.getElementById("entryLocation");

    const entryQuantity =
        document.getElementById("entryQuantity");

    if (entryCode) entryCode.value = "";
    if (entryLocation) entryLocation.value = "";
    if (entryQuantity) entryQuantity.value = "";

    // Poner el cursor listo para escanear
    if (entryCode) {
        setTimeout(function() {
            entryCode.focus();
        }, 100);
    }

}


// ========================================
// CERRAR FORMULARIO DE ENTRADA
// ========================================

function closeEntryForm() {

    const movementsPage =
        document.getElementById("movementsPage");

    const entryFormPage =
        document.getElementById("entryFormPage");

    // Ocultar formulario
    if (entryFormPage) {
        entryFormPage.classList.remove("active");
    }

    // Volver a movimientos
    if (movementsPage) {
        movementsPage.classList.add("active");
    }

}
// ========================================
// GUARDAR ENTRADA
// ========================================

async function saveEntry() {

    const code = document.getElementById("entryCode").value.trim();
    const location = document.getElementById("entryLocation").value.trim();
    const quantity = Number(document.getElementById("entryQuantity").value);

    // Validar datos
    if (!code) {
        alert("⚠️ Escanea o escribe un código.");
        document.getElementById("entryCode").focus();
        return;
    }

    if (!location) {
        alert("⚠️ Escribe la ubicación.");
        document.getElementById("entryLocation").focus();
        return;
    }

    if (!quantity || quantity <= 0) {
        alert("⚠️ Ingresa una cantidad válida.");
        document.getElementById("entryQuantity").focus();
        return;
    }

    const user = currentUser || "Usuario";
    const role = currentRole || "";

    // Desactivar botón mientras guarda
    const saveButton = document.querySelector(".entry-save-button");

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Guardando...
        `;
    }

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveMovement",
                type: "ENTRADA",
                code: code,
                location: location,
                quantity: quantity,
                user: user,
                role: role
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error || "No se pudo guardar la entrada."
            );
        }

        alert("✅ Entrada registrada correctamente.");

        // Limpiar formulario
        document.getElementById("entryCode").value = "";
        document.getElementById("entryLocation").value = "";
        document.getElementById("entryQuantity").value = "";

        // Regresar al cursor del código
        document.getElementById("entryCode").focus();

    } catch (error) {

        console.error("Error guardando entrada:", error);

        alert(
            "❌ Error al guardar la entrada: " + error.message
        );

    } finally {

        // Reactivar botón
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Guardar entrada
            `;
        }

    }

}
// ========================================
// ABRIR FORMULARIO DE SALIDA
// ========================================

function openExitForm() {

    const movementsPage =
        document.getElementById("movementsPage");

    const exitFormPage =
        document.getElementById("exitFormPage");

    // Ocultar movimientos
    if (movementsPage) {
        movementsPage.classList.remove("active");
    }

    // Mostrar formulario de salida
    if (exitFormPage) {
        exitFormPage.classList.add("active");
    }

    // Colocar usuario actual automáticamente
    const exitUser =
        document.getElementById("exitUser");

    if (exitUser && currentUser) {
        exitUser.value =
            currentUser + " · " + currentRole;
    }

    // Limpiar campos anteriores
    const exitCode =
        document.getElementById("exitCode");

    const exitLocation =
        document.getElementById("exitLocation");

    const exitQuantity =
        document.getElementById("exitQuantity");

    if (exitCode) exitCode.value = "";
    if (exitLocation) exitLocation.value = "";
    if (exitQuantity) exitQuantity.value = "";

    // Cursor listo para escanear
    if (exitCode) {
        setTimeout(function() {
            exitCode.focus();
        }, 100);
    }
}


// ========================================
// CERRAR FORMULARIO DE SALIDA
// ========================================

function closeExitForm() {

    const movementsPage =
        document.getElementById("movementsPage");

    const exitFormPage =
        document.getElementById("exitFormPage");

    // Ocultar formulario
    if (exitFormPage) {
        exitFormPage.classList.remove("active");
    }

    // Volver a movimientos
    if (movementsPage) {
        movementsPage.classList.add("active");
    }
}
// ========================================
// GUARDAR SALIDA
// ========================================

async function saveExit() {

    const code = document.getElementById("exitCode").value.trim();
    const location = document.getElementById("exitLocation").value.trim();
    const quantity = Number(document.getElementById("exitQuantity").value);

    // VALIDACIONES
    if (!code) {
        alert("⚠️ Escanea o escribe un código.");
        document.getElementById("exitCode").focus();
        return;
    }

    if (!location) {
        alert("⚠️ Escribe la ubicación.");
        document.getElementById("exitLocation").focus();
        return;
    }

    if (!quantity || quantity <= 0) {
        alert("⚠️ Ingresa una cantidad válida.");
        document.getElementById("exitQuantity").focus();
        return;
    }

    const user = currentUser || "Usuario";
    const role = currentRole || "";

    // BOTÓN
    const saveButton = document.querySelector(".exit-save-button");

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Verificando...
        `;
    }

    try {

        // Enviar salida a Apps Script
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "saveExit",
                type: "SALIDA",
                code: code,
                location: location,
                quantity: quantity,
                user: user,
                role: role
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error || "No se pudo registrar la salida."
            );
        }

        alert(
            "✅ Salida registrada correctamente.\n\n" +
            "Disponible restante: " + data.available
        );

        // Limpiar formulario
        document.getElementById("exitCode").value = "";
        document.getElementById("exitLocation").value = "";
        document.getElementById("exitQuantity").value = "";

        // Regresar al código para seguir escaneando
        document.getElementById("exitCode").focus();

    } catch (error) {

        console.error("Error guardando salida:", error);

        alert("❌ " + error.message);

    } finally {

        // Reactivar botón
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = `
                <i class="fa-solid fa-arrow-up"></i>
                Guardar salida
            `;
        }

    }

}
// ========================================
// CARGAR HISTORIAL DE MOVIMIENTOS
// ========================================

async function loadMovements() {

    const tableBody = document.getElementById("movementsTable");

    if (!tableBody) return;

    // Mostrar mensaje mientras carga
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                Cargando movimientos...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "getMovements"
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error || "No se pudieron cargar los movimientos."
            );
        }

        // Si no hay movimientos
        if (!data.movements || data.movements.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Aún no hay movimientos registrados.
                    </td>
                </tr>
            `;

            return;
        }

        // Limpiar tabla
        tableBody.innerHTML = "";
// ========================================
// CALCULAR RESUMEN DEL DÍA
// ========================================

let todayEntries = 0;
let todayExits = 0;
let todayProducts = 0;

// Fecha de hoy en formato dd/MM/yyyy
const now = new Date();

const today =
    String(now.getDate()).padStart(2, "0") + "/" +
    String(now.getMonth() + 1).padStart(2, "0") + "/" +
    now.getFullYear();

data.movements.forEach(function(movement) {

    // Tomar solamente movimientos de hoy
    const movementDate = String(movement.date || "").substring(0, 10);

    if (movementDate === today) {

        const quantity = Number(movement.quantity) || 0;

        if (movement.type === "ENTRADA") {
            todayEntries++;
        }

        if (movement.type === "SALIDA") {
            todayExits++;
        }

        todayProducts += quantity;
    }

});
// ========================================
// ACTUALIZAR TARJETAS
// ========================================

const entriesElement =
    document.getElementById("todayEntries");

const exitsElement =
    document.getElementById("todayExits");

const productsElement =
    document.getElementById("todayMovedProducts");

const lastMovementElement =
    document.getElementById("lastMovement");

const lastMovementTextElement =
    document.getElementById("lastMovementText");

if (entriesElement) {
    entriesElement.textContent = todayEntries;
}

if (exitsElement) {
    exitsElement.textContent = todayExits;
}

if (productsElement) {
    productsElement.textContent = todayProducts;
}


// ========================================
// ÚLTIMO MOVIMIENTO
// ========================================

if (data.movements.length > 0) {

    const last = data.movements[0];

    const lastTime =
        String(last.date || "").split(" ")[1] || "--:--";

    if (lastMovementElement) {
        lastMovementElement.textContent = lastTime;
    }

    if (lastMovementTextElement) {
        lastMovementTextElement.textContent =
            last.type + " · " +
            last.code + " · " +
            last.location;
    }

}
        // Agregar movimientos
        data.movements.forEach(function(movement) {

            const row = document.createElement("tr");

            const typeClass =
                movement.type === "ENTRADA"
                    ? "movement-entry-badge"
                    : "movement-exit-badge";

            const typeIcon =
                movement.type === "ENTRADA"
                    ? "fa-arrow-down"
                    : "fa-arrow-up";

            row.innerHTML = `
                <td>
                    <span class="movement-type-badge ${typeClass}">
                        <i class="fa-solid ${typeIcon}"></i>
                        ${movement.type}
                    </span>
                </td>

                <td>${movement.code}</td>

                <td>${movement.location}</td>

                <td>${movement.quantity}</td>

                <td>
                    ${movement.user}
                    ${movement.role ? `<small>${movement.role}</small>` : ""}
                </td>

                <td>${movement.date}</td>
            `;

            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error("Error cargando movimientos:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:#c62828;">
                    ❌ Error al cargar movimientos
                </td>
            </tr>
        `;
    }
}
// ========================================
// CARGAR INVENTARIO ACTUAL
// ========================================

async function loadInventory() {

    const inventoryContainer =
        document.getElementById("inventoryList");

    const inventoryTable =
        document.getElementById("inventoryTable");

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "getInventory"
            })
        });

        const data = await response.json();

        console.log("Respuesta getInventory:", data);

        if (!data.success) {
            throw new Error(
                data.error || "No se pudo cargar el inventario."
            );
        }

        const inventory = data.inventory || [];

        console.log("Inventario recibido:", inventory);

        // ========================================
        // CALCULAR TOTALES
        // ========================================

        const uniqueCodes = new Set();
        const uniqueLocations = new Set();
        let totalQuantity = 0;

        inventory.forEach(function(item) {

            const code = String(item.code || "").trim();
            const location = String(item.location || "").trim();
            const quantity = Number(item.quantity) || 0;

            if (code) {
                uniqueCodes.add(code);
            }

            if (location) {
                uniqueLocations.add(location);
            }

            totalQuantity += quantity;

        });


        // ========================================
        // ACTUALIZAR RESUMEN
        // ========================================

        const totalProducts =
            document.getElementById("inventoryTotalProducts");

        const totalQuantityElement =
            document.getElementById("inventoryTotalQuantity");

        const totalLocations =
            document.getElementById("inventoryTotalLocations");

        const locationCount =
            document.getElementById("inventoryLocationCount");

        if (totalProducts) {
            totalProducts.textContent = uniqueCodes.size;
        }

        if (totalQuantityElement) {
            totalQuantityElement.textContent = totalQuantity;
        }

        if (totalLocations) {
            totalLocations.textContent = uniqueLocations.size;
        }

        if (locationCount) {
            locationCount.textContent = uniqueLocations.size;
        }


        // ========================================
        // GUARDAR DATOS PARA BÚSQUEDA
        // ========================================

        window.inventoryData = inventory;


        // ========================================
        // LLENAR TABLA POR UBICACIÓN
        // ========================================

        if (inventoryTable) {

            const locations = {};

            inventory.forEach(function(item) {

                const location =
                    String(item.location || "").trim();

                const code =
                    String(item.code || "").trim();

                const quantity =
                    Number(item.quantity) || 0;

                if (!location) {
                    return;
                }

                if (!locations[location]) {
                    locations[location] = {
                        codes: [],
                        totalQuantity: 0
                    };
                }

                if (code) {
                    locations[location].codes.push(code);
                }

                locations[location].totalQuantity += quantity;

            });


            inventoryTable.innerHTML = "";


            if (Object.keys(locations).length === 0) {

                inventoryTable.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align:center;">
                            No hay inventario disponible.
                        </td>
                    </tr>
                `;

            } else {

                Object.keys(locations)
                    .sort(function(a, b) {
                        return a.localeCompare(
                            b,
                            undefined,
                            { numeric: true }
                        );
                    })
                    .forEach(function(location) {

                        const locationData =
                            locations[location];

                        const codesText =
                            locationData.codes.join(", ");

                        const row =
                            document.createElement("tr");

                        row.innerHTML = `
                            <td>
                                <div class="location-cell">
                                    <div class="location-icon">
                                        <i class="fa-solid fa-location-dot"></i>
                                    </div>

                                    <strong>${location}</strong>
                                </div>
                            </td>

                            <td>
                                <span class="code-badge">
                                    ${codesText || "-"}
                                </span>
                            </td>

                            <td>
                                <strong class="quantity-value">
                                    ${locationData.totalQuantity}
                                </strong>
                            </td>

                            <td>
                                <button
    type="button"
    class="view-location-button"
    onclick="window.viewLocationInventory('${location}'); return false;"
>
                                    Ver inventario
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </td>
                        `;

                        inventoryTable.appendChild(row);

                    });

            }

        }


        // ========================================
        // LLENAR LISTA DE TARJETAS SI EXISTE
        // ========================================

        if (inventoryContainer) {

            inventoryContainer.innerHTML = "";

            if (inventory.length === 0) {

                inventoryContainer.innerHTML = `
                    <div class="inventory-empty">
                        <i class="fa-solid fa-box-open"></i>
                        <h3>No hay inventario disponible</h3>
                        <p>Registra una entrada para comenzar.</p>
                    </div>
                `;

            } else {

                inventory.forEach(function(item) {

                    const card =
                        document.createElement("div");

                    card.className = "inventory-card";

                    card.innerHTML = `
                        <div class="inventory-card-icon">
                            <i class="fa-solid fa-box"></i>
                        </div>

                        <div class="inventory-card-info">

                            <span class="inventory-card-code">
                                ${item.code}
                            </span>

                            <span class="inventory-card-location">
                                <i class="fa-solid fa-location-dot"></i>
                                ${item.location}
                            </span>

                        </div>

                        <div class="inventory-card-quantity">
                            <strong>${item.quantity}</strong>
                            <span>Disponible</span>
                        </div>
                    `;

                    inventoryContainer.appendChild(card);

                });

            }

        }

    } catch (error) {

        console.error(
            "Error cargando inventario:",
            error
        );

        if (inventoryTable) {

            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        Error al cargar inventario.
                    </td>
                </tr>
            `;

        }

    }

}
// ========================================
// VER DETALLE DE INVENTARIO POR UBICACIÓN
// ========================================

function viewLocationInventory(location) {

    // Verificar que ya tengamos inventario cargado
    const inventory = window.inventoryData || [];

    // Filtrar productos de la ubicación seleccionada
    const products = inventory.filter(function(item) {
        return String(item.location).trim() === String(location).trim();
    });

    if (products.length === 0) {
        alert("No hay productos disponibles en esta ubicación.");
        return;
    }

    // Crear ventana emergente
    const modal = document.createElement("div");

    modal.className = "inventory-detail-modal";

    modal.innerHTML = `
        <div class="inventory-detail-content">

            <div class="inventory-detail-header">

                <div>
                    <span class="inventory-detail-label">
                        INVENTARIO POR UBICACIÓN
                    </span>

                    <h2>
                        <i class="fa-solid fa-location-dot"></i>
                        ${location}
                    </h2>

                    <p>
                        ${products.length} producto${products.length !== 1 ? "s" : ""} disponible${products.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <button
                    class="inventory-detail-close"
                    onclick="this.closest('.inventory-detail-modal').remove()"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>


            <div class="inventory-detail-table-container">

                <table class="inventory-detail-table">

                    <thead>
                        <tr>
                            <th>CÓDIGO</th>
                            <th>CANTIDAD DISPONIBLE</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${products.map(function(item) {
                            return `
                                <tr>
                                    <td>
                                        <span class="inventory-detail-code">
                                            ${item.code}
                                        </span>
                                    </td>

                                    <td>
                                        <strong>
                                            ${item.quantity}
                                        </strong>
                                    </td>
                                </tr>
                            `;
                        }).join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

}
 window.viewLocationInventory=viewLocationInventory;

 // ========================================
// FLUJO DE ESCANEO PARA PDA - ENTRADAS
// ========================================

function setupEntryScannerFlow() {

    const codeInput =
        document.getElementById("entryCode");

    const locationInput =
        document.getElementById("entryLocation");

    const quantityInput =
        document.getElementById("entryQuantity");


    if (!codeInput || !locationInput || !quantityInput) {
        return;
    }


    // Al terminar de escanear el código con ENTER
    codeInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            if (codeInput.value.trim() !== "") {
                locationInput.focus();
                locationInput.select();
            }

        }

    });


    // Al terminar de escanear la ubicación con ENTER
    locationInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            if (locationInput.value.trim() !== "") {
                quantityInput.focus();
                quantityInput.select();
            }

        }

    });


    // ENTER en cantidad = guardar
    quantityInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            if (
                codeInput.value.trim() !== "" &&
                locationInput.value.trim() !== "" &&
                Number(quantityInput.value) > 0
            ) {
                saveEntry();
            }

        }

    });

}


// Activar flujo cuando cargue la aplicación
document.addEventListener(
    "DOMContentLoaded",
    setupEntryScannerFlow
);
// ========================================
// SONIDO DE ÉXITO - ESTRELLAS
// ========================================

function playSuccessSound() {

    const sound = new Audio(
        "Sonido de estrella - Lizbeth Valenzuela olguin (1).mp3"
    );

    sound.volume = 0.7;

    sound.play().catch(function(error) {

        console.log(
            "No se pudo reproducir el sonido:",
            error
        );

    });

}
// ========================================
// NOTIFICACIONES WENYAO
// ========================================

function showNotification(message, type = "success") {

    let notification =
        document.getElementById("wenyaoNotification");


    // Crear notificación si no existe
    if (!notification) {

        notification =
            document.createElement("div");

        notification.id =
            "wenyaoNotification";

        document.body.appendChild(notification);
    }


    let icon =
        "fa-circle-check";


    if (type === "error") {

        icon =
            "fa-circle-xmark";

    } else if (type === "warning") {

        icon =
            "fa-triangle-exclamation";

    }


    notification.className =
        "wenyao-notification " + type;


    notification.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;


    notification.classList.add("show");


    clearTimeout(
        window.notificationTimer
    );


    window.notificationTimer =
        setTimeout(function() {

            notification.classList.remove("show");

        }, 3000);

}
function playDuplicateSound() {

    console.log("🔊 Intentando reproducir sonido duplicado");

    const sound = new Audio(
        "./Sonido de Noup - Sonidos.mp3"
    );

    sound.volume = 1.0;
    sound.currentTime = 0;

    sound.play()
        .then(function() {
            console.log(
                "✅ Sonido duplicado reproduciéndose"
            );
        })
        .catch(function(error) {
            console.error(
                "❌ Error reproduciendo sonido duplicado:",
                error
            );
        });

}


    try {

        const workData =
            JSON.parse(savedWork);

        // Recuperar códigos
        if (
            Array.isArray(workData.scannedCodes)
        ) {

            scannedCodes =
                workData.scannedCodes;

        }

        // Recuperar ubicación
        if (workData.currentLocationValue) {

            currentLocationValue =
                workData.currentLocationValue;

        }

        // Actualizar tabla
        updateTable();

        // Restaurar ubicación visualmente
        const currentLocation =
            document.getElementById("currentLocation");

        const locationStatus =
            document.getElementById("locationStatus");

        const locationInput =
            document.getElementById("locationInput");

        const barcodeInput =
            document.getElementById("barcodeInput");

        const addButton =
            document.querySelector(".add-button");


        if (
            currentLocation &&
            currentLocationValue
        ) {

            currentLocation.innerText =
                currentLocationValue;

        }


        if (
            locationInput &&
            currentLocationValue
        ) {

            locationInput.value =
                currentLocationValue;

        }


        if (
            locationStatus &&
            currentLocationValue
        ) {

            locationStatus.innerText =
                "✓ Ubicación recuperada";

            locationStatus.classList.add(
                "confirmed"
            );

        }


        // Habilitar escáner nuevamente
        if (
            barcodeInput &&
            currentLocationValue
        ) {

            barcodeInput.disabled = false;

            barcodeInput.placeholder =
                "Escanea el siguiente código...";

            barcodeInput.focus();

        }


        if (addButton && currentLocationValue) {

            addButton.disabled = false;

        }


        // Mostrar mensaje
        if (
            scannedCodes.length > 0 ||
            currentLocationValue
        ) {

            showNotification(
                "Trabajo anterior recuperado",
                "success"
            );

        }

    