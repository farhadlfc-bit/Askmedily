// Top 100 UK Medical Conditions
export const TOP_CONDITIONS = [
  // Cardiovascular
  { name: 'Hypertension', slug: 'hypertension', category: 'Cardiovascular', nhsUrl: 'https://www.nhs.uk/conditions/high-blood-pressure-hypertension/' },
  { name: 'Atrial Fibrillation', slug: 'atrial-fibrillation', category: 'Cardiovascular', nhsUrl: 'https://www.nhs.uk/conditions/atrial-fibrillation/' },
  { name: 'Heart Failure', slug: 'heart-failure', category: 'Cardiovascular', nhsUrl: 'https://www.nhs.uk/conditions/heart-failure/' },
  { name: 'Coronary Heart Disease', slug: 'coronary-heart-disease', category: 'Cardiovascular', nhsUrl: 'https://www.nhs.uk/conditions/coronary-heart-disease/' },
  { name: 'High Cholesterol', slug: 'high-cholesterol', category: 'Cardiovascular', nhsUrl: 'https://www.nhs.uk/conditions/high-cholesterol/' },
  { name: 'Deep Vein Thrombosis', slug: 'deep-vein-thrombosis', category: 'Cardiovascular', nhsUrl: 'https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/' },
  { name: 'Angina', slug: 'angina', category: 'Cardiovascular', nhsUrl: 'https://www.nhs.uk/conditions/angina/' },

  // Diabetes & Endocrine
  { name: 'Type 2 Diabetes', slug: 'type-2-diabetes', category: 'Diabetes', nhsUrl: 'https://www.nhs.uk/conditions/type-2-diabetes/' },
  { name: 'Type 1 Diabetes', slug: 'type-1-diabetes', category: 'Diabetes', nhsUrl: 'https://www.nhs.uk/conditions/type-1-diabetes/' },
  { name: 'Hypothyroidism', slug: 'hypothyroidism', category: 'Endocrine', nhsUrl: 'https://www.nhs.uk/conditions/underactive-thyroid-hypothyroidism/' },
  { name: 'Hyperthyroidism', slug: 'hyperthyroidism', category: 'Endocrine', nhsUrl: 'https://www.nhs.uk/conditions/overactive-thyroid-hyperthyroidism/' },
  { name: 'Polycystic Ovary Syndrome', slug: 'polycystic-ovary-syndrome', category: 'Endocrine', nhsUrl: 'https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/' },
  { name: 'Obesity', slug: 'obesity', category: 'Endocrine', nhsUrl: 'https://www.nhs.uk/conditions/obesity/' },

  // Respiratory
  { name: 'Asthma', slug: 'asthma', category: 'Respiratory', nhsUrl: 'https://www.nhs.uk/conditions/asthma/' },
  { name: 'COPD', slug: 'copd', category: 'Respiratory', nhsUrl: 'https://www.nhs.uk/conditions/chronic-obstructive-pulmonary-disease-copd/' },
  { name: 'Pneumonia', slug: 'pneumonia', category: 'Respiratory', nhsUrl: 'https://www.nhs.uk/conditions/pneumonia/' },
  { name: 'Sleep Apnoea', slug: 'sleep-apnoea', category: 'Respiratory', nhsUrl: 'https://www.nhs.uk/conditions/sleep-apnoea/' },

  // Mental Health
  { name: 'Depression', slug: 'depression', category: 'Mental Health', nhsUrl: 'https://www.nhs.uk/conditions/clinical-depression/' },
  { name: 'Anxiety', slug: 'anxiety', category: 'Mental Health', nhsUrl: 'https://www.nhs.uk/conditions/generalised-anxiety-disorder/' },
  { name: 'Bipolar Disorder', slug: 'bipolar-disorder', category: 'Mental Health', nhsUrl: 'https://www.nhs.uk/conditions/bipolar-disorder/' },
  { name: 'Schizophrenia', slug: 'schizophrenia', category: 'Mental Health', nhsUrl: 'https://www.nhs.uk/conditions/schizophrenia/' },
  { name: 'ADHD', slug: 'adhd', category: 'Mental Health', nhsUrl: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/' },
  { name: 'OCD', slug: 'ocd', category: 'Mental Health', nhsUrl: 'https://www.nhs.uk/conditions/obsessive-compulsive-disorder-ocd/' },
  { name: 'PTSD', slug: 'ptsd', category: 'Mental Health', nhsUrl: 'https://www.nhs.uk/conditions/post-traumatic-stress-disorder-ptsd/' },
  { name: 'Insomnia', slug: 'insomnia', category: 'Mental Health', nhsUrl: 'https://www.nhs.uk/conditions/insomnia/' },

  // Musculoskeletal
  { name: 'Rheumatoid Arthritis', slug: 'rheumatoid-arthritis', category: 'Musculoskeletal', nhsUrl: 'https://www.nhs.uk/conditions/rheumatoid-arthritis/' },
  { name: 'Osteoarthritis', slug: 'osteoarthritis', category: 'Musculoskeletal', nhsUrl: 'https://www.nhs.uk/conditions/osteoarthritis/' },
  { name: 'Gout', slug: 'gout', category: 'Musculoskeletal', nhsUrl: 'https://www.nhs.uk/conditions/gout/' },
  { name: 'Osteoporosis', slug: 'osteoporosis', category: 'Musculoskeletal', nhsUrl: 'https://www.nhs.uk/conditions/osteoporosis/' },
  { name: 'Fibromyalgia', slug: 'fibromyalgia', category: 'Musculoskeletal', nhsUrl: 'https://www.nhs.uk/conditions/fibromyalgia/' },

  // Neurological
  { name: "Parkinson's Disease", slug: 'parkinsons-disease', category: 'Neurological', nhsUrl: 'https://www.nhs.uk/conditions/parkinsons-disease/' },
  { name: "Alzheimer's Disease", slug: 'alzheimers-disease', category: 'Neurological', nhsUrl: 'https://www.nhs.uk/conditions/alzheimers-disease/' },
  { name: 'Epilepsy', slug: 'epilepsy', category: 'Neurological', nhsUrl: 'https://www.nhs.uk/conditions/epilepsy/' },
  { name: 'Migraine', slug: 'migraine', category: 'Neurological', nhsUrl: 'https://www.nhs.uk/conditions/migraine/' },
  { name: 'Multiple Sclerosis', slug: 'multiple-sclerosis', category: 'Neurological', nhsUrl: 'https://www.nhs.uk/conditions/multiple-sclerosis/' },
  { name: 'Peripheral Neuropathy', slug: 'peripheral-neuropathy', category: 'Neurological', nhsUrl: 'https://www.nhs.uk/conditions/peripheral-neuropathy/' },

  // Gastrointestinal
  { name: "Crohn's Disease", slug: 'crohns-disease', category: 'Gastrointestinal', nhsUrl: 'https://www.nhs.uk/conditions/crohns-disease/' },
  { name: 'Ulcerative Colitis', slug: 'ulcerative-colitis', category: 'Gastrointestinal', nhsUrl: 'https://www.nhs.uk/conditions/ulcerative-colitis/' },
  { name: 'Irritable Bowel Syndrome', slug: 'irritable-bowel-syndrome', category: 'Gastrointestinal', nhsUrl: 'https://www.nhs.uk/conditions/irritable-bowel-syndrome-ibs/' },
  { name: 'GERD / Acid Reflux', slug: 'acid-reflux', category: 'Gastrointestinal', nhsUrl: 'https://www.nhs.uk/conditions/heartburn-and-acid-reflux/' },
  { name: 'Peptic Ulcer', slug: 'peptic-ulcer', category: 'Gastrointestinal', nhsUrl: 'https://www.nhs.uk/conditions/stomach-ulcer/' },

  // Urological
  { name: 'Urinary Tract Infection', slug: 'urinary-tract-infection', category: 'Urological', nhsUrl: 'https://www.nhs.uk/conditions/urinary-tract-infections-utis/' },
  { name: 'Benign Prostatic Hyperplasia', slug: 'benign-prostatic-hyperplasia', category: 'Urological', nhsUrl: 'https://www.nhs.uk/conditions/prostate-enlargement/' },
  { name: 'Overactive Bladder', slug: 'overactive-bladder', category: 'Urological', nhsUrl: 'https://www.nhs.uk/conditions/overactive-bladder/' },
  { name: 'Kidney Stones', slug: 'kidney-stones', category: 'Urological', nhsUrl: 'https://www.nhs.uk/conditions/kidney-stones/' },
  { name: 'Erectile Dysfunction', slug: 'erectile-dysfunction', category: 'Urological', nhsUrl: 'https://www.nhs.uk/conditions/erection-problems-erectile-dysfunction/' },

  // Dermatological
  { name: 'Eczema', slug: 'eczema', category: 'Dermatological', nhsUrl: 'https://www.nhs.uk/conditions/atopic-eczema/' },
  { name: 'Psoriasis', slug: 'psoriasis', category: 'Dermatological', nhsUrl: 'https://www.nhs.uk/conditions/psoriasis/' },
  { name: 'Acne', slug: 'acne', category: 'Dermatological', nhsUrl: 'https://www.nhs.uk/conditions/acne/' },
  { name: 'Rosacea', slug: 'rosacea', category: 'Dermatological', nhsUrl: 'https://www.nhs.uk/conditions/rosacea/' },

  // Infections
  { name: 'Urinary Tract Infection', slug: 'uti', category: 'Infection', nhsUrl: 'https://www.nhs.uk/conditions/urinary-tract-infections-utis/' },
  { name: 'Chest Infection', slug: 'chest-infection', category: 'Infection', nhsUrl: 'https://www.nhs.uk/conditions/chest-infection/' },
  { name: 'Shingles', slug: 'shingles', category: 'Infection', nhsUrl: 'https://www.nhs.uk/conditions/shingles/' },

  // Women's Health
  { name: 'Endometriosis', slug: 'endometriosis', category: "Women's Health", nhsUrl: 'https://www.nhs.uk/conditions/endometriosis/' },
  { name: 'Menopause', slug: 'menopause', category: "Women's Health", nhsUrl: 'https://www.nhs.uk/conditions/menopause/' },
  { name: 'Premenstrual Syndrome', slug: 'premenstrual-syndrome', category: "Women's Health", nhsUrl: 'https://www.nhs.uk/conditions/premenstrual-syndrome/' },

  // Pain
  { name: 'Chronic Pain', slug: 'chronic-pain', category: 'Pain', nhsUrl: 'https://www.nhs.uk/conditions/chronic-pain/' },
  { name: 'Back Pain', slug: 'back-pain', category: 'Pain', nhsUrl: 'https://www.nhs.uk/conditions/back-pain/' },
  { name: 'Sciatica', slug: 'sciatica', category: 'Pain', nhsUrl: 'https://www.nhs.uk/conditions/sciatica/' },
];

export const CONDITION_CATEGORIES = [...new Set(TOP_CONDITIONS.map(c => c.category))];
