const API_BASE = 'http://localhost:3000/api';

window.loadProfileData = async function() {
  const fyDropdown = document.getElementById('profileFiscalYear');
  const fiscalYear = fyDropdown ? fyDropdown.value : '';
  
  try {
    const url = `${API_BASE}/municipality/profile${fiscalYear ? '?fiscalYear=' + encodeURIComponent(fiscalYear) : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      
      // Hero Section
      document.getElementById('heroNameNp').innerText = data.nameNp || 'पाँचपोखरी थाङपाल गाउँपालिका';
      document.getElementById('heroLocation').innerText = `${data.district}, ${data.province}, नेपाल`;

      // Quick Stats
      document.getElementById('statPop').innerText = data.totalPopulation ? data.totalPopulation.toLocaleString() : '--';
      document.getElementById('statHouse').innerText = data.totalHouseholds ? data.totalHouseholds.toLocaleString() : '--';
      document.getElementById('statSchool').innerText = data.totalSchools || '--';
      document.getElementById('statWard').innerText = data.wardCount || '--';

      // Overview
      document.getElementById('overviewText').innerText = data.introduction || 'विवरण उपलब्ध छैन।';

      // Key Info
      document.getElementById('infoArea').innerText = data.areaSqKm ? `${data.areaSqKm}` : '--';
      document.getElementById('infoGeo').innerText = data.geography || '--';
      document.getElementById('infoRiver').innerText = data.majorRivers || '--';
      document.getElementById('infoTourism').innerText = data.majorTouristSites || '--';

      // AI Summary
      if (document.getElementById('aiSummaryText')) {
        document.getElementById('aiSummaryText').innerText = data.aiSummary || 'AI Summary उपलब्ध छैन।';
      }

      // Good Practices
      if (document.getElementById('goodPracticesList') && data.goodPractices) {
        let gpContent = '';
        data.goodPractices.forEach(gp => {
          gpContent += `<div class="mb-3">
            <h6 class="text-dark fw-bold m-0"><i class="bi bi-check-circle-fill text-success me-2"></i>${gp.title}</h6>
            <small class="text-muted ms-4">${gp.desc}</small>
          </div>`;
        });
        document.getElementById('goodPracticesList').innerHTML = gpContent;
      }

    } else {
      console.error('Failed to fetch profile data');
      document.getElementById('heroNameNp').innerText = 'सर्भरसँग सम्पर्क हुन सकेन';
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
    document.getElementById('heroNameNp').innerText = 'सर्भर त्रुटि';
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfileData();

  try {
    // Load Sectors
    const secRes = await fetch(`${API_BASE}/municipality/sectors`);
    if (secRes.ok) {
      const sectors = await secRes.json();
      sectors.forEach(s => {
        let content = `<p>${s.description}</p>`;
        if(s.stats) {
          content += '<ul>' + Object.entries(s.stats).map(([k,v]) => `<li><b>${k}:</b> ${v}</li>`).join('') + '</ul>';
        }
        if(s.highlights) {
          content += '<p><strong>मुख्य कुराहरू:</strong></p><ul>' + s.highlights.map(h => `<li>${h}</li>`).join('') + '</ul>';
        }

        if (s.sectorName === 'Education') document.getElementById('eduContent').innerHTML = content;
        if (s.sectorName === 'Health') document.getElementById('healthContent').innerHTML = content;
        if (s.sectorName === 'Tourism') document.getElementById('tourismContent').innerHTML = content;
      });
    }

    // Initialize Leaflet Map
    initProfileMap();

    // Initialize Annual Comparison Chart
    initAnnualChart();

  } catch (err) {
    console.error('Error fetching sectors:', err);
  }
});

function initProfileMap() {
  const map = L.map('profileMap').setView([27.965, 85.715], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // Add dummy markers for Wards/Tourist Sites
  L.marker([27.965, 85.715]).addTo(map).bindPopup('<b>Ward 1 Center</b><br>Bhotang');
  L.marker([27.980, 85.752]).addTo(map).bindPopup('<b>Panchpokhari Gate</b><br>Tourism Site');
  L.marker([27.950, 85.720]).addTo(map).bindPopup('<b>Ward 2 Center</b><br>Baruwa');
}

function initAnnualChart() {
  const ctx = document.getElementById('annualChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['२०७९/८०', '२०८०/८१', '२०८१/८२ (हाल)'],
      datasets: [
        {
          label: 'राजस्व संकलन (लाखमा)',
          data: [45, 62, 85],
          backgroundColor: 'rgba(54, 162, 235, 0.8)'
        },
        {
          label: 'पुँजीगत खर्च (लाखमा)',
          data: [120, 150, 180],
          backgroundColor: 'rgba(255, 99, 132, 0.8)'
        },
        {
          label: 'पर्यटक आगमन (हजारमा)',
          data: [8, 12, 15],
          backgroundColor: 'rgba(75, 192, 192, 0.8)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
}
