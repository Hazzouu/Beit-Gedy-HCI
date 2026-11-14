/* Mock data. The brief allows hard-coded OCR output, grades and feedback.
   Names and content match the Figma prototype (Sunflower class 4B, Ms. Sara, Omar). */
window.DATA = {
  school: { className: 'Sunflower class 4B', grade: 4, size: 28, subject: 'Science' },
  teacher: { name: 'Ms. Sara', email: 'sara.adel@school.edu', supervisor: 'Mr. Hany' },
  // Picture passwords for the children (4 pictures, in order)
  pictures: ['🐱', '☀️', '🍎', '🚗', '🐟', '🌳', '⭐', '🎈'],
  children: [
    { id: 'omar', name: 'Omar', grade: 4, cls: '4B', avatar: '🧒', password: ['🐱', '☀️', '🍎', '🚗'] },
    { id: 'hana', name: 'Hana', grade: 4, cls: '4B', avatar: '👧', password: ['🌳', '🐟', '⭐', '🎈'] },
    { id: 'lina', name: 'Lina', grade: 2, cls: '2A', avatar: '👧🏽', password: ['⭐', '🍎', '🐱', '🌳'] }
  ],
  exam: {
    id: 'animals', title: 'Animals quiz', subject: 'Science', lang: 'English', pages: 2, date: 'Tue 10 Nov',
    questions: [
      { n: 1, q: 'What does a rabbit eat?', scheme: 'plants', also: ['grass', 'carrots'], wrote: 'meat', page: 1 },
      { n: 2, q: 'Put the food chain in order.', scheme: 'grass → rabbit → fox', also: [], wrote: 'fox → rabbit → grass', page: 1 },
      { n: 3, q: 'What do we call animals with a backbone?', scheme: 'vertebrates', also: [], wrote: 'animals with backbones', page: 1 },
      { n: 4, q: 'Which animal is a mammal: shark or whale?', scheme: 'whale', also: [], wrote: 'whale', page: 1 },
      { n: 5, q: 'How does a fish breathe?', scheme: 'gills', also: ['with gills'], wrote: 'gills', page: 1 },
      { n: 6, q: 'Where do frogs lay their eggs?', scheme: 'in ponds', also: ['in water'], wrote: 'in ponds', page: 2 },
      { n: 7, q: 'Name two things animals need to live.', scheme: 'water, food (½ each)', also: ['air', 'shelter'], wrote: 'water and food', page: 2, half: true },
      { n: 8, q: 'What does a cow eat?', scheme: 'plants', also: ['grass'], wrote: 'plants', page: 2 },
      { n: 9, q: 'Which animal lays eggs: chicken or dog?', scheme: 'chicken', also: [], wrote: 'chicken', page: 2 },
      { n: 10, q: 'What is a predator?', scheme: 'an animal that hunts other animals', also: [], wrote: 'an animal that hunts', page: 2 }
    ],
    // What the (mock) OCR read and how risky each answer is. Spotlight = riskiest first.
    ocr: {
      6: { read: 'in p?nds', risk: 'hard', conf: 41 },
      1: { read: 'plants', risk: 'perfect', conf: 97 },
      7: { read: 'water', risk: 'lines', conf: 88 }
    },
    // AI suggested marks (before the teacher decides)
    aiMarks: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0.5, 8: 1, 9: 1, 10: 1 },
    aiReasons: {
      1: 'Teacher-checked text says "meat"; the mark scheme says plants.',
      2: 'Order is reversed: a food chain starts with the plant.',
      3: '"animals with backbones" is not in the mark scheme but means vertebrates.',
      7: 'Only one of the two answers was found.'
    }
  },
  classmates: [
    { name: 'Hana', status: 'sent', spot: 1 },
    { name: 'Ali', status: 'sent', spot: 2 },
    { name: 'Adam', status: 'graded' },
    { name: 'Amira', status: 'verified' },
    { name: 'Rana', status: 'missing' }
  ],
  history: [
    { subject: 'Science', title: 'Weather quiz', month: 'Sep', score: 6 },
    { subject: 'Science', title: 'Plants quiz', month: 'Oct', score: 7 },
    { subject: 'Math', title: 'Numbers', month: 'Oct', score: 8 },
    { subject: 'Math', title: 'Shapes', month: 'Nov', score: 9 }
  ],
  classMistakes: [
    { label: 'Food chains (Q2)', count: 9 },
    { label: '"animals with backbones" (Q3)', count: 6 },
    { label: 'Two-line answers (Q7)', count: 4 }
  ],
  practice: [
    { q: 'What does a rabbit eat?', options: ['🥩 meat', '🌿 plants', '🐟 fish'], answer: 1, hint: 'Look at a rabbit’s flat teeth – they are for chewing plants.' },
    { q: 'Which comes first in a food chain?', options: ['🦊 fox', '🐇 rabbit', '🌱 grass'], answer: 2, hint: 'A food chain always starts with a plant.' }
  ],
  lina: { exam: 'Shapes', subject: 'Math', stars: 3, of: 4 }
};
