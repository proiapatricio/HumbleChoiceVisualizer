// Variable global para almacenar datos en memoria
let gameDataCache = {
    data: [],
    originalData: [],
    lastQuery: '',
    isFiltered: false
};

// Función para guardar datos en caché
function saveToCache(data, query) {
    gameDataCache.data = [...data];
    gameDataCache.originalData = [...data];
    gameDataCache.lastQuery = query;
    gameDataCache.isFiltered = false;

    console.log(`Datos guardados en caché: ${data.length} juegos`);

    // Mostrar contador de juegos en caché y sección de búsqueda
    updateCacheInfo();
    showSearchSection();
}

// Función para actualizar información del caché
function updateCacheInfo() {
    const cacheInfo = document.getElementById('cacheInfo');
    if (cacheInfo && gameDataCache.data.length > 0) {
        const totalGames = gameDataCache.originalData.length;
        const currentGames = gameDataCache.data.length;
        const isFiltered = gameDataCache.isFiltered;

        cacheInfo.innerHTML = `
            <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; font-size: 14px;">
                💾 <strong>En caché:</strong> ${totalGames} juegos total
                ${isFiltered ? `| 🔍 <strong>Filtrados:</strong> ${currentGames} juegos` : ''}
                | 📅 <strong>Última consulta:</strong> ${gameDataCache.lastQuery}
            </div>
        `;
        cacheInfo.style.display = 'block';
    } else if (cacheInfo) {
        cacheInfo.style.display = 'none';
    }
}

// Función para mostrar/ocultar sección de búsqueda
function showSearchSection() {
    const searchSection = document.getElementById('searchSection');
    if (searchSection) {
        searchSection.style.display = gameDataCache.data.length > 0 ? 'block' : 'none';
    }
}

// Función para buscar en los datos cacheados
function searchInCache() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!searchTerm) {
        // Si no hay término de búsqueda, mostrar todos los datos originales
        gameDataCache.data = [...gameDataCache.originalData];
        gameDataCache.isFiltered = false;
    } else {
        // Filtrar por título que contenga el término de búsqueda
        gameDataCache.data = gameDataCache.originalData.filter(game =>
            game.title.toLowerCase().includes(searchTerm)
        );
        gameDataCache.isFiltered = true;
    }

    updateCacheInfo();
    displayGames(gameDataCache.data);
}

// Función para limpiar caché
function clearCache() {
    gameDataCache = {
        data: [],
        originalData: [],
        lastQuery: '',
        isFiltered: false
    };

    updateCacheInfo();
    showSearchSection();
    document.getElementById('results').innerHTML = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    console.log('Caché limpiado');
}

// Función para alternar entre inputs de fecha según el tipo de endpoint
function toggleDateInputs() {
    const endpointType = document.getElementById('endpointType').value;
    const singleDateSection = document.getElementById('singleDateSection');
    const rangeDateSection = document.getElementById('rangeDateSection');
    const endpointInput = document.getElementById('endpointInput');

    if (endpointType === 'monthly') {
        // Mostrar solo un date picker para bundle mensual
        singleDateSection.style.display = 'block';
        rangeDateSection.style.display = 'none';
        endpointInput.value = 'https://humblechoicescrapper.onrender.com/api/HumbleChoice/GetMothlyGames';
    } else if (endpointType === 'range') {
        // Mostrar dos date pickers para rango entre fechas
        singleDateSection.style.display = 'none';
        rangeDateSection.style.display = 'block';
        endpointInput.value = 'https://humblechoicescrapper.onrender.com/api/HumbleChoice/GetAllGamesBetweenDates';
    }

    updateUrlPreview();
}

// Función para construir la URL según el tipo de endpoint seleccionado
function buildApiUrl() {
    const endpointType = document.getElementById('endpointType').value;
    const baseUrl = document.getElementById('endpointInput').value.trim();

    if (!baseUrl) {
        return '';
    }

    const url = new URL(baseUrl);

    if (endpointType === 'monthly') {
        // Endpoint de bundle mensual específico
        const monthYear = document.getElementById('monthYearPicker').value;

        if (monthYear) {
            const [year, month] = monthYear.split('-');
            const monthNames = {
                '01': 'january', '02': 'february', '03': 'march', '04': 'april',
                '05': 'may', '06': 'june', '07': 'july', '08': 'august',
                '09': 'september', '10': 'october', '11': 'november', '12': 'december'
            };

            const monthName = monthNames[month];
            const formattedMonth = `${monthName}-${year}`;

            url.searchParams.set('month', formattedMonth);
            url.searchParams.set('showShortFormat', 'true');
            url.searchParams.set('showFullResponse', 'true');
        }
    } else {
        // Endpoint de rango entre fechas
        const startDate = document.getElementById('startDatePicker').value;
        const endDate = document.getElementById('endDatePicker').value;

        if (startDate && endDate) {
            const formatDate = (dateValue) => {
                const [year, month] = dateValue.split('-');
                const monthNames = {
                    '01': 'january', '02': 'february', '03': 'march', '04': 'april',
                    '05': 'may', '06': 'june', '07': 'july', '08': 'august',
                    '09': 'september', '10': 'october', '11': 'november', '12': 'december'
                };
                const monthName = monthNames[month];
                return `${monthName}-${year}`;
            };

            url.searchParams.set('startDate', formatDate(startDate));
            url.searchParams.set('endDate', formatDate(endDate));
            url.searchParams.set('showShortFormat', 'true');
        }
    }

    return url.toString();
}

// Función para actualizar preview de URL
function updateUrlPreview() {
    const url = buildApiUrl();
    const preview = document.getElementById('urlPreview');
    if (preview) {
        preview.textContent = url || 'Configura los parámetros para ver la URL';
    }
    console.log('URL actualizada:', url);
}

// Función para cargar desde endpoint (modificada para usar el date picker y caché)
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
        showError('Por favor, configura los parámetros de fecha');
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

        // ✅ Guardar en caché después de cargar exitosamente
        saveToCache(data.data, url);

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

        // ✅ Guardar en caché después de cargar exitosamente
        saveToCache(data.data, apiUrl);

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

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Configurar event listeners para todos los inputs
    const monthPicker = document.getElementById('monthYearPicker');
    const startDatePicker = document.getElementById('startDatePicker');
    const endDatePicker = document.getElementById('endDatePicker');
    const endpointType = document.getElementById('endpointType');

    if (monthPicker) {
        monthPicker.addEventListener('change', updateUrlPreview);
    }

    if (startDatePicker) {
        startDatePicker.addEventListener('change', updateUrlPreview);
    }

    if (endDatePicker) {
        endDatePicker.addEventListener('change', updateUrlPreview);
    }

    if (endpointType) {
        endpointType.addEventListener('change', updateUrlPreview);
    }

    // Configurar estado inicial
    toggleDateInputs();
    updateUrlPreview();

    // Ocultar sección de búsqueda al inicio
    showSearchSection();

    // Cargar datos iniciales (opcional)
    // fetchFromEndpoint();
});