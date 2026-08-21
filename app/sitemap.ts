import { MetadataRoute } from 'next';

const DRUG_SLUGS = [
  'metformin', 'atorvastatin', 'amlodipine', 'lansoprazole', 'ramipril',
  'omeprazole', 'lisinopril', 'levothyroxine', 'salbutamol', 'sertraline',
  'amoxicillin', 'bisoprolol', 'simvastatin', 'furosemide', 'losartan',
  'gabapentin', 'pregabalin', 'aspirin', 'warfarin', 'apixaban',
  'clopidogrel', 'fluoxetine', 'citalopram', 'amitriptyline', 'mirtazapine',
  'venlafaxine', 'duloxetine', 'paracetamol', 'ibuprofen', 'naproxen',
  'tramadol', 'codeine', 'morphine', 'alendronic-acid', 'prednisolone',
  'doxycycline', 'trimethoprim', 'nitrofurantoin', 'flucloxacillin',
  'clarithromycin', 'metronidazole', 'cetirizine', 'loratadine',
  'fexofenadine', 'montelukast', 'candesartan', 'spironolactone',
  'doxazosin', 'tamsulosin', 'finasteride', 'gliclazide', 'sitagliptin',
  'dapagliflozin', 'semaglutide', 'carbamazepine', 'lamotrigine',
  'levetiracetam', 'propranolol', 'atenolol', 'diltiazem', 'nifedipine',
  'digoxin', 'colchicine', 'allopurinol', 'hydroxychloroquine',
  'methotrexate', 'sulfasalazine', 'azathioprine', 'folic-acid',
  'colecalciferol', 'ferrous-sulfate', 'escitalopram', 'quetiapine',
  'olanzapine', 'risperidone', 'donepezil', 'memantine', 'lactulose',
  'senna', 'loperamide', 'domperidone', 'ondansetron', 'pantoprazole',
  'esomeprazole', 'ezetimibe', 'rosuvastatin', 'zopiclone', 'diazepam',
  'lorazepam', 'sumatriptan', 'sildenafil', 'tadalafil', 'empagliflozin',
  'rivaroxaban', 'tiotropium', 'macrogol', 'zolpidem', 'tirzepatide'
];

const CONDITION_SLUGS = [
  'hypertension', 'type-2-diabetes', 'asthma', 'depression', 'anxiety',
  'high-cholesterol', 'copd', 'atrial-fibrillation', 'heart-failure',
  'osteoarthritis', 'rheumatoid-arthritis', 'type-1-diabetes',
  'hypothyroidism', 'epilepsy', 'migraine', 'gout', 'osteoporosis',
  'eczema', 'psoriasis', 'irritable-bowel-syndrome', 'crohns-disease',
  'ulcerative-colitis', 'acid-reflux', 'bipolar-disorder', 'adhd',
  'parkinsons-disease', 'alzheimers-disease', 'multiple-sclerosis',
  'fibromyalgia', 'back-pain', 'insomnia', 'acne', 'kidney-stones',
  'chickenpox', 'hayfever', 'conjunctivitis', 'cold', 'flu', 'covid-19',
  'urinary-tract-infection', 'sepsis', 'malaria', 'pneumonia'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://askmedily.com';
  const now = new Date();

  const staticPages = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
  ];

  const drugPages = DRUG_SLUGS.map(slug => ({
    url: `${baseUrl}/drug/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9
  }));

  const conditionPages = CONDITION_SLUGS.map(slug => ({
    url: `${baseUrl}/condition/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9
  }));

  return [...staticPages, ...drugPages, ...conditionPages];
}
