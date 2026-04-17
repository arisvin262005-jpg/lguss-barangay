// All 15 Barangays of Mamburao, Occidental Mindoro
// With official Barangay Captain and Secretary information
export const BARANGAYS = [
  { id: 'brgy-01', name: 'Barangay 1',  captain: 'Asuncion C. Villar',    secretary: 'Monica Robles',          purok: ['Purok 1','Purok 2','Purok 3','Purok 4'] },
  { id: 'brgy-02', name: 'Barangay 2',  captain: 'Joel H. Dulce',          secretary: 'Shiela Villalobos',      purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-03', name: 'Barangay 3',  captain: 'Glenda C. Tacdol',       secretary: 'Mara Cammille Poblete',  purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-04', name: 'Barangay 4',  captain: 'Marion Castillo-Halagao',secretary: 'Rhea Venturero',         purok: ['Purok 1','Purok 2','Purok 3','Purok 4'] },
  { id: 'brgy-05', name: 'Barangay 5',  captain: 'Ruperto Babiera',        secretary: 'Rhea Rebato',            purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-06', name: 'Barangay 6',  captain: 'Susan Madrona Bondad',   secretary: 'Florian Galopa Alastre', purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-07', name: 'Barangay 7',  captain: 'Jon-Jon Mendoza',        secretary: 'Janice Arnedo',          purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-08', name: 'Barangay 8',  captain: 'Nena Salvador',          secretary: 'Diane Reyes Mesina',     purok: ['Purok 1','Purok 2'] },
  { id: 'brgy-pay',name: 'Payompon',    captain: 'Leonard Almero',         secretary: 'Jenny Navaro',           purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-tan',name: 'Tangkalan',   captain: 'Isagani E. Limos',       secretary: 'Sherily P. Gappi',       purok: ['Purok 1','Purok 2'] },
  { id: 'brgy-fat',name: 'Fatima',      captain: 'Ma. Nenita Concepcion',  secretary: 'Anthon Valle',           purok: ['Purok 1','Purok 2','Purok 3','Purok 4'] },
  { id: 'brgy-san',name: 'San Luis',    captain: 'Meliton Benasas',        secretary: 'Shirley Magana',         purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-bal',name: 'Balansay',    captain: 'Rondel R. Pedraza',      secretary: 'Clarisse V. Parahinog',  purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-tay',name: 'Tayamaan',    captain: 'Emmanuel Alastre',       secretary: 'Thalia Dela Luna',       purok: ['Purok 1','Purok 2','Purok 3'] },
  { id: 'brgy-tal',name: 'Talabaan',    captain: 'Alberto Cortuna',        secretary: 'Maureen Callejo',        purok: ['Purok 1','Purok 2','Purok 3'] },
];

export const BARANGAY_NAMES = BARANGAYS.map(b => b.name);

export const getBarangayInfo = (name) =>
  BARANGAYS.find(b => b.name === name || b.name.toLowerCase() === name?.toLowerCase()) || null;

// Municipality info
export const MUNICIPALITY = {
  name:     'Mamburao',
  province: 'Occidental Mindoro',
  region:   'Region IV-B MIMAROPA',
  zipCode:  '5101',
  contact:  '(043) XXX-XXXX',
};
