/**
 * i18n — переводы RU/EN.
 * Словарь плоский: ключ → строка, интерполяция через {переменную}.
 * Язык выбирается в настройках профиля (context/LanguageContext), по умолчанию — язык системы.
 * Покрытие наращивается постепенно: таб-бар, лента, профиль, загрузка — сейчас; остальное мигрируется по мере касания.
 */

export type Lang = 'ru' | 'en';

const ru = {
    // Таб-бар
    tabFeed: 'Лента',
    tabAdd: 'Добавить',
    tabProfile: 'Профиль',

    // Шапка ленты
    feedTitle: 'Лента',
    feedSubtitle: 'Лента автографов сообщества',
    filtersActive: 'Фильтров активно: {n}',
    searchFilters: 'Поиск и фильтры',

    // Карточка ленты
    voteReal: 'Подтверждаю',
    voteFake: 'Фейк',
    received: 'Получен: {value}',
    noName: 'Автограф без имени',
    voteStats: '{real} за реальный • {fake} за фейк',
    guestVoteHint: 'Войдите, чтобы лайкать, комментировать и подтверждать автографы.',
    ownVoteHint: 'За собственный пост голосовать нельзя.',

    // Анализ подписи
    analyzing: 'Проверяю подпись...',
    analyzingHint: 'Выполняю предварительную оценку по фото и доступным признакам.',
    preCheck: 'Предварительная проверка',
    matchFound: 'Возможное совпадение: {name}',
    matchConfidence: 'Уверенность оценки: {n}%',

    // Профиль
    editProfile: 'Редактировать',
    more: 'Ещё',
    settings: 'Настройки',
    showcaseTitle: 'Витрина лучших',
    myCollection: 'Моя коллекция',
    savedTitle: 'Избранное',
    statPosts: 'Постов',
    statVerified: 'Подтверждено',
    statLegendary: 'Легендарных',
    statStreak: 'Дней подряд',
    trustPoints: '{n} очков доверия',
    collectionEmpty: 'Коллекция еще не заполнена',
    collectionEmptyHint: 'Когда добавите первый автограф, здесь появится компактная галерея.',

    // Настройки
    language: 'Язык',
    languageRu: 'Сейчас: русский',
    languageEn: 'Сейчас: английский',
    appearance: 'Оформление',
    themeNowLight: 'Сейчас: светлая тема',
    themeNowDark: 'Сейчас: тёмная тема',
    themeSwitchToDark: 'Тёмная',
    themeSwitchToLight: 'Светлая',
    notifications: 'Уведомления',
    notificationsHint: 'Напоминания о новых голосах и активности',
    guestAccess: 'Гостевой доступ',
    cloudSync: 'Облачная синхронизация',
    signIn: 'Войти или зарегистрироваться',

    // Клуб
    clubRow: 'Клуб коллекционеров',
    clubRowHint: 'Карточки, доверие, топ коллекционеров',
};

export type TranslationKey = keyof typeof ru;

const en: Record<TranslationKey, string> = {
    tabFeed: 'Feed',
    tabAdd: 'Add',
    tabProfile: 'Profile',

    feedTitle: 'Feed',
    feedSubtitle: 'Community autograph feed',
    filtersActive: '{n} filters active',
    searchFilters: 'Search & filters',

    voteReal: 'Real',
    voteFake: 'Fake',
    received: 'Received: {value}',
    noName: 'Unnamed autograph',
    voteStats: '{real} say real • {fake} say fake',
    guestVoteHint: 'Sign in to like, comment and verify autographs.',
    ownVoteHint: 'You cannot vote on your own post.',

    analyzing: 'Analyzing signature...',
    analyzingHint: 'Running a preliminary check on the photo and available cues.',
    preCheck: 'Preliminary check',
    matchFound: 'Possible match: {name}',
    matchConfidence: 'Confidence: {n}%',

    editProfile: 'Edit',
    more: 'More',
    settings: 'Settings',
    showcaseTitle: 'Best showcase',
    myCollection: 'My collection',
    savedTitle: 'Saved',
    statPosts: 'Posts',
    statVerified: 'Verified',
    statLegendary: 'Legendary',
    statStreak: 'Day streak',
    trustPoints: '{n} trust points',
    collectionEmpty: 'Collection is empty',
    collectionEmptyHint: 'Once you add your first autograph, a compact gallery will appear here.',

    language: 'Language',
    languageRu: 'Current: Russian',
    languageEn: 'Current: English',
    appearance: 'Appearance',
    themeNowLight: 'Current: light theme',
    themeNowDark: 'Current: dark theme',
    themeSwitchToDark: 'Dark',
    themeSwitchToLight: 'Light',
    notifications: 'Notifications',
    notificationsHint: 'Reminders about new votes and activity',
    guestAccess: 'Guest access',
    cloudSync: 'Cloud sync',
    signIn: 'Sign in or create account',

    clubRow: 'Collectors Club',
    clubRowHint: 'Cards, trust, top collectors',
};

export const translations: Record<Lang, Record<TranslationKey, string>> = { ru, en };

export function translate(
    lang: Lang,
    key: TranslationKey,
    vars?: Record<string, string | number>,
): string {
    let text: string = translations[lang][key] ?? translations.ru[key] ?? key;
    if (vars) {
        for (const [name, value] of Object.entries(vars)) {
            text = text.replaceAll(`{${name}}`, String(value));
        }
    }
    return text;
}

/** Определение языка без внешних зависимостей: web → настройки нативной ОС → ru. */
export function detectLang(): Lang {
    try {
        const locale =
            (typeof navigator !== 'undefined' ? navigator.language : undefined) ??
            (globalThis as { expo?: { localization?: { locale?: string } } }).expo?.localization?.locale;
        return locale?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
    } catch {
        return 'ru';
    }
}
