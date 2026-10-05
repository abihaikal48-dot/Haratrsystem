export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  role: string;
  source?: string;
  latinMotto?: string;
  category: 'Keunggulan' | 'Disiplin' | 'Kerjasama' | 'Dedikasi' | 'Kepemimpinan';
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    id: 'marcus-aurelius-1',
    quote: 'Keunggulan bukanlah sebuah tindakan sesaat, melainkan kebiasaan yang kita latih setiap hari tanpa henti.',
    author: 'Marcus Aurelius',
    role: 'Kaisar Romawi & Filsuf Stoik',
    latinMotto: 'Vires in Scientia et Disciplina',
    category: 'Keunggulan',
  },
  {
    id: 'seneca-1',
    quote: 'Tidak ada jalan yang mudah dari bumi menuju bintang-bintang. Setiap kesuksesan berakar dari keteguhan hati.',
    author: 'Lucius Annaeus Seneca',
    role: 'Filsuf Romawi Kuno',
    latinMotto: 'Non est ad astra mollis e terris via',
    category: 'Dedikasi',
  },
  {
    id: 'steve-jobs-1',
    quote: 'Jadilah tolok ukur kualitas tinggi. Beberapa orang tidak terbiasa dengan lingkungan di mana keunggulan adalah sebuah keharusan.',
    author: 'Steve Jobs',
    role: 'Inovator & Co-founder Apple',
    latinMotto: 'Excellens Semper',
    category: 'Keunggulan',
  },
  {
    id: 'gordon-ramsay-1',
    quote: 'Di dapur profesional, disiplin dan konsistensi pada hal-hal kecil adalah pembeda antara biasa dan luar biasa.',
    author: 'Gordon Ramsay',
    role: 'Master Chef Bintang Michelin',
    latinMotto: 'Ars Coquendi Praecisa',
    category: 'Disiplin',
  },
  {
    id: 'walt-disney-1',
    quote: 'Apapun yang Anda kerjakan, lakukanlah sebaik mungkin hingga orang yang melihatnya ingin kembali lagi dan lagi.',
    author: 'Walt Disney',
    role: 'Visioner & Kreator Legendaris',
    latinMotto: 'Magna Opera, Magna Cura',
    category: 'Dedikasi',
  },
  {
    id: 'ray-kroc-1',
    quote: 'Kualitas seorang pemimpin tercermin dalam standar kerja yang ia tetapkan untuk dirinya sendiri dan timnya.',
    author: 'Ray Kroc',
    role: 'Pelopor Standarisasi F&B Dunia',
    latinMotto: 'Unitas et Constantia',
    category: 'Kepemimpinan',
  },
  {
    id: 'vince-lombardi-1',
    quote: 'Kesempurnaan mungkin mustahil dicapai, namun jika kita terus mengejarnya, kita akan meraih keunggulan sejati.',
    author: 'Vince Lombardi',
    role: 'Pelatih Legendaris Juara Dunia',
    latinMotto: 'Per Ardua Ad Astra',
    category: 'Keunggulan',
  },
  {
    id: 'henry-ford-1',
    quote: 'Kualitas sejati berarti melakukan hal yang benar bahkan ketika tidak ada seorang pun yang sedang memperhatikan.',
    author: 'Henry Ford',
    role: 'Pelopor Efisiensi & Manufaktur',
    latinMotto: 'Integritas in Opere',
    category: 'Disiplin',
  },
  {
    id: 'leonardo-da-vinci-1',
    quote: 'Detail-detail kecil menciptakan kesempurnaan, dan kesempurnaan itu sendiri bukanlah hal yang sepele.',
    author: 'Leonardo da Vinci',
    role: 'Polimatik & Seniman Renaisans',
    latinMotto: 'Minima Curat Virtus',
    category: 'Keunggulan',
  },
  {
    id: 'jiro-ono-1',
    quote: 'Sekali Anda memilih profesi, curahkanlah segenap jiwa ke dalamnya. Jatuh cintalah pada setiap proses yang Anda jalani.',
    author: 'Jiro Ono',
    role: 'Maestro Kuliner Dunia (Sukiyabashi Jiro)',
    latinMotto: 'Amor Laboris Aeternus',
    category: 'Dedikasi',
  },
  {
    id: 'thomas-edison-1',
    quote: 'Selalu ada cara untuk mengerjakannya dengan lebih baik. Tugas kitalah untuk menemukannya.',
    author: 'Thomas A. Edison',
    role: 'Penemu & Tokoh Inovasi',
    latinMotto: 'Inveniam Viam',
    category: 'Keunggulan',
  },
  {
    id: 'confucius-1',
    quote: 'Kemauan untuk menang, tekad untuk berhasil, dan dorongan untuk mengerahkan potensi terbaik adalah kunci membuka pintu keunggulan.',
    author: 'Konfusius',
    role: 'Filsuf Timur & Pendidik Luhur',
    latinMotto: 'Sapientia et Concordia',
    category: 'Dedikasi',
  },
  {
    id: 'winston-churchill-1',
    quote: 'Keberhasilan bukanlah akhir, kegagalan bukanlah kehancuran fatal: keberanian untuk terus melangkahlah yang paling bernilai.',
    author: 'Winston Churchill',
    role: 'Pemimpin & Negarawan',
    latinMotto: 'Fortitudo in Tempestate',
    category: 'Kepemimpinan',
  },
  {
    id: 'maya-angelou-1',
    quote: 'Anda hanya dapat meraih pencapaian yang membanggakan dalam hal yang Anda kerjakan dengan sepenuh hati.',
    author: 'Maya Angelou',
    role: 'Penyair & Tokoh Kemanusiaan',
    latinMotto: 'Corde et Animo',
    category: 'Dedikasi',
  },
  {
    id: 'benjamin-franklin-1',
    quote: 'Tindakan yang terlaksana dengan tuntas jauh lebih bernilai daripada ribuan kata yang hanya terucap.',
    author: 'Benjamin Franklin',
    role: 'Polimatik & Tokoh Kebijaksanaan',
    latinMotto: 'Facta Non Verba',
    category: 'Disiplin',
  },
  {
    id: 'epictetus-1',
    quote: 'Tentukan terlebih dahulu karakter dan standar apa yang ingin Anda capai; setelah itu lakukanlah tugas Anda tanpa ragu.',
    author: 'Epictetus',
    role: 'Filsuf Stoik Kuno',
    latinMotto: 'Virtus Est In Actu',
    category: 'Disiplin',
  },
  {
    id: 'aristotle-1',
    quote: 'Kita dibentuk oleh apa yang kita lakukan berulang kali. Kualitas prima bukanlah suatu kebetulan, melainkan hasil ketekunan.',
    author: 'Aristoteles',
    role: 'Filsuf Yunani Klasik',
    latinMotto: 'Ars Magna Disciplinae',
    category: 'Keunggulan',
  }
];

export function getRandomMotivationalQuote(excludeId?: string): MotivationalQuote {
  const pool = excludeId
    ? MOTIVATIONAL_QUOTES.filter((q) => q.id !== excludeId)
    : MOTIVATIONAL_QUOTES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] || MOTIVATIONAL_QUOTES[0];
}
