export interface NigeriaState {
  name: string;
  lgas: string[];
}

export const NIGERIA_STATES: NigeriaState[] = [
  {
    name: 'Abia',
    lgas: [
      'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano',
      'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa',
      'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West',
      'Umuahia North', 'Umuahia South', 'Umunneochi',
    ],
  },
  {
    name: 'Adamawa',
    lgas: [
      'Ardo Kola', 'Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Guyuk',
      'Hong', 'Jada', 'Jimeta (Yola North)', 'Lamurde', 'Madagali', 'Maiha',
      'Mayo-Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan',
      'Shelleng', 'Song', 'Toungo', 'Yola South',
    ],
  },
  {
    name: 'Akwa Ibom',
    lgas: [
      'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim',
      'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom',
      'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Ituda (Itu)',
      'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium',
      'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko',
      'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo',
    ],
  },
  {
    name: 'Anambra',
    lgas: [
      'Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North',
      'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North',
      'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South',
      'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North',
      'Orumba South', 'Oyi',
    ],
  },
  {
    name: 'Bauchi',
    lgas: [
      'Alkaleri', 'Bauchi', 'Bogoro', 'Dambam', 'Darazo', 'Dass', 'Gamawa',
      'Ganjuwa', 'Giade', 'Itas/Gadau', "Jama'are", 'Katagum', 'Kirfi',
      'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki',
    ],
  },
  {
    name: 'Bayelsa',
    lgas: [
      'Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia',
      'Sagbama', 'Southern Ijaw', 'Yenagoa',
    ],
  },
  {
    name: 'Benue',
    lgas: [
      'Agatu', 'Ado', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East',
      'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi',
      'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka',
      'Ukum', 'Ushongo', 'Vandeikya',
    ],
  },
  {
    name: 'Borno',
    lgas: [
      'Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa',
      'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga',
      'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri',
      'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani',
    ],
  },
  {
    name: 'Cross River',
    lgas: [
      'Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki',
      'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku',
      'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala',
    ],
  },
  {
    name: 'Delta',
    lgas: [
      'Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East',
      'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North',
      'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North',
      'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North',
      'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South',
      'Warri South West',
    ],
  },
  {
    name: 'Ebonyi',
    lgas: [
      'Abakaliki', 'Afikpo North', 'Afikpo South (Edda)', 'Ebonyi',
      'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi',
      'Ohaozara', 'Ohaukwu', 'Onicha',
    ],
  },
  {
    name: 'Edo',
    lgas: [
      'Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East',
      'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East',
      'Etsako West', 'Igueben', 'Ikpoba-Okha', 'Oredo', 'Orhionmwon',
      'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West',
      'Uhunmwonde',
    ],
  },
  {
    name: 'Ekiti',
    lgas: [
      'Ado-Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West',
      'Emure', 'Gbonyin', 'Ido-Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje',
      'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye',
    ],
  },
  {
    name: 'Enugu',
    lgas: [
      'Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South',
      'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo',
      'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi',
      'Uzo Uwani',
    ],
  },
  {
    name: 'FCT (Abuja)',
    lgas: [
      'Abaji', 'Abuja Municipal Area Council (AMAC)', 'Bwari',
      'Gwagwalada', 'Kuje', 'Kwali',
    ],
  },
  {
    name: 'Gombe',
    lgas: [
      'Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe',
      'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba',
    ],
  },
  {
    name: 'Imo',
    lgas: [
      'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte',
      'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru',
      'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre',
      'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo',
      'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal',
      'Owerri North', 'Owerri West',
    ],
  },
  {
    name: 'Jigawa',
    lgas: [
      'Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse',
      'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia',
      'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa',
      'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni',
      'Sule Tankarkar', 'Taura', 'Yankwashi',
    ],
  },
  {
    name: 'Kaduna',
    lgas: [
      'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba',
      "Jema'a", 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko',
      'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi',
      'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria',
    ],
  },
  {
    name: 'Kano',
    lgas: [
      'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala',
      'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge',
      'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale',
      'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru',
      'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir',
      'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila',
      'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo',
      'Warawa', 'Wudil',
    ],
  },
  {
    name: 'Katsina',
    lgas: [
      'Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi',
      'Dan Musa', 'Dandume', 'Danja', 'Daura', 'Dutsi', 'Dutsin-Ma',
      'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Jikamshi', 'Kafur', 'Kaita',
      'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', "Mai'Adua",
      'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa',
      'Safana', 'Sandamu', 'Zango',
    ],
  },
  {
    name: 'Kebbi',
    lgas: [
      'Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi',
      'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse',
      'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko',
      'Yauri', 'Zuru',
    ],
  },
  {
    name: 'Kogi',
    lgas: [
      'Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah',
      'Igalamela Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja',
      'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro',
      'Omala', 'Yagba East', 'Yagba West',
    ],
  },
  {
    name: 'Kwara',
    lgas: [
      'Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East',
      'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro',
      'Offa', 'Oke Ero', 'Oyun', 'Pategi',
    ],
  },
  {
    name: 'Lagos',
    lgas: [
      'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
      'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja',
      'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo',
      'Oshodi-Isolo', 'Shomolu', 'Surulere',
    ],
  },
  {
    name: 'Nasarawa',
    lgas: [
      'Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona',
      'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba',
    ],
  },
  {
    name: 'Niger',
    lgas: [
      'Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati',
      'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama',
      'Mariga', 'Mashegu', 'Mokwa', 'Muya', 'Pailoro', 'Rafi', 'Rijau',
      'Shiroro', 'Suleja', 'Tafa', 'Wushishi',
    ],
  },
  {
    name: 'Ogun',
    lgas: [
      'Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota',
      'Egbado North (Yewa North)', 'Egbado South (Yewa South)', 'Ewekoro',
      'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode',
      'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda',
      'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu',
    ],
  },
  {
    name: 'Ondo',
    lgas: [
      'Akoko North-East', 'Akoko North-West', 'Akoko South-East',
      'Akoko South-West', 'Akure North', 'Akure South', 'Ese Odo',
      'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele',
      'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo',
    ],
  },
  {
    name: 'Osun',
    lgas: [
      'Aiyedaade', 'Aiyedire', 'Atakunmosa East', 'Atakunmosa West',
      'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore',
      'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South',
      'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun',
      'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa',
      'Olorunda', 'Oriade', 'Orolu', 'Osogbo',
    ],
  },
  {
    name: 'Oyo',
    lgas: [
      'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North',
      'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East',
      'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North',
      'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu',
      'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo',
      'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West',
      'Saki East', 'Saki West', 'Surulere',
    ],
  },
  {
    name: 'Plateau',
    lgas: [
      'Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South',
      'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu',
      'Mikang', 'Pankshin', "Qua'an Pan", 'Riyom', 'Shendam', 'Wase',
    ],
  },
  {
    name: 'Rivers',
    lgas: [
      'Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni',
      'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana',
      'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo',
      'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai',
    ],
  },
  {
    name: 'Sokoto',
    lgas: [
      'Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu',
      'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah',
      'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South',
      'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo',
    ],
  },
  {
    name: 'Taraba',
    lgas: [
      'Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo',
      'Karim Lamido', 'Kurmi', 'Lau', 'Sardauna', 'Takum', 'Ussa',
      'Wukari', 'Yorro', 'Zing',
    ],
  },
  {
    name: 'Yobe',
    lgas: [
      'Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba',
      'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru',
      'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari',
    ],
  },
  {
    name: 'Zamfara',
    lgas: [
      'Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu',
      'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi',
      'Talata Mafara', 'Tsafe', 'Zurmi',
    ],
  },
];

export const STATE_NAMES = NIGERIA_STATES.map((s) => s.name);

export function getLGAs(stateName: string): string[] {
  return NIGERIA_STATES.find((s) => s.name === stateName)?.lgas ?? [];
}

// Major cities grouped by state (~100 well-known cities/LGAs)
export const NIGERIA_CITIES: { city: string; state: string }[] = [
  { city: 'Lagos Island', state: 'Lagos' },
  { city: 'Lagos Mainland', state: 'Lagos' },
  { city: 'Ikeja', state: 'Lagos' },
  { city: 'Eti-Osa (Victoria Island/Lekki)', state: 'Lagos' },
  { city: 'Alimosho (Egbeda/Idimu)', state: 'Lagos' },
  { city: 'Surulere', state: 'Lagos' },
  { city: 'Kosofe (Ketu/Ikosi)', state: 'Lagos' },
  { city: 'Mushin', state: 'Lagos' },
  { city: 'Ikorodu', state: 'Lagos' },
  { city: 'Badagry', state: 'Lagos' },
  { city: 'Epe', state: 'Lagos' },
  { city: 'Abuja Municipal (Garki/Wuse/Maitama)', state: 'FCT - Abuja' },
  { city: 'Gwagwalada', state: 'FCT - Abuja' },
  { city: 'Kuje', state: 'FCT - Abuja' },
  { city: 'Bwari', state: 'FCT - Abuja' },
  { city: 'Kano Municipal', state: 'Kano' },
  { city: 'Fagge', state: 'Kano' },
  { city: 'Nasarawa (Kano)', state: 'Kano' },
  { city: 'Ungogo', state: 'Kano' },
  { city: 'Tarauni', state: 'Kano' },
  { city: 'Port Harcourt', state: 'Rivers' },
  { city: 'Obio-Akpor', state: 'Rivers' },
  { city: 'Eleme', state: 'Rivers' },
  { city: 'Aba North', state: 'Abia' },
  { city: 'Aba South', state: 'Abia' },
  { city: 'Umuahia North', state: 'Abia' },
  { city: 'Onitsha North', state: 'Anambra' },
  { city: 'Onitsha South', state: 'Anambra' },
  { city: 'Awka South', state: 'Anambra' },
  { city: 'Nnewi North', state: 'Anambra' },
  { city: 'Ibadan North', state: 'Oyo' },
  { city: 'Ibadan South-West', state: 'Oyo' },
  { city: 'Ogbomosho North', state: 'Oyo' },
  { city: 'Oyo East', state: 'Oyo' },
  { city: 'Akure South', state: 'Ondo' },
  { city: 'Akure North', state: 'Ondo' },
  { city: 'Ondo City', state: 'Ondo' },
  { city: 'Ile-Ife', state: 'Osun' },
  { city: 'Osogbo', state: 'Osun' },
  { city: 'Abeokuta North', state: 'Ogun' },
  { city: 'Abeokuta South', state: 'Ogun' },
  { city: 'Sagamu', state: 'Ogun' },
  { city: 'Ijebu Ode', state: 'Ogun' },
  { city: 'Ota (Ado-Odo)', state: 'Ogun' },
  { city: 'Ilorin East', state: 'Kwara' },
  { city: 'Ilorin South', state: 'Kwara' },
  { city: 'Ilorin West', state: 'Kwara' },
  { city: 'Minna', state: 'Niger' },
  { city: 'Suleja', state: 'Niger' },
  { city: 'Bida', state: 'Niger' },
  { city: 'Makurdi', state: 'Benue' },
  { city: 'Gboko', state: 'Benue' },
  { city: 'Lafia', state: 'Nasarawa' },
  { city: 'Keffi', state: 'Nasarawa' },
  { city: 'Jos North', state: 'Plateau' },
  { city: 'Jos South', state: 'Plateau' },
  { city: 'Bukuru', state: 'Plateau' },
  { city: 'Bauchi', state: 'Bauchi' },
  { city: 'Gombe', state: 'Gombe' },
  { city: 'Maiduguri', state: 'Borno' },
  { city: 'Konduga', state: 'Borno' },
  { city: 'Yola North', state: 'Adamawa' },
  { city: 'Yola South', state: 'Adamawa' },
  { city: 'Jalingo', state: 'Taraba' },
  { city: 'Damaturu', state: 'Yobe' },
  { city: 'Potiskum', state: 'Yobe' },
  { city: 'Sokoto North', state: 'Sokoto' },
  { city: 'Sokoto South', state: 'Sokoto' },
  { city: 'Birnin Kebbi', state: 'Kebbi' },
  { city: 'Argungu', state: 'Kebbi' },
  { city: 'Gusau', state: 'Zamfara' },
  { city: 'Talata Mafara', state: 'Zamfara' },
  { city: 'Katsina', state: 'Katsina' },
  { city: 'Daura', state: 'Katsina' },
  { city: 'Dutse', state: 'Jigawa' },
  { city: 'Hadejia', state: 'Jigawa' },
  { city: 'Kafanchan (Jema\'a)', state: 'Kaduna' },
  { city: 'Kaduna North', state: 'Kaduna' },
  { city: 'Kaduna South', state: 'Kaduna' },
  { city: 'Zaria', state: 'Kaduna' },
  { city: 'Lokoja', state: 'Kogi' },
  { city: 'Ankpa', state: 'Kogi' },
  { city: 'Anyigba (Dekina)', state: 'Kogi' },
  { city: 'Abuja Satellite (Nyanya/Karu)', state: 'Nasarawa' },
  { city: 'Warri', state: 'Delta' },
  { city: 'Asaba', state: 'Delta' },
  { city: 'Sapele', state: 'Delta' },
  { city: 'Ughelli North', state: 'Delta' },
  { city: 'Benin City', state: 'Edo' },
  { city: 'Egor', state: 'Edo' },
  { city: 'Ovia North-East (Igbanke)', state: 'Edo' },
  { city: 'Uyo', state: 'Akwa Ibom' },
  { city: 'Ikot Ekpene', state: 'Akwa Ibom' },
  { city: 'Eket', state: 'Akwa Ibom' },
  { city: 'Calabar Municipal', state: 'Cross River' },
  { city: 'Calabar South', state: 'Cross River' },
  { city: 'Ogoja', state: 'Cross River' },
  { city: 'Enugu North', state: 'Enugu' },
  { city: 'Enugu South', state: 'Enugu' },
  { city: 'Nsukka', state: 'Enugu' },
  { city: 'Abakaliki', state: 'Ebonyi' },
  { city: 'Owerri Municipal', state: 'Imo' },
  { city: 'Owerri North', state: 'Imo' },
  { city: 'Orlu', state: 'Imo' },
  { city: 'Yenagoa', state: 'Bayelsa' },
  { city: 'Ogbia (Oloibiri)', state: 'Bayelsa' },
];

export function getStateForCity(cityName: string): string {
  return NIGERIA_CITIES.find((c) => c.city === cityName)?.state ?? '';
}
