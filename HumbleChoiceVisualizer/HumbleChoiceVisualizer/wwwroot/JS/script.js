// Función para construir la URL con el mes seleccionado
function buildApiUrl() {
    const baseUrl = document.getElementById('endpointInput').value.trim();
    const monthYear = document.getElementById('monthYearPicker').value; // Formato: "2024-07"

    if (!baseUrl) {
        return '';
    }

    if (!monthYear) {
        return baseUrl;
    }

    // Convertir "2024-07" a "july-2024"
    const [year, month] = monthYear.split('-');
    const monthNames = {
        '01': 'january', '02': 'february', '03': 'march', '04': 'april',
        '05': 'may', '06': 'june', '07': 'july', '08': 'august',
        '09': 'september', '10': 'october', '11': 'november', '12': 'december'
    };

    const monthName = monthNames[month];
    const formattedMonth = `${monthName}-${year}`;

    // Construir URL completa
    const url = new URL(baseUrl);
    url.searchParams.set('month', formattedMonth);
    url.searchParams.set('showShortFormat', 'true');
    url.searchParams.set('showFullResponse', 'true');

    return url.toString();
}

// Función para cargar desde endpoint (modificada para usar el date picker)
async function fetchFromEndpoint() {
    const errorDiv = document.getElementById('error');
    const resultsDiv = document.getElementById('results');
    const fetchBtn = document.getElementById('fetchBtn');

    // Limpiar errores previos
    errorDiv.innerHTML = '';
    resultsDiv.innerHTML = '';

    // Construir URL con el mes seleccionado
    const url = buildApiUrl();

    if (!url) {
        showError('Por favor, ingresa una URL base válida');
        return;
    }

    // Mostrar la URL que se va a usar (para debug)
    console.log('URL construida:', url);

    // Mostrar estado de carga
    fetchBtn.textContent = '⏳ Cargando...';
    fetchBtn.disabled = true;
    resultsDiv.innerHTML = '<div class="loading">Cargando bundle desde el endpoint...</div>';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('La respuesta debe contener un array "data"');
        }

        displayGames(data.data);

    } catch (error) {
        console.error('Error:', error);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Error de CORS o conexión. El endpoint debe permitir requests desde este dominio.');
        } else {
            showError('Error al cargar desde endpoint: ' + error.message);
        }

        resultsDiv.innerHTML = '';
    } finally {
        fetchBtn.textContent = '🚀 Cargar Bundle';
        fetchBtn.disabled = false;
    }
}

// Función para alternar entre entrada manual y endpoint
function toggleManualInput() {
    const manualSection = document.getElementById('manualSection');
    if (manualSection) {
        const isHidden = manualSection.style.display === 'none' || manualSection.style.display === '';
        manualSection.style.display = isHidden ? 'block' : 'none';
    }
}

// Procesar JSON manual (mantener como está, ya que funciona con URL fija)
async function processJSON() {
    const apiUrl = 'https://humblechoicescrapper.onrender.com/api/HumbleChoice/GetMothlyGames?month=july-2024&showShortFormat=true&showFullResponse=true';
    const errorDiv = document.getElementById('error');
    const resultsDiv = document.getElementById('results');

    // Limpiar errores previos
    errorDiv.innerHTML = '';
    resultsDiv.innerHTML = '';

    // Mostrar estado de carga
    resultsDiv.innerHTML = '<div class="loading">Cargando datos de la API...</div>';

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            showError('La API debe devolver un array "data"');
            return;
        }

        displayGames(data.data);

    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar desde la API: ' + error.message);
        resultsDiv.innerHTML = '';
    }
}

// Mostrar mensajes de error
function showError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
    }
}

// Mostrar los juegos en la interfaz
function displayGames(games) {
    if (games.length === 0) {
        document.getElementById('results').innerHTML =
            '<div class="bundle-info">No se encontraron juegos</div>';
        return;
    }

    // Obtener el bundleDate del primer juego
    const bundleDate = games[0]?.bundleDate || 'Fecha no disponible';

    let html = `
        <div class="bundle-info">
            <div class="bundle-date">📅 ${bundleDate}</div>
        </div>
        <div class="games-grid">
    `;

    games.forEach(game => {
        const imageHtml = game.image ?
            `<img 
                src="${game.image}" 
                alt="${game.title}" 
                class="game-image"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                loading="lazy"
            >
            <div class="image-error" style="display: none;">
                🖼️ Imagen no disponible
            </div>` :
            `<div class="image-error">
                🖼️ Sin imagen
            </div>`;

        html += `
            <div class="game-card" onclick="openGameDetails('${game.image}', '${game.title}')">
                ${imageHtml}
                <div class="game-title">${game.title}</div>
            </div>
        `;
    });

    html += '</div>';
    document.getElementById('results').innerHTML = html;
}

// Abrir detalles del juego (imagen en nueva ventana)
function openGameDetails(imageUrl, title) {
    if (imageUrl && imageUrl !== 'null') {
        window.open(imageUrl, '_blank');
    } else {
        alert(`📋 ${title}\n\n❌ No hay imagen disponible para este juego`);
    }
}

// Función para actualizar preview de URL cuando cambia el date picker (opcional)
function updateUrlPreview() {
    const url = buildApiUrl();
    console.log('URL actualizada:', url);
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Configurar endpoint por defecto
    const endpointInput = document.getElementById('endpointInput');
    if (endpointInput && !endpointInput.value) {
        endpointInput.value = 'https://humblechoicescrapper.onrender.com/api/HumbleChoice/GetMothlyGames';
    }

    // Agregar event listener al date picker para actualizar URL
    const monthPicker = document.getElementById('monthYearPicker');
    if (monthPicker) {
        monthPicker.addEventListener('change', updateUrlPreview);
    }

    // Cargar datos iniciales (opcional - puedes comentar si no quieres carga automática)
    // fetchFromEndpoint();
});