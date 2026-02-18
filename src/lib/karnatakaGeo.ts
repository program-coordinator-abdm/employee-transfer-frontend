// Karnataka District → Taluk → City/Town/Village mapping

export interface TalukData {
  name: string;
  cities: string[];
}

export interface DistrictData {
  taluks: TalukData[];
}

export const KARNATAKA_GEO: Record<string, DistrictData> = {
  "Bagalkot": {
    taluks: [
      { name: "Bagalkot", cities: ["Bagalkot", "Navanagar", "Vidyagiri"] },
      { name: "Badami", cities: ["Badami", "Kerur", "Guledagudda"] },
      { name: "Bilgi", cities: ["Bilgi", "Kamatagi", "Badagandi"] },
      { name: "Hunagund", cities: ["Hungund", "Ilkal", "Amingad"] },
      { name: "Jamkhandi", cities: ["Jamkhandi", "Terdal", "Savalagi"] },
      { name: "Mudhol", cities: ["Mudhol", "Lokapur", "Mahalingpur"] },
    ],
  },
  "Ballari (Bellary)": {
    taluks: [
      { name: "Ballari", cities: ["Ballari", "Cowl Bazaar", "Cantonment"] },
      { name: "Hadagali", cities: ["Hadagali", "Hagaribommanahalli"] },
      { name: "Hospet", cities: ["Hosapete", "Kamalapur", "Hampi"] },
      { name: "Kudligi", cities: ["Kudligi", "Hagari"] },
      { name: "Sandur", cities: ["Sandur", "Toranagallu", "Swamyhalli"] },
      { name: "Siruguppa", cities: ["Siruguppa", "Siraguppa"] },
    ],
  },
  "Belagavi (Belgaum)": {
    taluks: [
      { name: "Belagavi", cities: ["Belagavi", "Udyambag", "Kangrali"] },
      { name: "Athani", cities: ["Athani", "Ainapur", "Kagwad"] },
      { name: "Bailhongal", cities: ["Bailhongal", "Kittur", "Murgod"] },
      { name: "Chikkodi", cities: ["Chikkodi", "Sadalga", "Ankali"] },
      { name: "Gokak", cities: ["Gokak", "Gokak Falls", "Munavalli"] },
      { name: "Hukkeri", cities: ["Hukkeri", "Sankeshwar", "Nandgad"] },
      { name: "Khanapur", cities: ["Khanapur", "Jamboti"] },
      { name: "Raibag", cities: ["Raibag", "Kudachi", "Harugeri"] },
      { name: "Ramdurg", cities: ["Ramdurg", "Saunavadi"] },
      { name: "Savadatti", cities: ["Saundatti", "Parasgad", "Yaragatti"] },
    ],
  },
  "Bengaluru Rural": {
    taluks: [
      { name: "Bengaluru North", cities: ["Yelahanka", "Devanahalli", "Doddaballapur"] },
      { name: "Bengaluru South", cities: ["Anekal", "Jigani", "Sarjapura"] },
      { name: "Devanahalli", cities: ["Devanahalli", "Vijayapura"] },
      { name: "Doddaballapur", cities: ["Doddaballapur", "Ghati Subramanya"] },
      { name: "Hosakote", cities: ["Hosakote", "Nandagudi", "Sulibele"] },
      { name: "Nelamangala", cities: ["Nelamangala", "Solur", "Thyamagondlu"] },
    ],
  },
  "Bengaluru Urban": {
    taluks: [
      { name: "Bengaluru North", cities: ["Hebbal", "Yelahanka", "Thanisandra", "Nagawara"] },
      { name: "Bengaluru South", cities: ["Jayanagar", "Banashankari", "JP Nagar", "BTM Layout"] },
      { name: "Bengaluru East", cities: ["Indiranagar", "Whitefield", "KR Puram", "Mahadevapura"] },
      { name: "Bengaluru West", cities: ["Rajajinagar", "Vijayanagar", "Basaveshwaranagar"] },
      { name: "Anekal", cities: ["Anekal", "Electronic City", "Sarjapura", "Chandapura"] },
    ],
  },
  "Bidar": {
    taluks: [
      { name: "Bidar", cities: ["Bidar", "Naubad", "Chitaguppa"] },
      { name: "Aurad", cities: ["Aurad", "Kamalnagar"] },
      { name: "Basavakalyan", cities: ["Basavakalyan", "Rajeshwar"] },
      { name: "Bhalki", cities: ["Bhalki", "Humnabad"] },
      { name: "Humnabad", cities: ["Humnabad", "Manpalli"] },
    ],
  },
  "Chamarajanagar": {
    taluks: [
      { name: "Chamarajanagar", cities: ["Chamarajanagar", "Haradanahalli"] },
      { name: "Gundlupet", cities: ["Gundlupet", "Begur"] },
      { name: "Kollegal", cities: ["Kollegal", "Ramapura"] },
      { name: "Yelandur", cities: ["Yelandur", "Honganur"] },
    ],
  },
  "Chikballapur": {
    taluks: [
      { name: "Chikballapur", cities: ["Chikballapur", "Nandi Hills"] },
      { name: "Bagepalli", cities: ["Bagepalli", "Chelur"] },
      { name: "Chintamani", cities: ["Chintamani", "Kaiwara"] },
      { name: "Gauribidanur", cities: ["Gauribidanur", "Manchenahalli"] },
      { name: "Gudibanda", cities: ["Gudibanda"] },
      { name: "Sidlaghatta", cities: ["Sidlaghatta", "Sadali"] },
    ],
  },
  "Chikkamagaluru": {
    taluks: [
      { name: "Chikkamagaluru", cities: ["Chikkamagaluru", "Hiremagaluru"] },
      { name: "Kadur", cities: ["Kadur", "Birur", "Ajjampura"] },
      { name: "Koppa", cities: ["Koppa", "Jayapura"] },
      { name: "Mudigere", cities: ["Mudigere", "Kalasa"] },
      { name: "Narasimharajapura", cities: ["Narasimharajapura"] },
      { name: "Sringeri", cities: ["Sringeri", "Kigga"] },
      { name: "Tarikere", cities: ["Tarikere", "Lingadahalli"] },
    ],
  },
  "Chitradurga": {
    taluks: [
      { name: "Chitradurga", cities: ["Chitradurga", "Bharamasagara"] },
      { name: "Challakere", cities: ["Challakere", "Parashurampura"] },
      { name: "Hiriyur", cities: ["Hiriyur", "Joldal"] },
      { name: "Holalkere", cities: ["Holalkere", "Nyamathi"] },
      { name: "Hosadurga", cities: ["Hosadurga", "Babbur"] },
      { name: "Molakalmuru", cities: ["Molakalmuru", "Kondlahalli"] },
    ],
  },
  "Dakshina Kannada": {
    taluks: [
      { name: "Mangaluru", cities: ["Mangaluru", "Surathkal", "Ullal", "Mulki"] },
      { name: "Bantwal", cities: ["Bantwal", "Vitla", "B.C. Road"] },
      { name: "Belthangady", cities: ["Belthangady", "Dharmasthala", "Ujire"] },
      { name: "Kadaba", cities: ["Kadaba", "Puthige"] },
      { name: "Puttur", cities: ["Puttur", "Sullia", "Uppinangady"] },
      { name: "Sullia", cities: ["Sullia", "Bellare"] },
    ],
  },
  "Davanagere": {
    taluks: [
      { name: "Davanagere", cities: ["Davanagere", "Lokikere"] },
      { name: "Channagiri", cities: ["Channagiri", "Santhebennur"] },
      { name: "Harihar", cities: ["Harihar", "Malebennur"] },
      { name: "Harpanahalli", cities: ["Harpanahalli", "Harapanahalli"] },
      { name: "Honnali", cities: ["Honnali", "Nyamathi"] },
      { name: "Jagalur", cities: ["Jagalur", "Musalimadugu"] },
    ],
  },
  "Dharwad": {
    taluks: [
      { name: "Dharwad", cities: ["Dharwad", "Sattur", "Karwar Road"] },
      { name: "Hubballi", cities: ["Hubballi", "Keshwapur", "Gokul Road", "Vidyanagar"] },
      { name: "Kalghatgi", cities: ["Kalghatgi", "Alnavar"] },
      { name: "Kundgol", cities: ["Kundgol", "Kalaghatgi"] },
      { name: "Navalgund", cities: ["Navalgund", "Annigeri"] },
    ],
  },
  "Gadag": {
    taluks: [
      { name: "Gadag", cities: ["Gadag", "Betgeri", "Lakshmeshwar"] },
      { name: "Mundargi", cities: ["Mundargi", "Dambal"] },
      { name: "Nargund", cities: ["Nargund", "Navihal"] },
      { name: "Ron", cities: ["Ron", "Savadi", "Gajendragad"] },
      { name: "Shirahatti", cities: ["Shirahatti", "Lakkundi"] },
    ],
  },
  "Hassan": {
    taluks: [
      { name: "Hassan", cities: ["Hassan", "Channarayapatna"] },
      { name: "Alur", cities: ["Alur", "Sakleshpur"] },
      { name: "Arkalgud", cities: ["Arkalgud", "Keragodu"] },
      { name: "Arsikere", cities: ["Arsikere", "Javagal"] },
      { name: "Belur", cities: ["Belur", "Halebidu"] },
      { name: "Channarayapatna", cities: ["Channarayapatna", "Shravanabelagola"] },
      { name: "Holenarasipura", cities: ["Holenarasipura", "Gorur"] },
      { name: "Sakleshpur", cities: ["Sakleshpur", "Hethur"] },
    ],
  },
  "Haveri": {
    taluks: [
      { name: "Haveri", cities: ["Haveri", "Devihosur"] },
      { name: "Byadgi", cities: ["Byadgi", "Motebennur"] },
      { name: "Hanagal", cities: ["Hanagal", "Tiluvalli"] },
      { name: "Hirekerur", cities: ["Hirekerur", "Rattihalli"] },
      { name: "Ranebennur", cities: ["Ranebennur", "Medleri"] },
      { name: "Savanur", cities: ["Savanur", "Shiggaon"] },
      { name: "Shiggaon", cities: ["Shiggaon", "Bankapur"] },
    ],
  },
  "Kalaburagi (Gulbarga)": {
    taluks: [
      { name: "Kalaburagi", cities: ["Kalaburagi", "Sedam Road", "Supermarket"] },
      { name: "Afzalpur", cities: ["Afzalpur", "Khajuri"] },
      { name: "Aland", cities: ["Aland", "Kadaganchi"] },
      { name: "Chincholi", cities: ["Chincholi", "Basavakalyan"] },
      { name: "Chittapur", cities: ["Chittapur", "Shahabad"] },
      { name: "Jevargi", cities: ["Jevargi", "Kurkunta"] },
      { name: "Sedam", cities: ["Sedam", "Kodla"] },
    ],
  },
  "Kodagu": {
    taluks: [
      { name: "Madikeri", cities: ["Madikeri", "Napoklu", "Suntikoppa"] },
      { name: "Somwarpet", cities: ["Somwarpet", "Kushalnagar", "Siddapura"] },
      { name: "Virajpet", cities: ["Virajpet", "Gonikoppa", "Ponnampet"] },
    ],
  },
  "Kolar": {
    taluks: [
      { name: "Kolar", cities: ["Kolar", "Vemagal"] },
      { name: "Bangarapet", cities: ["Bangarapet", "KGF", "Bethamangala"] },
      { name: "Malur", cities: ["Malur", "Lakkur"] },
      { name: "Mulbagal", cities: ["Mulbagal", "Avani"] },
      { name: "Srinivaspur", cities: ["Srinivaspur", "Ronur"] },
    ],
  },
  "Koppal": {
    taluks: [
      { name: "Koppal", cities: ["Koppal", "Kinnal", "Kanakagiri"] },
      { name: "Gangavathi", cities: ["Gangavathi", "Anegundi", "Karatagi"] },
      { name: "Kushtagi", cities: ["Kushtagi", "Hiresindogi"] },
      { name: "Yelburga", cities: ["Yelburga", "Kuknur"] },
    ],
  },
  "Mandya": {
    taluks: [
      { name: "Mandya", cities: ["Mandya", "Basaralu"] },
      { name: "Krishnarajpet", cities: ["Krishnarajpet", "Arakere"] },
      { name: "Maddur", cities: ["Maddur", "Shivalli"] },
      { name: "Malavalli", cities: ["Malavalli", "Kollegala Road"] },
      { name: "Nagamangala", cities: ["Nagamangala", "Bindiganavile"] },
      { name: "Pandavapura", cities: ["Pandavapura", "Melukote"] },
      { name: "Srirangapatna", cities: ["Srirangapatna", "Pandavapura"] },
    ],
  },
  "Mysuru (Mysore)": {
    taluks: [
      { name: "Mysuru", cities: ["Mysuru", "Srirangapatna", "Pandavapura"] },
      { name: "Heggadadevankote", cities: ["HD Kote", "Antharasanthe"] },
      { name: "Hunsur", cities: ["Hunsur", "Periyapatna"] },
      { name: "Krishnarajanagara", cities: ["Krishnarajanagara", "Bettadapura"] },
      { name: "Nanjangud", cities: ["Nanjangud", "Hullahalli"] },
      { name: "Periyapatna", cities: ["Periyapatna", "Bettadapura"] },
      { name: "Tirumakudal Narsipur", cities: ["T. Narsipur", "Bannur", "Sosale"] },
    ],
  },
  "Raichur": {
    taluks: [
      { name: "Raichur", cities: ["Raichur", "Yeragera"] },
      { name: "Devadurga", cities: ["Devadurga", "Kavital"] },
      { name: "Lingasugur", cities: ["Lingasugur", "Mudgal"] },
      { name: "Manvi", cities: ["Manvi", "Sindhanur"] },
      { name: "Sindhanur", cities: ["Sindhanur", "Gangavathi Road"] },
    ],
  },
  "Ramanagara": {
    taluks: [
      { name: "Ramanagara", cities: ["Ramanagara", "Bidadi"] },
      { name: "Channapatna", cities: ["Channapatna", "Makali"] },
      { name: "Kanakapura", cities: ["Kanakapura", "Sathanur"] },
      { name: "Magadi", cities: ["Magadi", "Tavarekere"] },
    ],
  },
  "Shivamogga (Shimoga)": {
    taluks: [
      { name: "Shivamogga", cities: ["Shivamogga", "Bhadravathi"] },
      { name: "Bhadravathi", cities: ["Bhadravathi", "Holehonnur"] },
      { name: "Hosanagara", cities: ["Hosanagara", "Ripponpet"] },
      { name: "Sagar", cities: ["Sagar", "Jog Falls", "Talguppa"] },
      { name: "Shikaripura", cities: ["Shikaripura", "Kumsi"] },
      { name: "Soraba", cities: ["Soraba", "Anavatti"] },
      { name: "Thirthahalli", cities: ["Thirthahalli", "Agumbe"] },
    ],
  },
  "Tumakuru (Tumkur)": {
    taluks: [
      { name: "Tumakuru", cities: ["Tumakuru", "Kyathasandra"] },
      { name: "Chiknayakanhalli", cities: ["Chiknayakanhalli", "Huliyar"] },
      { name: "Gubbi", cities: ["Gubbi", "Chelur"] },
      { name: "Koratagere", cities: ["Koratagere", "Bellavi"] },
      { name: "Kunigal", cities: ["Kunigal", "Huliyurdurga"] },
      { name: "Madhugiri", cities: ["Madhugiri", "Kodigenahalli"] },
      { name: "Pavagada", cities: ["Pavagada", "Nagalamadike"] },
      { name: "Sira", cities: ["Sira", "Bukkapatna"] },
      { name: "Tiptur", cities: ["Tiptur", "Honnavalli"] },
      { name: "Turuvekere", cities: ["Turuvekere", "Dandinashivara"] },
    ],
  },
  "Udupi": {
    taluks: [
      { name: "Udupi", cities: ["Udupi", "Manipal", "Malpe", "Kaup"] },
      { name: "Karkala", cities: ["Karkala", "Moodubidire", "Ajekar"] },
      { name: "Kundapura", cities: ["Kundapura", "Byndoor", "Gangolli"] },
    ],
  },
  "Uttara Kannada": {
    taluks: [
      { name: "Karwar", cities: ["Karwar", "Sadashivgad", "Binaga"] },
      { name: "Ankola", cities: ["Ankola", "Belekeri"] },
      { name: "Bhatkal", cities: ["Bhatkal", "Murudeshwar", "Shirali"] },
      { name: "Dandeli", cities: ["Dandeli", "Ganeshgudi"] },
      { name: "Haliyal", cities: ["Haliyal", "Bommanahalli"] },
      { name: "Honavar", cities: ["Honavar", "Manki", "Gerusoppa"] },
      { name: "Joida", cities: ["Joida", "Castle Rock"] },
      { name: "Kumta", cities: ["Kumta", "Gokarna", "Mirjan"] },
      { name: "Mundgod", cities: ["Mundgod", "Haleyangadi"] },
      { name: "Siddapur", cities: ["Siddapur", "Sirsi"] },
      { name: "Sirsi", cities: ["Sirsi", "Banavasi", "Sondha"] },
      { name: "Yellapur", cities: ["Yellapur", "Tattigeri"] },
    ],
  },
  "Vijayanagara": {
    taluks: [
      { name: "Hosapete", cities: ["Hosapete", "Hampi", "Kamalapur"] },
      { name: "Hagaribommanahalli", cities: ["Hagaribommanahalli", "Kotturu"] },
      { name: "Kudligi", cities: ["Kudligi", "Hagari"] },
      { name: "Kotturu", cities: ["Kotturu", "Mariyammanahalli"] },
    ],
  },
  "Vijayapura (Bijapur)": {
    taluks: [
      { name: "Vijayapura", cities: ["Vijayapura", "Torvi", "Almel"] },
      { name: "Basavana Bagewadi", cities: ["Basavana Bagewadi", "Managuli"] },
      { name: "Indi", cities: ["Indi", "Chadchan", "Devar Hippargi"] },
      { name: "Muddebihal", cities: ["Muddebihal", "Talikote"] },
      { name: "Sindgi", cities: ["Sindgi", "Devara Hippargi"] },
    ],
  },
  "Yadgir": {
    taluks: [
      { name: "Yadgir", cities: ["Yadgir", "Saidapur"] },
      { name: "Shahpur", cities: ["Shahpur", "Kakkera"] },
      { name: "Shorapur", cities: ["Shorapur", "Hunasagi", "Muddebihal"] },
    ],
  },
};

export function getTaluks(district: string): string[] {
  return KARNATAKA_GEO[district]?.taluks.map((t) => t.name) || [];
}

export function getCities(district: string, taluk: string): string[] {
  return KARNATAKA_GEO[district]?.taluks.find((t) => t.name === taluk)?.cities || [];
}
