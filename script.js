async function loadPlants(language = 'en') {
    try {
        const response = await fetch(`data${language === 'es' ? '_es' : ''}.json`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading plants:', error);
        return [];
    }
}

function createPlantCard(plant, labels) {
    const card = document.createElement('div');
    card.className = 'plant-card';

    const image = document.createElement('img');
    image.className = 'plant-image';
    image.src = `images/${plant['image_name']}`;
    image.alt = plant['Crop Name'];
    image.onerror = () => {
        image.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f5f7f5"%3E%3C/rect%3E%3Ctext x="50" y="50" font-family="Arial" font-size="14" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    };

    card.appendChild(image);

    const info = document.createElement('div');
    info.className = 'plant-info';

    const name = document.createElement('h2');
    name.className = 'plant-name';
    name.textContent = plant['Crop Name'];

    const details = document.createElement('div');
    details.className = 'plant-details';

    const plantDetails = [
        [labels.plantingWindow, plant['Planting Window']],
        [labels.daysToHarvest, plant['Days to Harvest']],
        [labels.footprint, plant['Footprint']],
        [labels.height, plant['Height']],
        [labels.plantingMethod, plant['Planting Method']],
        [labels.sunRequirement, plant['Some Shade OK']]
    ].filter(([_, value]) => value && value.trim());

    details.innerHTML = plantDetails
        .map(([label, value]) => `<p><strong>${label}:</strong> ${value.trim()}</p>`)
        .join('');

    const family = document.createElement('div');
    family.className = 'plant-family';
    family.textContent = plant['Plant Family'];

    info.appendChild(name);
    info.appendChild(details);
    info.appendChild(family);
    card.appendChild(info);

    card.addEventListener('click', () => showPlantDetails(plant, labels));

    return card;
}

function filterPlants(plants, searchTerm) {
    return plants.filter(plant =>
        plant['Crop Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant['Plant Family'].toLowerCase().includes(searchTerm.toLowerCase())
    );
}

async function loadCompanionInfo(language = 'en') {
    try {
        const response = await fetch(`companions${language === 'es' ? '_es' : ''}.json`);
        const data = await response.json();
        return data['Plant Families Companion Info'];
    } catch (error) {
        console.error('Error loading companion info:', error);
        return {};
    }
}

function showPlantDetails(plant, labels) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
        <img src="images/${plant['image_name']}" alt="${plant['Crop Name']}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
        <h2>${plant['Crop Name']}</h2>
        <div class="modal-details">
            <div class="detail-item">
                <span class="detail-label">${labels.plantFamily}:</span>
                <span>${plant['Plant Family']}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${labels.plantingWindow}:</span>
                <span>${plant['Planting Window']}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${labels.daysToHarvest}:</span>
                <span>${plant['Days to Harvest']}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${labels.footprint}:</span>
                <span>${plant['Footprint']}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${labels.height}:</span>
                <span>${plant['Height']}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${labels.plantingMethod}:</span>
                <span>${plant['Planting Method']}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${labels.sunRequirement}:</span>
                <span>${plant['Some Shade OK']}</span>
            </div>
        </div>
        <div class="companion-info-section">
            <button class="companion-info-toggle" onclick="toggleCompanionInfo(this)">
                <span>${labels.familyInfo || 'Family Information'}</span>
                <span class="toggle-icon">▼</span>
            </button>
            <div class="companion-info-content" style="display: none;">
                <div id="companionInfoDetails">Loading...</div>
            </div>
        </div>
    `;

    modalOverlay.style.display = 'flex';
    loadCompanionInfo(document.documentElement.lang || 'en')
        .then(companionInfo => {
            const familyInfo = companionInfo[plant['Plant Family']];
            if (familyInfo) {
                const companionDetails = document.getElementById('companionInfoDetails');
                companionDetails.innerHTML = `
                    <div class="companion-detail">
                        <h3>${labels.wateringNeeds || 'Watering Needs'}</h3>
                        <p>${familyInfo['Watering Needs']}</p>
                    </div>
                    <div class="companion-detail">
                        <h3>${labels.commonPests || 'Common Pests'}</h3>
                        <ul>
                            ${familyInfo['Common Pests'].map(pest => `<li>${pest}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="companion-detail">
                        <h3>${labels.goodCompanions || 'Good Companions'}</h3>
                        <p>${Array.isArray(familyInfo['Good Companions']) ? familyInfo['Good Companions'].join(', ') : familyInfo['Good Companions']}</p>
                    </div>
                    <div class="companion-detail">
                        <h3>${labels.badCompanions || 'Bad Companions'}</h3>
                        <p>${Array.isArray(familyInfo['Bad Companions']) ? familyInfo['Bad Companions'].join(', ') : familyInfo['Bad Companions']}</p>
                    </div>
                    <div class="companion-detail">
                        <h3>${labels.otherInfo || 'Other Information'}</h3>
                        <p>${familyInfo['Other Info']}</p>
                    </div>
                `;
            } else {
                document.getElementById('companionInfoDetails').innerHTML = 
                    `<p class="no-info-message">${labels.noFamilyInfo || 'No family information available.'}</p>`;
            }
        });
}

function toggleCompanionInfo(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.toggle-icon');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
    }
}

function initializeApp(labels, popularPlantNames) {
    document.addEventListener('DOMContentLoaded', async () => {
        const plants = await loadPlants(labels.language);
        const plantsGrid = document.getElementById('plantsGrid');
        const searchInput = document.getElementById('searchInput');
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');

        const popularPlants = plants.filter(plant =>
            popularPlantNames.includes(plant['Crop Name'])
        ).slice(0, 12);

        function renderPlants(filteredPlants) {
            filteredPlants.sort((a, b) => a['Crop Name'].localeCompare(b['Crop Name']));
            plantsGrid.innerHTML = '';
            filteredPlants.forEach(plant => {
                plantsGrid.appendChild(createPlantCard(plant, labels));
            });
        }

        renderPlants(popularPlants);

        searchInput.addEventListener('input', (e) => {
            const filteredPlants = filterPlants(plants, e.target.value);
            renderPlants(filteredPlants);
        });

        modalClose.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    });
}