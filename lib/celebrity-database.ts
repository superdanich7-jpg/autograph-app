/**
 * Celebrity Database — единый источник правды для эталонных подписей.
 *
 * Содержит 50+ знаменитостей с метаданными, алиасами и уникальными
 * dHash-значениями. Используется signature-analyzer.ts и seed.ts.
 *
 * Категории: sports, music, movies, politics, other
 */

export type CelebrityCategory = 'sports' | 'music' | 'movies' | 'politics' | 'other';

export interface Celebrity {
    id: string;
    name: string;          // Основное имя (англ.)
    nameRu: string;        // Русское имя
    aliases: string[];     // Альтернативные имена, транслитерации, короткие имена
    category: CelebrityCategory;
    nationality: string;
    birthYear: number;
    tagline: string;       // Короткое описание (англ.)
    taglineRu: string;     // Короткое описание (рус.)
    hash: string;          // Уникальный dHash (16 hex chars = 64 bit)
    density: number;       // Плотность линий (0-100)
}

// ─── Хеш-генератор: детерминированный уникальный хеш из строки ───────────────
// FNV-1a 64-bit → берём младшие 64 бит → hex
function fnv1aHash(str: string): string {
    let hash = 0xcbf29ce484222325n; // FNV offset basis (64-bit)
    const fnvPrime = 0x100000001b3n;

    for (let i = 0; i < str.length; i++) {
        hash ^= BigInt(str.charCodeAt(i));
        hash = (hash * fnvPrime) & 0xffffffffffffffffn;
    }

    return hash.toString(16).padStart(16, '0');
}

// Генерируем плотность детерминированно из имени (40-65 диапазон — типичный для подписей)
function densityFromName(str: string): number {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
    }
    return 40 + (sum % 26); // 40-65
}

// ─── База данных знаменитостей ────────────────────────────────────────────────
const RAW_CELEBRITIES: Array<Omit<Celebrity, 'id' | 'hash' | 'density'>> = [
    // ═══════════════════════════════════════════════════════════════
    // SPORTS LEGENDS (Спорт)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Lionel Messi',
        nameRu: 'Лионель Месси',
        aliases: ['Messi', 'Лео Месси', 'Месси', 'Leo Messi', 'L. Messi'],
        category: 'sports',
        nationality: 'Argentine',
        birthYear: 1987,
        tagline: 'Legendary footballer',
        taglineRu: 'Легендарный футболист',
    },
    {
        name: 'Cristiano Ronaldo',
        nameRu: 'Криштиану Роналду',
        aliases: ['Ronaldo', 'CR7', 'Криштиану', 'Роналду', 'C. Ronaldo'],
        category: 'sports',
        nationality: 'Portuguese',
        birthYear: 1985,
        tagline: 'Football icon',
        taglineRu: 'Футбольная икона',
    },
    {
        name: 'Diego Maradona',
        nameRu: 'Диего Марадона',
        aliases: ['Maradona', 'Марадона', 'D. Maradona', 'Diego Armando Maradona'],
        category: 'sports',
        nationality: 'Argentine',
        birthYear: 1960,
        tagline: 'Football legend',
        taglineRu: 'Легенда футбола',
    },
    {
        name: 'Pele',
        nameRu: 'Пеле',
        aliases: ['Edson Arantes do Nascimento', 'Эдсон Арантес', 'Pelé'],
        category: 'sports',
        nationality: 'Brazilian',
        birthYear: 1940,
        tagline: 'King of football',
        taglineRu: 'Король футбола',
    },
    {
        name: 'Michael Jordan',
        nameRu: 'Майкл Джордан',
        aliases: ['Jordan', 'MJ', 'Джордан', 'Air Jordan', 'M. Jordan'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1963,
        tagline: 'Basketball GOAT',
        taglineRu: 'Лучший баскетболист в истории',
    },
    {
        name: 'Kobe Bryant',
        nameRu: 'Коби Брайант',
        aliases: ['Kobe', 'Коби', 'Bryant', 'Брайант', 'Black Mamba', 'K. Bryant'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1978,
        tagline: 'Mamba mentality',
        taglineRu: 'Менталитет Мамбы',
    },
    {
        name: 'LeBron James',
        nameRu: 'Леброн Джеймс',
        aliases: ['LeBron', 'Леброн', 'King James', 'James', 'Джеймс', 'L. James'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1984,
        tagline: 'King James',
        taglineRu: 'Король Джеймс',
    },
    {
        name: 'Stephen Curry',
        nameRu: 'Стефен Карри',
        aliases: ['Curry', 'Карри', 'Steph Curry', 'Стеф Карри', 'S. Curry'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1988,
        tagline: 'Greatest shooter',
        taglineRu: 'Величайший снайпер',
    },
    {
        name: 'Tom Brady',
        nameRu: 'Том Брэди',
        aliases: ['Brady', 'Брэди', 'TB12', 'T. Brady'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1977,
        tagline: '7x Super Bowl champion',
        taglineRu: '7-кратный чемпион Супербоула',
    },
    {
        name: 'Serena Williams',
        nameRu: 'Серена Уильямс',
        aliases: ['Serena', 'Серена', 'Williams', 'Уильямс', 'S. Williams'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1981,
        tagline: 'Tennis GOAT',
        taglineRu: 'Величайшая теннисистка',
    },
    {
        name: 'Roger Federer',
        nameRu: 'Роджер Федерер',
        aliases: ['Federer', 'Федерер', 'Roger', 'Роджер', 'R. Federer'],
        category: 'sports',
        nationality: 'Swiss',
        birthYear: 1981,
        tagline: 'Tennis maestro',
        taglineRu: 'Теннисный маэстро',
    },
    {
        name: 'Rafael Nadal',
        nameRu: 'Рафаэль Надаль',
        aliases: ['Nadal', 'Надаль', 'Rafa', 'Рафа', 'R. Nadal'],
        category: 'sports',
        nationality: 'Spanish',
        birthYear: 1986,
        tagline: 'King of clay',
        taglineRu: 'Король грунта',
    },
    {
        name: 'Novak Djokovic',
        nameRu: 'Новак Джокович',
        aliases: ['Djokovic', 'Джокович', 'Nole', 'Новак', 'N. Djokovic'],
        category: 'sports',
        nationality: 'Serbian',
        birthYear: 1987,
        tagline: 'Record holder',
        taglineRu: 'Рекордсмен',
    },
    {
        name: 'Usain Bolt',
        nameRu: 'Усэйн Болт',
        aliases: ['Bolt', 'Болт', 'Lightning Bolt', 'Усэйн', 'U. Bolt'],
        category: 'sports',
        nationality: 'Jamaican',
        birthYear: 1986,
        tagline: 'Fastest man alive',
        taglineRu: 'Самый быстрый человек',
    },
    {
        name: 'Muhammad Ali',
        nameRu: 'Мохаммед Али',
        aliases: ['Ali', 'Али', 'Cassius Clay', 'Кассиус Клей', 'M. Ali'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1942,
        tagline: 'The Greatest',
        taglineRu: 'Величайший',
    },
    {
        name: 'Mike Tyson',
        nameRu: 'Майк Тайсон',
        aliases: ['Tyson', 'Тайсон', 'Iron Mike', 'M. Tyson'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1966,
        tagline: 'Baddest man on the planet',
        taglineRu: 'Самый опасный на планете',
    },
    {
        name: 'Tiger Woods',
        nameRu: 'Тайгер Вудс',
        aliases: ['Tiger', 'Тайгер', 'Woods', 'Вудс', 'T. Woods'],
        category: 'sports',
        nationality: 'American',
        birthYear: 1975,
        tagline: 'Golf legend',
        taglineRu: 'Легенда гольфа',
    },
    {
        name: 'Wayne Gretzky',
        nameRu: 'Уэйн Гретцки',
        aliases: ['Gretzky', 'Гретцки', 'The Great One', 'W. Gretzky'],
        category: 'sports',
        nationality: 'Canadian',
        birthYear: 1961,
        tagline: 'The Great One',
        taglineRu: 'Великий',
    },
    {
        name: 'David Beckham',
        nameRu: 'Дэвид Бекхэм',
        aliases: ['Beckham', 'Бекхэм', 'Becks', 'D. Beckham'],
        category: 'sports',
        nationality: 'English',
        birthYear: 1975,
        tagline: 'Global football icon',
        taglineRu: 'Глобальная футбольная икона',
    },
    {
        name: 'Neymar',
        nameRu: 'Неймар',
        aliases: ['Neymar Jr', 'Неймар Жуниор', 'Neymar da Silva'],
        category: 'sports',
        nationality: 'Brazilian',
        birthYear: 1992,
        tagline: 'Brazilian football star',
        taglineRu: 'Бразильская футбольная звезда',
    },
    {
        name: 'Maria Sharapova',
        nameRu: 'Мария Шарапова',
        aliases: ['Sharapova', 'Шарапова', 'Маша Шарапова', 'M. Sharapova'],
        category: 'sports',
        nationality: 'Russian',
        birthYear: 1987,
        tagline: 'Tennis champion',
        taglineRu: 'Теннисная чемпионка',
    },
    {
        name: 'Alexander Ovechkin',
        nameRu: 'Александр Овечкин',
        aliases: ['Ovechkin', 'Овечкин', 'Ovi', 'Алекс Овечкин', 'A. Ovechkin'],
        category: 'sports',
        nationality: 'Russian',
        birthYear: 1985,
        tagline: 'NHL goal scorer',
        taglineRu: 'Снайпер НХЛ',
    },
    {
        name: 'Evgeni Plushenko',
        nameRu: 'Евгений Плющенко',
        aliases: ['Plushenko', 'Плющенко', 'Женя Плющенко', 'E. Plushenko'],
        category: 'sports',
        nationality: 'Russian',
        birthYear: 1982,
        tagline: 'Figure skating legend',
        taglineRu: 'Легенда фигурного катания',
    },

    // ═══════════════════════════════════════════════════════════════
    // MUSIC ICONS (Музыка)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Taylor Swift',
        nameRu: 'Тейлор Свифт',
        aliases: ['Taylor', 'Тейлор', 'Swift', 'Свифт', 'T. Swift'],
        category: 'music',
        nationality: 'American',
        birthYear: 1989,
        tagline: 'Pop superstar',
        taglineRu: 'Поп-суперзвезда',
    },
    {
        name: 'Beyonce',
        nameRu: 'Бейонсе',
        aliases: ['Beyoncé', 'Queen Bey', 'Бейонсе Ноулз', 'Beyonce Knowles'],
        category: 'music',
        nationality: 'American',
        birthYear: 1981,
        tagline: 'Queen Bey',
        taglineRu: 'Королева Бей',
    },
    {
        name: 'Ed Sheeran',
        nameRu: 'Эд Ширан',
        aliases: ['Ed', 'Эд', 'Sheeran', 'Ширан', 'E. Sheeran'],
        category: 'music',
        nationality: 'British',
        birthYear: 1991,
        tagline: 'Singer-songwriter',
        taglineRu: 'Автор-исполнитель',
    },
    {
        name: 'Adele',
        nameRu: 'Адель',
        aliases: ['Adele Adkins', 'Адель Адкинс'],
        category: 'music',
        nationality: 'British',
        birthYear: 1988,
        tagline: 'Voice of a generation',
        taglineRu: 'Голос поколения',
    },
    {
        name: 'Drake',
        nameRu: 'Дрейк',
        aliases: ['Drake Graham', 'Aubrey Graham', 'Обри Грэм', 'Drizzy'],
        category: 'music',
        nationality: 'Canadian',
        birthYear: 1986,
        tagline: 'Rap icon',
        taglineRu: 'Икона рэпа',
    },
    {
        name: 'The Weeknd',
        nameRu: 'The Weeknd',
        aliases: ['Weeknd', 'Abel Tesfaye', 'Абель Тесфайе', 'Abel'],
        category: 'music',
        nationality: 'Canadian',
        birthYear: 1990,
        tagline: 'R&B star',
        taglineRu: 'R&B-звезда',
    },
    {
        name: 'Billie Eilish',
        nameRu: 'Билли Айлиш',
        aliases: ['Billie', 'Билли', 'Eilish', 'Айлиш', 'B. Eilish'],
        category: 'music',
        nationality: 'American',
        birthYear: 2001,
        tagline: 'Gen Z icon',
        taglineRu: 'Икона поколения Z',
    },
    {
        name: 'Justin Bieber',
        nameRu: 'Джастин Бибер',
        aliases: ['Bieber', 'Бибер', 'Justin', 'Джастин', 'J. Bieber'],
        category: 'music',
        nationality: 'Canadian',
        birthYear: 1994,
        tagline: 'Pop phenomenon',
        taglineRu: 'Поп-феномен',
    },
    {
        name: 'Rihanna',
        nameRu: 'Рианна',
        aliases: ['Robyn Rihanna Fenty', 'Робин Рианна Фенти', 'RiRi'],
        category: 'music',
        nationality: 'Barbadian',
        birthYear: 1988,
        tagline: 'Music & business mogul',
        taglineRu: 'Музыкальная и бизнес-магнат',
    },
    {
        name: 'Lady Gaga',
        nameRu: 'Леди Гага',
        aliases: ['Gaga', 'Гага', 'Stefani Germanotta', 'Стефани Германотта'],
        category: 'music',
        nationality: 'American',
        birthYear: 1986,
        tagline: 'Pop innovator',
        taglineRu: 'Поп-новатор',
    },
    {
        name: 'Kanye West',
        nameRu: 'Канье Уэст',
        aliases: ['Kanye', 'Канье', 'West', 'Уэст', 'Ye', 'Йе', 'K. West'],
        category: 'music',
        nationality: 'American',
        birthYear: 1977,
        tagline: 'Hip-hop visionary',
        taglineRu: 'Хип-хоп-визионер',
    },
    {
        name: 'Jay-Z',
        nameRu: 'Jay-Z',
        aliases: ['Jay Z', 'Shawn Carter', 'Шон Картер', 'Hova', 'Jigga'],
        category: 'music',
        nationality: 'American',
        birthYear: 1969,
        tagline: 'Rap billionaire',
        taglineRu: 'Рэп-миллиардер',
    },
    {
        name: 'Eminem',
        nameRu: 'Эминем',
        aliases: ['Marshall Mathers', 'Маршалл Мэтерс', 'Slim Shady', 'Слим Шейди', 'Marshall'],
        category: 'music',
        nationality: 'American',
        birthYear: 1972,
        tagline: 'Rap God',
        taglineRu: 'Бог рэпа',
    },
    {
        name: 'Elvis Presley',
        nameRu: 'Элвис Пресли',
        aliases: ['Elvis', 'Элвис', 'Presley', 'Пресли', 'The King', 'E. Presley'],
        category: 'music',
        nationality: 'American',
        birthYear: 1935,
        tagline: 'King of Rock',
        taglineRu: 'Король рок-н-ролла',
    },
    {
        name: 'Michael Jackson',
        nameRu: 'Майкл Джексон',
        aliases: ['MJ', 'Джексон', 'Jackson', 'King of Pop', 'Король поп-музыки', 'M. Jackson'],
        category: 'music',
        nationality: 'American',
        birthYear: 1958,
        tagline: 'King of Pop',
        taglineRu: 'Король поп-музыки',
    },
    {
        name: 'Freddie Mercury',
        nameRu: 'Фредди Меркьюри',
        aliases: ['Freddie', 'Фредди', 'Mercury', 'Меркьюри', 'F. Mercury', 'Farrokh Bulsara'],
        category: 'music',
        nationality: 'British',
        birthYear: 1946,
        tagline: 'Queen frontman',
        taglineRu: 'Фронтмен Queen',
    },
    {
        name: 'John Lennon',
        nameRu: 'Джон Леннон',
        aliases: ['Lennon', 'Леннон', 'John', 'Джон', 'J. Lennon'],
        category: 'music',
        nationality: 'British',
        birthYear: 1940,
        tagline: 'Beatle legend',
        taglineRu: 'Легенда Beatles',
    },
    {
        name: 'Paul McCartney',
        nameRu: 'Пол Маккартни',
        aliases: ['McCartney', 'Маккартни', 'Paul', 'Пол', 'Sir Paul', 'P. McCartney'],
        category: 'music',
        nationality: 'British',
        birthYear: 1942,
        tagline: 'Beatle legend',
        taglineRu: 'Легенда Beatles',
    },
    {
        name: 'Bob Dylan',
        nameRu: 'Боб Дилан',
        aliases: ['Dylan', 'Дилан', 'Bob', 'Боб', 'B. Dylan', 'Robert Zimmerman'],
        category: 'music',
        nationality: 'American',
        birthYear: 1941,
        tagline: 'Nobel laureate',
        taglineRu: 'Нобелевский лауреат',
    },
    {
        name: 'Bruce Springsteen',
        nameRu: 'Брюс Спрингстин',
        aliases: ['Springsteen', 'Спрингстин', 'The Boss', 'Bruce', 'Брюс', 'B. Springsteen'],
        category: 'music',
        nationality: 'American',
        birthYear: 1949,
        tagline: 'The Boss',
        taglineRu: 'Босс',
    },
    {
        name: 'Ariana Grande',
        nameRu: 'Ариана Гранде',
        aliases: ['Ariana', 'Ариана', 'Grande', 'Гранде', 'A. Grande'],
        category: 'music',
        nationality: 'American',
        birthYear: 1993,
        tagline: 'Pop vocal powerhouse',
        taglineRu: 'Поп-вокальная сила',
    },

    // ═══════════════════════════════════════════════════════════════
    // MOVIE STARS (Кино)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Leonardo DiCaprio',
        nameRu: 'Леонардо ДиКаприо',
        aliases: ['DiCaprio', 'ДиКаприо', 'Leo', 'Лео', 'Leonardo', 'Леонардо', 'L. DiCaprio'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1974,
        tagline: 'Oscar winner',
        taglineRu: 'Лауреат Оскара',
    },
    {
        name: 'Brad Pitt',
        nameRu: 'Брэд Питт',
        aliases: ['Brad', 'Брэд', 'Pitt', 'Питт', 'William Bradley Pitt', 'B. Pitt'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1963,
        tagline: 'Hollywood icon',
        taglineRu: 'Голливудская икона',
    },
    {
        name: 'Tom Cruise',
        nameRu: 'Том Круз',
        aliases: ['Cruise', 'Круз', 'Tom', 'Том', 'T. Cruise', 'Thomas Cruise'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1962,
        tagline: 'Action legend',
        taglineRu: 'Легенда экшена',
    },
    {
        name: 'Johnny Depp',
        nameRu: 'Джонни Депп',
        aliases: ['Depp', 'Депп', 'Johnny', 'Джонни', 'J. Depp', 'John Christopher Depp'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1963,
        tagline: 'Versatile actor',
        taglineRu: 'Универсальный актёр',
    },
    {
        name: 'Robert Downey Jr',
        nameRu: 'Роберт Дауни мл.',
        aliases: ['RDJ', 'Downey', 'Дауни', 'Iron Man', 'Железный человек', 'R. Downey', 'Robert Downey'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1965,
        tagline: 'Iron Man',
        taglineRu: 'Железный человек',
    },
    {
        name: 'Keanu Reeves',
        nameRu: 'Киану Ривз',
        aliases: ['Keanu', 'Киану', 'Reeves', 'Ривз', 'K. Reeves', 'Neo', 'John Wick'],
        category: 'movies',
        nationality: 'Canadian',
        birthYear: 1964,
        tagline: 'Beloved actor',
        taglineRu: 'Любимый актёр',
    },
    {
        name: 'Denzel Washington',
        nameRu: 'Дензел Вашингтон',
        aliases: ['Denzel', 'Дензел', 'Washington', 'Вашингтон', 'D. Washington'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1954,
        tagline: 'Acting legend',
        taglineRu: 'Легенда актёрского мастерства',
    },
    {
        name: 'Morgan Freeman',
        nameRu: 'Морган Фримен',
        aliases: ['Freeman', 'Фримен', 'Morgan', 'Морган', 'M. Freeman'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1937,
        tagline: 'Voice of God',
        taglineRu: 'Голос Бога',
    },
    {
        name: 'Al Pacino',
        nameRu: 'Аль Пачино',
        aliases: ['Pacino', 'Пачино', 'Al', 'Аль', 'A. Pacino', 'Alfredo Pacino'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1940,
        tagline: 'Method acting master',
        taglineRu: 'Мастер метод-актёрства',
    },
    {
        name: 'Tom Hanks',
        nameRu: 'Том Хэнкс',
        aliases: ['Hanks', 'Хэнкс', 'Tom', 'Том', 'T. Hanks', 'Thomas Hanks'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1956,
        tagline: "America's dad",
        taglineRu: 'Американский папа',
    },
    {
        name: 'Harrison Ford',
        nameRu: 'Харрисон Форд',
        aliases: ['Ford', 'Форд', 'Harrison', 'Харрисон', 'H. Ford', 'Indiana Jones', 'Han Solo'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1942,
        tagline: 'Indiana Jones / Han Solo',
        taglineRu: 'Индиана Джонс / Хан Соло',
    },
    {
        name: 'Samuel L. Jackson',
        nameRu: 'Сэмюэл Л. Джексон',
        aliases: ['Samuel Jackson', 'Сэмюэл Джексон', 'SLJ', 'Jackson', 'S. L. Jackson', 'Samuel'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1948,
        tagline: 'Highest grossing actor',
        taglineRu: 'Самый кассовый актёр',
    },
    {
        name: 'Will Smith',
        nameRu: 'Уилл Смит',
        aliases: ['Smith', 'Смит', 'Will', 'Уилл', 'W. Smith', 'Fresh Prince'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1968,
        tagline: 'Fresh Prince',
        taglineRu: 'Принц из Бель-Эйр',
    },
    {
        name: 'Dwayne Johnson',
        nameRu: 'Дуэйн Джонсон',
        aliases: ['The Rock', 'Скала', 'Rock', 'Dwayne', 'Дуэйн', 'D. Johnson'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1972,
        tagline: 'The Rock',
        taglineRu: 'Скала',
    },
    {
        name: 'Scarlett Johansson',
        nameRu: 'Скарлетт Йоханссон',
        aliases: ['Scarlett', 'Скарлетт', 'Johansson', 'Йоханссон', 'S. Johansson', 'Black Widow'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1984,
        tagline: 'MCU star',
        taglineRu: 'Звезда киновселенной Marvel',
    },
    {
        name: 'Meryl Streep',
        nameRu: 'Мэрил Стрип',
        aliases: ['Streep', 'Стрип', 'Meryl', 'Мэрил', 'M. Streep'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1949,
        tagline: 'Most nominated actress',
        taglineRu: 'Самая номинируемая актриса',
    },
    {
        name: 'Jennifer Lawrence',
        nameRu: 'Дженнифер Лоуренс',
        aliases: ['JLaw', 'Jennifer', 'Дженнифер', 'Lawrence', 'Лоуренс', 'J. Lawrence'],
        category: 'movies',
        nationality: 'American',
        birthYear: 1990,
        tagline: 'Oscar winner',
        taglineRu: 'Лауреат Оскара',
    },

    // ═══════════════════════════════════════════════════════════════
    // POLITICS & HISTORY (Политика и История)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Barack Obama',
        nameRu: 'Барак Обама',
        aliases: ['Obama', 'Обама', 'Barack', 'Барак', 'B. Obama', 'POTUS 44'],
        category: 'politics',
        nationality: 'American',
        birthYear: 1961,
        tagline: '44th US President',
        taglineRu: '44-й президент США',
    },
    {
        name: 'Donald Trump',
        nameRu: 'Дональд Трамп',
        aliases: ['Trump', 'Трамп', 'Donald', 'Дональд', 'D. Trump', 'POTUS 45'],
        category: 'politics',
        nationality: 'American',
        birthYear: 1946,
        tagline: '45th US President',
        taglineRu: '45-й президент США',
    },
    {
        name: 'Joe Biden',
        nameRu: 'Джо Байден',
        aliases: ['Biden', 'Байден', 'Joe', 'Джо', 'J. Biden', 'POTUS 46'],
        category: 'politics',
        nationality: 'American',
        birthYear: 1942,
        tagline: '46th US President',
        taglineRu: '46-й президент США',
    },
    {
        name: 'Vladimir Putin',
        nameRu: 'Владимир Путин',
        aliases: ['Putin', 'Путин', 'Vladimir', 'Владимир', 'V. Putin'],
        category: 'politics',
        nationality: 'Russian',
        birthYear: 1952,
        tagline: 'Russian President',
        taglineRu: 'Президент России',
    },
    {
        name: 'Nelson Mandela',
        nameRu: 'Нельсон Мандела',
        aliases: ['Mandela', 'Мандела', 'Nelson', 'Нельсон', 'N. Mandela', 'Madiba'],
        category: 'politics',
        nationality: 'South African',
        birthYear: 1918,
        tagline: 'Anti-apartheid icon',
        taglineRu: 'Икона борьбы с апартеидом',
    },
    {
        name: 'Winston Churchill',
        nameRu: 'Уинстон Черчилль',
        aliases: ['Churchill', 'Черчилль', 'Winston', 'Уинстон', 'W. Churchill'],
        category: 'politics',
        nationality: 'British',
        birthYear: 1874,
        tagline: 'WWII leader',
        taglineRu: 'Лидер Второй мировой',
    },
    {
        name: 'John F. Kennedy',
        nameRu: 'Джон Ф. Кеннеди',
        aliases: ['JFK', 'Kennedy', 'Кеннеди', 'Jack Kennedy', 'John Kennedy', 'J. F. Kennedy'],
        category: 'politics',
        nationality: 'American',
        birthYear: 1917,
        tagline: '35th US President',
        taglineRu: '35-й президент США',
    },
    {
        name: 'Abraham Lincoln',
        nameRu: 'Авраам Линкольн',
        aliases: ['Lincoln', 'Линкольн', 'Abe Lincoln', 'Авраам', 'A. Lincoln', 'Honest Abe'],
        category: 'politics',
        nationality: 'American',
        birthYear: 1809,
        tagline: '16th US President',
        taglineRu: '16-й президент США',
    },
    {
        name: 'Queen Elizabeth II',
        nameRu: 'Королева Елизавета II',
        aliases: ['Elizabeth', 'Елизавета', 'Queen Elizabeth', 'Королева Елизавета', 'QE2', 'Elizabeth II'],
        category: 'politics',
        nationality: 'British',
        birthYear: 1926,
        tagline: 'Longest reigning monarch',
        taglineRu: 'Самый долгоправящий монарх',
    },
    {
        name: 'Mahatma Gandhi',
        nameRu: 'Махатма Ганди',
        aliases: ['Gandhi', 'Ганди', 'Mahatma', 'Махатма', 'M. Gandhi', 'Gandhiji'],
        category: 'politics',
        nationality: 'Indian',
        birthYear: 1869,
        tagline: 'Father of India',
        taglineRu: 'Отец нации Индии',
    },
    {
        name: 'Martin Luther King Jr',
        nameRu: 'Мартин Лютер Кинг',
        aliases: ['MLK', 'King Jr', 'Кинг', 'Martin Luther King', 'Мартин Лютер Кинг', 'M. L. King'],
        category: 'politics',
        nationality: 'American',
        birthYear: 1929,
        tagline: 'Civil rights leader',
        taglineRu: 'Лидер движения за гражданские права',
    },

    // ═══════════════════════════════════════════════════════════════
    // RUSSIAN CELEBRITIES (Российские звёзды)
    // ═══════════════════════════════════════════════════════════════
    {
        name: 'Vladimir Vysotsky',
        nameRu: 'Владимир Высоцкий',
        aliases: ['Vysotsky', 'Высоцкий', 'Vladimir', 'Владимир', 'V. Vysotsky', 'Володя Высоцкий'],
        category: 'other',
        nationality: 'Russian',
        birthYear: 1938,
        tagline: 'Bard & actor legend',
        taglineRu: 'Легенда бардовской песни и кино',
    },
    {
        name: 'Alexander Pushkin',
        nameRu: 'Александр Пушкин',
        aliases: ['Pushkin', 'Пушкин', 'Alexander', 'Александр', 'A. Pushkin', 'А.С. Пушкин', 'Pushkin AS'],
        category: 'other',
        nationality: 'Russian',
        birthYear: 1799,
        tagline: 'Father of Russian literature',
        taglineRu: 'Отец русской литературы',
    },
    {
        name: 'Leo Tolstoy',
        nameRu: 'Лев Толстой',
        aliases: ['Tolstoy', 'Толстой', 'Leo', 'Лев', 'L. Tolstoy', 'Lev Tolstoy', 'Л.Н. Толстой'],
        category: 'other',
        nationality: 'Russian',
        birthYear: 1828,
        tagline: 'War and Peace author',
        taglineRu: 'Автор "Войны и мира"',
    },
    {
        name: 'Fyodor Dostoevsky',
        nameRu: 'Фёдор Достоевский',
        aliases: ['Dostoevsky', 'Достоевский', 'Fyodor', 'Фёдор', 'F. Dostoevsky', 'Dostoyevsky'],
        category: 'other',
        nationality: 'Russian',
        birthYear: 1821,
        tagline: 'Crime and Punishment author',
        taglineRu: 'Автор "Преступления и наказания"',
    },
    {
        name: 'Yuri Gagarin',
        nameRu: 'Юрий Гагарин',
        aliases: ['Gagarin', 'Гагарин', 'Yuri', 'Юрий', 'Y. Gagarin', 'Юра Гагарин'],
        category: 'other',
        nationality: 'Russian',
        birthYear: 1934,
        tagline: 'First human in space',
        taglineRu: 'Первый человек в космосе',
    },
    {
        name: 'Garry Kasparov',
        nameRu: 'Гарри Каспаров',
        aliases: ['Kasparov', 'Каспаров', 'Garry', 'Гарри', 'G. Kasparov'],
        category: 'other',
        nationality: 'Russian',
        birthYear: 1963,
        tagline: 'Chess world champion',
        taglineRu: 'Чемпион мира по шахматам',
    },
];

// ─── Генерация финальной базы с уникальными хешами ───────────────────────────
export const CELEBRITY_DATABASE: Celebrity[] = RAW_CELEBRITIES.map((c, index) => ({
    ...c,
    id: `celeb-${String(index + 1).padStart(3, '0')}`,
    hash: fnv1aHash(c.name.toLowerCase()),
    density: densityFromName(c.name),
}));

// ─── Утилиты поиска ───────────────────────────────────────────────────────────

/**
 * Levenshtein distance — количество правок для превращения одной строки в другую.
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // замена
                    matrix[i][j - 1] + 1,     // вставка
                    matrix[i - 1][j] + 1      // удаление
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Нормализованная схожесть строк (0-1), где 1 = идентичны.
 */
export function stringSimilarity(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
    return 1 - distance / maxLen;
}

/**
 * Проверяет, содержит ли текст имя знаменитости или любой из алиасов.
 * Возвращает 0-1 (доля совпавших токенов).
 */
export function nameMatchScore(query: string, celebrity: Celebrity): number {
    const queryLower = query.toLowerCase().trim();
    if (!queryLower) return 0;

    // 1. Прямое совпадение по полному имени
    const fullNameSim = stringSimilarity(queryLower, celebrity.name.toLowerCase());
    if (fullNameSim > 0.8) return fullNameSim;

    // 2. Совпадение по русскому имени
    const ruNameSim = stringSimilarity(queryLower, celebrity.nameRu.toLowerCase());
    if (ruNameSim > 0.8) return ruNameSim;

    // 3. Проверка алиасов
    let bestAliasScore = 0;
    for (const alias of celebrity.aliases) {
        const aliasLower = alias.toLowerCase();
        const aliasSim = stringSimilarity(queryLower, aliasLower);

        // Точное включение алиаса в запрос
        if (queryLower.includes(aliasLower) && aliasLower.length > 2) {
            bestAliasScore = Math.max(bestAliasScore, 0.9);
        }

        // Высокая схожесть с алиасом
        if (aliasSim > bestAliasScore) {
            bestAliasScore = aliasSim;
        }
    }

    // 4. Токенизация: проверяем, сколько токенов запроса совпадает с именем/алиасами
    const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 1);
    const celebTokens = [
        ...celebrity.name.toLowerCase().split(/\s+/),
        ...celebrity.nameRu.toLowerCase().split(/\s+/),
        ...celebrity.aliases.map((a) => a.toLowerCase()),
    ].filter((t) => t.length > 1);

    let tokenMatches = 0;
    for (const qt of queryTokens) {
        for (const ct of celebTokens) {
            if (qt === ct || stringSimilarity(qt, ct) > 0.85) {
                tokenMatches++;
                break;
            }
        }
    }

    const tokenScore = queryTokens.length > 0 ? tokenMatches / queryTokens.length : 0;

    return Math.max(fullNameSim, ruNameSim, bestAliasScore, tokenScore);
}

/**
 * Поиск знаменитостей по строке. Возвращает отсортированный список.
 */
export function searchCelebrities(query: string, limit: number = 5): Celebrity[] {
    if (!query.trim()) return [];

    const scored = CELEBRITY_DATABASE.map((celeb) => ({
        celeb,
        score: nameMatchScore(query, celeb),
    }));

    return scored
        .filter((s) => s.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => s.celeb);
}

/**
 * Находит лучшее совпадение знаменитости по имени.
 * Возвращает null, если уверенность ниже порога.
 */
export function findCelebrityByName(
    name: string,
    threshold: number = 0.5
): Celebrity | null {
    const results = searchCelebrities(name, 1);
    if (results.length > 0) {
        const score = nameMatchScore(name, results[0]);
        if (score >= threshold) return results[0];
    }
    return null;
}

/**
 * Возвращает все категории с количеством знаменитостей.
 */
export function getCategoryStats(): Record<CelebrityCategory, number> {
    const stats: Record<CelebrityCategory, number> = {
        sports: 0,
        music: 0,
        movies: 0,
        politics: 0,
        other: 0,
    };

    for (const celeb of CELEBRITY_DATABASE) {
        stats[celeb.category]++;
    }

    return stats;
}

/**
 * Возвращает знаменитостей по категории.
 */
export function getCelebritiesByCategory(category: CelebrityCategory): Celebrity[] {
    return CELEBRITY_DATABASE.filter((c) => c.category === category);
}