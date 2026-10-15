const API_BASE = '/api';

let tourismMap;
let sitesData = [];
let hospData = [];

document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await loadData();
});

function initMap() {
  tourismMap = L.map('tourismMap').setView([27.965, 85.715], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(tourismMap);
}

async function loadData() {
  try {
    const [sitesRes, hospRes] = await Promise.all([
      fetch(`${API_BASE}/heritage/sites`),
      fetch(`${API_BASE}/heritage/hospitality`)
    ]);

    if (sitesRes.ok) sitesData = await sitesRes.json();
    if (hospRes.ok) hospData = await hospRes.json();

    renderSites();
    renderHospitality();
    addMapMarkers();
  } catch (err) {
    console.error('Error loading tourism data:', err);
    document.getElementById('sitesGrid').innerHTML = '<div class="col-12 text-center text-danger">डेटा लोड गर्न समस्या भयो।</div>';
  }
}

function renderSites() {
  const grid = document.getElementById('sitesGrid');
  grid.innerHTML = '';

  if (!sitesData || sitesData.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center text-muted py-4">कुनै पनि पर्यटकीय क्षेत्र भेटिएन।</div>';
    return;
  }

  sitesData.forEach((site, index) => {
    // Default image if none provided
    const photoUrl = (site.photos && site.photos.length > 0) ? site.photos[0] : 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800';
    
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="site-card">
        <div class="site-img" style="background-image: url('${photoUrl}')">
          <div class="site-badge">${site.type || 'पर्यटकीय'}</div>
        </div>
        <div class="site-body d-flex flex-column" style="height: calc(100% - 220px);">
          <h4 class="site-title">${site.nameNp}</h4>
          ${site.nameEn ? `<small class="text-muted d-block mb-3">${site.nameEn}</small>` : ''}
          <p class="site-intro flex-grow-1">${site.introduction || 'विवरण उपलब्ध छैन।'}</p>
          <button class="btn-explore mt-3 w-100" onclick="showSiteModal(${index})">विस्तृत विवरण हेर्नुहोस्</button>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function renderHospitality() {
  const grid = document.getElementById('hospitalityGrid');
  grid.innerHTML = '';

  if (!hospData || hospData.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center text-muted py-4">कुनै पनि होटल/होमस्टे भेटिएन।</div>';
    return;
  }

  hospData.forEach(hosp => {
    let iconClass = 'bi-house-heart';
    if (hosp.type === 'Hotel') iconClass = 'bi-building';
    if (hosp.type === 'Resort') iconClass = 'bi-tree';

    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="hosp-card">
        <div class="hosp-icon">
          <i class="bi ${iconClass}"></i>
        </div>
        <div class="hosp-details">
          <h5>${hosp.name}</h5>
          <div class="hosp-meta mb-1">
            <span class="badge bg-light text-dark border me-1">${hosp.type}</span>
            <span class="badge bg-light text-dark border"><i class="bi bi-people-fill text-muted"></i> ${hosp.capacity || 0} जना</span>
          </div>
          ${hosp.contactNumber ? `<div class="text-muted small"><i class="bi bi-telephone-fill me-1"></i> ${hosp.contactNumber}</div>` : ''}
          ${hosp.facilities ? `<div class="text-muted small mt-1"><i class="bi bi-check2-circle me-1"></i> ${hosp.facilities}</div>` : ''}
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function addMapMarkers() {
  // Add Site markers
  sitesData.forEach(site => {
    if (site.latitude && site.longitude) {
      const marker = L.marker([site.latitude, site.longitude]).addTo(tourismMap);
      marker.bindPopup(`<b>${site.nameNp}</b><br>${site.type || 'पर्यटकीय क्षेत्र'}`);
    }
  });

  // Add Hospitality markers (with different icon color via default Leaflet options or custom divIcon)
  const hospIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#F59E0B; width:15px; height:15px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);'></div>",
    iconSize: [15, 15],
    iconAnchor: [7, 7]
  });

  hospData.forEach(hosp => {
    if (hosp.latitude && hosp.longitude) {
      const marker = L.marker([hosp.latitude, hosp.longitude], { icon: hospIcon }).addTo(tourismMap);
      marker.bindPopup(`<b>${hosp.name}</b><br>${hosp.type}`);
    }
  });
}

window.showSiteModal = function(index) {
  const site = sitesData[index];
  if (!site) return;

  document.getElementById('smTitle').innerText = site.nameNp;
  document.getElementById('smType').innerText = site.type || 'पर्यटकीय क्षेत्र';
  document.getElementById('smWard').innerText = site.wardNumber ? `वडा नं. ${site.wardNumber}` : 'वडा खुलाइएको छैन';
  
  const photoUrl = (site.photos && site.photos.length > 0) ? site.photos[0] : 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=800';
  document.getElementById('smPhoto').style.backgroundImage = `url('${photoUrl}')`;
  
  document.getElementById('smIntro').innerText = site.introduction || 'विस्तृत परिचय उपलब्ध छैन।';
  document.getElementById('smImportance').innerText = site.importance || 'विवरण उपलब्ध छैन।';

  if (site.videoUrl) {
    document.getElementById('smVideoContainer').style.display = 'block';
    document.getElementById('smVideoBtn').href = site.videoUrl;
  } else {
    document.getElementById('smVideoContainer').style.display = 'none';
  }

  const modal = new bootstrap.Modal(document.getElementById('siteModal'));
  modal.show();
};
