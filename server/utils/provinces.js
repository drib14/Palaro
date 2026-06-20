// Complete list of Philippine provinces grouped by region
const philippineProvinces = [
  // NCR (National Capital Region)
  { name: 'Metro Manila', region: 'NCR' },
  // CAR (Cordillera Administrative Region)
  { name: 'Abra', region: 'CAR' },
  { name: 'Apayao', region: 'CAR' },
  { name: 'Benguet', region: 'CAR' },
  { name: 'Ifugao', region: 'CAR' },
  { name: 'Kalinga', region: 'CAR' },
  { name: 'Mountain Province', region: 'CAR' },
  // Region I (Ilocos Region)
  { name: 'Ilocos Norte', region: 'Region I' },
  { name: 'Ilocos Sur', region: 'Region I' },
  { name: 'La Union', region: 'Region I' },
  { name: 'Pangasinan', region: 'Region I' },
  // Region II (Cagayan Valley)
  { name: 'Batanes', region: 'Region II' },
  { name: 'Cagayan', region: 'Region II' },
  { name: 'Isabela', region: 'Region II' },
  { name: 'Nueva Vizcaya', region: 'Region II' },
  { name: 'Quirino', region: 'Region II' },
  // Region III (Central Luzon)
  { name: 'Aurora', region: 'Region III' },
  { name: 'Bataan', region: 'Region III' },
  { name: 'Bulacan', region: 'Region III' },
  { name: 'Nueva Ecija', region: 'Region III' },
  { name: 'Pampanga', region: 'Region III' },
  { name: 'Tarlac', region: 'Region III' },
  { name: 'Zambales', region: 'Region III' },
  // Region IV-A (CALABARZON)
  { name: 'Batangas', region: 'Region IV-A' },
  { name: 'Cavite', region: 'Region IV-A' },
  { name: 'Laguna', region: 'Region IV-A' },
  { name: 'Quezon', region: 'Region IV-A' },
  { name: 'Rizal', region: 'Region IV-A' },
  // Region IV-B (MIMAROPA)
  { name: 'Marinduque', region: 'Region IV-B' },
  { name: 'Occidental Mindoro', region: 'Region IV-B' },
  { name: 'Oriental Mindoro', region: 'Region IV-B' },
  { name: 'Palawan', region: 'Region IV-B' },
  { name: 'Romblon', region: 'Region IV-B' },
  // Region V (Bicol Region)
  { name: 'Albay', region: 'Region V' },
  { name: 'Camarines Norte', region: 'Region V' },
  { name: 'Camarines Sur', region: 'Region V' },
  { name: 'Catanduanes', region: 'Region V' },
  { name: 'Masbate', region: 'Region V' },
  { name: 'Sorsogon', region: 'Region V' },
  // Region VI (Western Visayas)
  { name: 'Aklan', region: 'Region VI' },
  { name: 'Antique', region: 'Region VI' },
  { name: 'Capiz', region: 'Region VI' },
  { name: 'Guimaras', region: 'Region VI' },
  { name: 'Iloilo', region: 'Region VI' },
  { name: 'Negros Occidental', region: 'Region VI' },
  // Region VII (Central Visayas)
  { name: 'Bohol', region: 'Region VII' },
  { name: 'Cebu', region: 'Region VII' },
  { name: 'Negros Oriental', region: 'Region VII' },
  { name: 'Siquijor', region: 'Region VII' },
  // Region VIII (Eastern Visayas)
  { name: 'Biliran', region: 'Region VIII' },
  { name: 'Eastern Samar', region: 'Region VIII' },
  { name: 'Leyte', region: 'Region VIII' },
  { name: 'Northern Samar', region: 'Region VIII' },
  { name: 'Samar', region: 'Region VIII' },
  { name: 'Southern Leyte', region: 'Region VIII' },
  // Region IX (Zamboanga Peninsula)
  { name: 'Zamboanga del Norte', region: 'Region IX' },
  { name: 'Zamboanga del Sur', region: 'Region IX' },
  { name: 'Zamboanga Sibugay', region: 'Region IX' },
  // Region X (Northern Mindanao)
  { name: 'Bukidnon', region: 'Region X' },
  { name: 'Camiguin', region: 'Region X' },
  { name: 'Lanao del Norte', region: 'Region X' },
  { name: 'Misamis Occidental', region: 'Region X' },
  { name: 'Misamis Oriental', region: 'Region X' },
  // Region XI (Davao Region)
  { name: 'Davao de Oro', region: 'Region XI' },
  { name: 'Davao del Norte', region: 'Region XI' },
  { name: 'Davao del Sur', region: 'Region XI' },
  { name: 'Davao Occidental', region: 'Region XI' },
  { name: 'Davao Oriental', region: 'Region XI' },
  // Region XII (SOCCSKSARGEN)
  { name: 'Cotabato', region: 'Region XII' },
  { name: 'Sarangani', region: 'Region XII' },
  { name: 'South Cotabato', region: 'Region XII' },
  { name: 'Sultan Kudarat', region: 'Region XII' },
  // Region XIII (Caraga)
  { name: 'Agusan del Norte', region: 'Region XIII' },
  { name: 'Agusan del Sur', region: 'Region XIII' },
  { name: 'Dinagat Islands', region: 'Region XIII' },
  { name: 'Surigao del Norte', region: 'Region XIII' },
  { name: 'Surigao del Sur', region: 'Region XIII' },
  // BARMM (Bangsamoro Autonomous Region in Muslim Mindanao)
  { name: 'Basilan', region: 'BARMM' },
  { name: 'Lanao del Sur', region: 'BARMM' },
  { name: 'Maguindanao del Norte', region: 'BARMM' },
  { name: 'Maguindanao del Sur', region: 'BARMM' },
  { name: 'Sulu', region: 'BARMM' },
  { name: 'Tawi-Tawi', region: 'BARMM' },
];

module.exports = { philippineProvinces };
