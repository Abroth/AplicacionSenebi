document.getElementById('generateTableBtn').addEventListener('click', generateTable);
document.getElementById('downloadExcelBtn').addEventListener('click', downloadExcel);
document.getElementById('resetCounterBtn').addEventListener('click', resetCounter);

// ── Tema según plazo ──
function applyTheme(plazo) {
    document.body.classList.remove('theme-CI', 'theme-24');
    document.body.classList.add('theme-' + plazo);
    document.getElementById('plazoBadge').textContent = plazo;
}

// Aplicar tema inicial y escuchar cambios
applyTheme(document.getElementById('plazoSelect').value);
document.getElementById('plazoSelect').addEventListener('change', function () {
    applyTheme(this.value);
});

// Función para obtener el último índice del local storage
function getLastIndex() {
    return parseInt(localStorage.getItem('lastIndex')) || 0;
}

// Función para establecer el último índice en el local storage
function setLastIndex(index) {
    localStorage.setItem('lastIndex', index);
}

// Función para resetear el contador
function resetCounter() {
    localStorage.removeItem('lastIndex');
    alert('Contador reseteado.');
}

// Función para obtener el contador diario
function getDailyCounter() {
    const today = new Date().toLocaleDateString();
    const counterData = JSON.parse(localStorage.getItem('dailyCounter')) || {};
    if (counterData.date !== today) {
        counterData.date = today;
        counterData.counter = 0;
    }
    return counterData;
}

// Función para establecer el contador diario
function setDailyCounter(counterData) {
    localStorage.setItem('dailyCounter', JSON.stringify(counterData));
}

function generateTable() {
    const inputText = document.getElementById('inputText').value;
    const tableContainer = document.getElementById('tableContainer');

    // Limpiar el contenedor de la tabla anterior
    tableContainer.innerHTML = '';

    // Crear la tabla
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Crear cabecera de la tabla
    const headers = ['ID', 'OPERACION', 'INSTRUMENTO', 'PLAZO', 'PRECIO', 'CANTIDAD', 'CONTRAPARTE', 'COMITENTE', 'CARTERA PROPIA', 'MERCADO'];
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Procesar el texto de entrada
    const lines = inputText.split('\n').filter(line => line.trim() !== '');

    let lastIndex = getLastIndex();

    lines.forEach((line, index) => {
        const row = document.createElement('tr');
        const plazoSelected = document.getElementById('plazoSelect').value;
        const cells = parseLine(line, plazoSelected);

        if (cells.length > 0) {
            // Agregar el índice al inicio
            const indexCell = document.createElement('td');
            indexCell.textContent = lastIndex + 1; // Incrementar el índice
            row.appendChild(indexCell);

            // Agregar las celdas de datos
            cells.forEach((cell, cellIndex) => {
                const td = document.createElement('td');
                if (headers[cellIndex] === 'PRECIO') {
                    const formattedText = cell.replace('.', '#').replace(',', '.').replace('#', ',');
                    td.textContent = formattedText;
                } else if(headers[cellIndex] === 'PLAZO') {
                    const formattedText = cell.replace('.', '#').replace(',', '.').replace('#', ',');
                    td.textContent = formattedText;
                } else {
                    td.textContent = cell;
                }
                row.appendChild(td);
            });

            const statusCell = document.createElement('td');
            statusCell.textContent = 'NO GARANTIZADO';
            row.appendChild(statusCell);

            tbody.appendChild(row);

            lastIndex++;
        }
    });

    setLastIndex(lastIndex);

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function parseLine(line, plazo) {
    const compraVentaMatch = line.match(/(\d+)\s+(compra|vende|venta)\s+a\s+([\d,.]+)\s+([\d,.]+)\s+(\w+)\s+@\s+([\d,.]+)/i);
    if (compraVentaMatch) {
        const [ , cantidad, tipoTransaccion, precioTransaccion, cantidad2, activo, precio ] = compraVentaMatch;
        const tipoTransaccionNormalized = tipoTransaccion.toLowerCase() === 'compra' ? 'COMPRA' : 'VENTA';
        const cantidad2Clean = cantidad2.replace(/\./g, '');
        return [
            tipoTransaccionNormalized,
            activo,
            plazo,
            precio,
            cantidad2Clean,
            '',
            precioTransaccion,
            cantidad
        ];
    }
    return [];
}

function downloadExcel() {
    const tableContainer = document.getElementById('tableContainer');
    const table = tableContainer.querySelector('table');

    if (!table) {
        alert('Primero genera la tabla.');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const now = new Date();
    const date = now.toLocaleDateString().replace(/\//g, '-');

    const counterData = getDailyCounter();
    counterData.counter += 1;
    setDailyCounter(counterData);

    const fileName = `Operaciones Senebi Quantex ${String(counterData.counter).padStart(2, '0')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
