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

    // Гейт «нужен аккаунт»
    gateProfileTitle: 'Профиль',
    gateProfileHint: 'Войдите, чтобы видеть свою коллекцию, витрину и статистику.',
    gateUploadTitle: 'Публикация автографов',
    gateUploadHint: 'Добавлять автографы могут только зарегистрированные коллекционеры.',

    // Публикация
    publishedToast: 'Автограф опубликован',
    publishErrorPhoto: 'Сначала выберите фотографию автографа.',
    publishErrorName: 'Укажите, чей это автограф.',
    error: 'Ошибка',
    placeUnspecified: 'Место не указано',

    // Лента: пустые состояния, поиск, сортировка
    feedEmptyTitle: 'Коллекция пока пуста',
    feedEmptyHint: 'Загрузите первый автограф — сообщество проверит его подлинность.',
    feedAddFirst: 'Добавить автограф',
    notFoundTitle: 'Ничего не найдено',
    notFoundHint: 'Попробуйте снять часть фильтров или изменить поисковый запрос.',
    clearSearch: 'Очистить поиск',
    resetFilters: 'Сбросить фильтры',
    resetAll: 'Сбросить всё',
    filterAll: 'Все',
    youSawItAll: 'Вы всё посмотрели',
    filterVerifiedOnly: 'Только подтвержденные',
    summaryVerified: 'Подтверждено',
    summaryDisputed: 'Спорных',
    summaryLegendary: 'Легендарных',
    searchPlaceholder: 'Поиск по имени, месту или заметке',
    sortNew: 'Новые',
    sortTrusted: 'Достоверные',
    sortDebated: 'Спорные',
    sortHint: 'Лента сразу отреагирует на изменения',
    requireAuthTitle: 'Требуется вход',
    cancel: 'Отмена',
    signInAction: 'Войти',

    // «Ещё»
    moreTitle: 'Ещё',
    back: 'Назад',
    sectionSocial: 'Сообщество',
    sectionCollection: 'Коллекция',
    sectionTools: 'Инструменты',
    rowFriends: 'Друзья',
    rowFriendsHint: 'Заявки, Presence, «Для вас»',
    rowMessages: 'Сообщения',
    rowMessagesHint: 'Личные диалоги коллекционеров',
    rowCommunities: 'Сообщества',
    rowCommunitiesHint: 'Публичные и приватные клубы',
    rowCollections: 'Подборки',
    rowCollectionsHint: 'Тематические коллекции постов',
    autographFallback: 'Автограф',

    // Онбординг
    onbSkip: 'Пропустить обучение',
    onbNext: 'Далее',
    onbCta: 'Добавить первый автограф',
    onbA11yNext: 'Следующий шаг обучения',
    onbPhotoTitle: 'Сфотографируйте автограф',
    onbPhotoDesc: 'Сделайте снимок подписи — ИИ подскажет, чей это автограф.',
    onb2Title: 'Сообщество проверит подлинность',
    onb2Text: 'Коллекционеры голосуют за подлинность. Больше голосов — выше доверие.',
    onbShareTitle: 'Собирайте и делитесь',
    onb3Text: 'Копите редкие находки, следите за ценой коллекции и получайте бейджи.',

    // Вход/регистрация
    authChecking: 'Проверяю данные аккаунта...',
    authCreating: 'Создаю аккаунт...',
    authCreated: 'Аккаунт создан. Перехожу в профиль...',
    authCreatedConfirm: 'Аккаунт создан. Если включено подтверждение email, откройте письмо и подтвердите вход.',
    authSignedIn: 'Вход выполнен. Перехожу в профиль...',
    authEmailNotConfirmed: 'Email еще не подтвержден. Откройте письмо и подтвердите аккаунт.',
    authEmailExists: 'Аккаунт с таким email уже есть. Попробуйте войти.',
    authInvalidEmail: 'Введите корректный email.',
    authWrongCredentials: 'Неверный email или пароль. Проверьте данные и попробуйте еще раз.',
    authServerNoResponse: 'Сервер не отвечает',
    authServerNoResponseBody: 'Сервер не отвечает. Проверьте подключение (из РФ может потребоваться VPN) и попробуйте позже.',
    authServiceError: 'Сервис авторизации вернул ошибку.',
    authSignupDisabled: 'Регистрация сейчас временно отключена.',
    authCloudNotConfigured: 'Облачная синхронизация не подключена. Проверьте настройки окружения.',
    authMinLength: 'Минимум 6 символов',
    authPasswordTooShort: 'Пароль должен быть не короче 6 символов.',
    authGuestBanner: 'Гостевой режим: просмотр доступен, лайки, комментарии и голоса выключены.',
    authSubtitle: 'Войдите, чтобы синхронизировать коллекцию в облаке.',
    authPassword: 'Пароль',
    authRegister: 'Зарегистрироваться',
    authGuestContinue: 'Продолжить без входа',

    // Профиль: синхронизация, настройки, модалки
    syncAutoLoading: 'Автоматически загружаю данные...',
    syncLocalLoading: 'Загрузка локальных данных...',
    syncOffline: 'Демо-режим: данные сохраняются на устройстве',
    syncErrorStatus: 'Ошибка синхронизации — попробуйте позже',
    syncActive: 'Автосохранение активно',
    syncActiveAt: 'Автосохранение активно • {date}',
    guestViewOnly: 'Гостевой режим: только просмотр',
    disputedCards: 'Спорные автографы',
    disputedNow: 'Сейчас {n} карточек с почти равным доверием сообщества.',
    uniqueNames: 'Уникальных имен',
    favCategory: 'Любимая категория',
    favCategoryEmpty: 'Пока не определена',
    goalTitle: 'Цель месяца',
    goalHint: 'Собрать 3 подтвержденных автографа с доверием сообщества 70% и выше.',
    profileEditTitle: 'Редактировать профиль',
    fieldName: 'Имя',
    fieldBio: 'Био',
    namePlaceholder: 'Ваше имя',
    bioPlaceholder: 'Коротко о вашей коллекции',
    save: 'Сохранить',
    signedOutTitle: 'Выход выполнен',
    signedOutBody: 'Локальный профиль сброшен.',
    cacheClearedTitle: 'Кэш очищен',
    cacheClearedBody: 'Локальная коллекция очищена.',
    clearCache: 'Очистить кэш',
    privacyPolicy: 'Политика конфиденциальности',
    signOut: 'Выйти',
    avatarAlert: 'Аватар',
    avatarComingSoon: 'Смена фото появится позже.',
    nameless: 'Без имени',
    themeToggleLabel: 'Переключить тему',
    russian: 'Русский',

    // Загрузка: шаги и поля
    upStepPhoto: 'Фото',
    upStepDetails: 'Детали',
    upStepVerify: 'Проверка',
    upHintPhoto: 'сфотографируйте подпись',
    upHintDetails: 'укажите детали',
    upHintVerify: 'проверьте и опубликуйте',
    upPublish: 'Опубликовать',
    upTitle: 'Новый автограф',
    upPickPhoto: 'Выберите фото автографа',
    upCamera: 'Камера',
    upGallery: 'Галерея',
    upFieldCategory: 'Категория',
    upFieldRarity: 'Редкость',
    upFieldEvidence: 'Доказательства',
    upPhotoTip: 'Лучше всего смотрится фото без бликов и с ровным светом.',
    upPublishing: 'Публикация...',
    fieldWhose: 'Чей автограф',
    placeholderCelebrity: 'Например: Лионель Месси',
    fieldWhere: 'Где получен',
    placeholderLocation: 'Например: Стадион Лужники',
    fieldWhen: 'Когда получен',
    placeholderDate: 'Например: 15.04.2024',
    fieldCaption: 'Комментарий',
    placeholderCaption: 'Пара деталей о встрече, атмосфере или самой подписи',
    permTitle: 'Нужен доступ',
    permCameraBody: 'Разрешите доступ к камере в настройках устройства.',
    permPhotoBody: 'Разрешите доступ к фото в настройках устройства.',
    analysisFailed: 'Автопроверку не удалось выполнить — введите имя знаменитости вручную',
    achievementTitle: '🏆 Новое достижение!',

    // Клуб (community)
    clubTitle: 'Клуб',
    topCollectors: 'Топ коллекционеров',
    disputedCases: 'Спорные кейсы',
    cardVerifications: '{location} • {votes} подтверждений',
    cardVotesSplit: '{real} за реальный • {fake} за фейк',
    activityUploaded: '{name} загрузил карточку "{card}" и получил {votes} подтверждений',
    activitySaved: '{name} сохранил в избранное карточку "{card}"',
    followingCount: '{n} подписок',
    collectorScore: '{specialty} • {score} очков',
    clubSubtitle: 'Лидерборд коллекционеров, подписки и живой поток активности.',
    activityFeed: 'Лента активности',
    subscriptions: 'Подписки',
    bestTrust: 'Лучшее доверие',
    needVotes: 'Нужны голоса',
    strongCards: 'Сильные карточки',
    yourCollection: 'Ваша коллекция',
    follow: 'Подписаться',
    following: 'Вы подписаны',
    demoBadge: 'Демо-данные',
    latestEvents: 'Последние события',
    noShowcase: 'Пока нет карточек, чтобы собрать витрину сообщества.',
    noFollowing: 'Пока ни на кого не подписаны. Выберите коллекционеров из рейта выше.',
    noDisputed: 'Сейчас спорных карточек нет. Сообщество довольно уверено.',
    demoActivity1: 'Arena Hunter подтвердил редкий автограф из мира спорта',
    demoActivity2: 'Signature Vault добавил новую карточку с сертификатом подлинности',

    // Чат
    chatTitle: 'Сообщения',
    chatSubtitle: 'Переписка с другими коллекционерами',
    chatDemoBadge: 'Демо-переписка — предзаполнена для примера',
    chatPeerFallback: 'Собеседник',
    chatNoMessages: 'Пока нет сообщений.',
    chatMessagePlaceholder: 'Сообщение...',
    chatSend: 'Отправить',
    chatBackToDialogs: 'Назад к диалогам',

    // Детальный просмотр и комментарии
    detailEvidence: 'Доказательства',
    detailIdentity: 'Распознанная личность',
    detailNoDescription: 'Без описания',
    matchSuffix: '{n}% совпадения',
    shareCertificate: 'Поделиться сертификатом подлинности',
    shareCertificateError: 'Не удалось поделиться сертификатом',
    commentsTitle: 'Комментарии',
    commentsEmpty: 'Комментариев пока нет. Можно оставить первый.',
    commentPlaceholder: 'Написать комментарий...',

    // Подборки в карточке поста
    addToCollection: 'В подборку',
    selectCollection: 'Выберите подборку:',
    addedToCollection: 'Добавлено в подборку',
    myCollectionDefault: 'Моя подборка',
    dateNotSpecified: 'Дата не указана',
    addedFromDetail: 'Автографы, добавленные из детального просмотра',
    detailAuthenticity: 'Достоверность: {n}%',

    // Шеринг
    recommendedForYou: 'Вам может понравиться',
    shareTitle: 'Поделиться автографом',
    shareChoose: 'Выберите способ шеринга',
    shareAction: 'Поделиться',
    copyLink: 'Копировать ссылку',
    saveGallery: 'Сохранить в галерею',
    qrSaved: 'QR-код сохранен в галерее',
    qrFailed: 'Не удалось сгенерировать QR-код.',
    linkCopied: 'Ссылка скопирована',
    shareError: 'Ошибка при отправке',
    success: 'Успех',

    // Страница коллекционера
    collectorShowcase: 'Витрина коллекционера',
    collectorVerified: 'Проверено',
    collectorPoints: 'Очков',
    messageAction: 'Написать',
    collectorNotFound: 'Профиль не найден',

    // 404, Sheet
    nfTitle: 'Ой!',
    nfText: 'Такой экран не существует.',
    nfHome: 'Вернуться на главную',
    close: 'Закрыть',
    sheetDragHint: 'Потяните вниз чтобы закрыть',

    // Политика конфиденциальности
    privacyTitle: 'Политика конфиденциальности',
    privacyUpdated: 'Последнее обновление: 26 октября 2026',
    privacySupport: 'Написать в поддержку',
    privacyS1Title: '1. Какие данные мы обрабатываем',
    privacyS1Body: '• Email и пароль — только для входа в аккаунт (пароль хранится в виде хеша).\n• Фотографии автографов, которые вы сами загружаете.\n• Метаданные поста: имя знаменитости, категория, редкость, дата и место получения (по желанию).\n• Данные на устройстве (локальная коллекция, настройки) — хранятся локально и не покидают телефон без вашего входа в аккаунт.',
    privacyS2Title: '2. Где хранятся данные',
    privacyS2Body: 'Облачные данные — в Supabase (регион EU, Ирландия). Фото — в объектном хранилище Supabase Storage. Передача данных выполняется по HTTPS.',
    privacyS3Title: '3. Аналитика',
    privacyS3Body: 'Мы можем собирать обезличенную статистику использования (события вроде «создан пост», «поделиться») для улучшения продукта. Данные не продаются и не передаются третьим лицам для рекламы.',
    privacyS4Title: '4. Ваши права',
    privacyS4Body: 'Вы можете в любой момент: экспортировать коллекцию (Настройки → Ещё → Экспорт), удалить локальные данные (Настройки → Очистить кэш) или запросить удаление аккаунта и облачных данных по контакту ниже.',
    privacyS5Title: '5. Дети',
    privacyS5Body: 'Приложение не предназначено для лиц младше 13 лет.',
    privacyS6Title: '6. Контакты',
    privacyS6Body: 'Вопросы по приватности: autograph.app.support@gmail.com',
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

    gateProfileTitle: 'Profile',
    gateProfileHint: 'Sign in to see your collection, showcase and stats.',
    gateUploadTitle: 'Publish autographs',
    gateUploadHint: 'Only registered collectors can add autographs.',

    publishedToast: 'Autograph published',
    publishErrorPhoto: 'Pick a photo of the autograph first.',
    publishErrorName: 'Whose autograph is this?',
    error: 'Error',
    placeUnspecified: 'Location not specified',

    feedEmptyTitle: 'Nothing here yet',
    feedEmptyHint: 'Upload your first autograph — the community will verify it.',
    feedAddFirst: 'Add autograph',
    notFoundTitle: 'Nothing found',
    notFoundHint: 'Try removing some filters or changing the search query.',
    clearSearch: 'Clear search',
    resetFilters: 'Reset filters',
    resetAll: 'Reset all',
    filterAll: 'All',
    youSawItAll: 'You are all caught up',
    filterVerifiedOnly: 'Verified only',
    summaryVerified: 'Verified',
    summaryDisputed: 'Disputed',
    summaryLegendary: 'Legendary',
    searchPlaceholder: 'Search by name, place or note',
    sortNew: 'Newest',
    sortTrusted: 'Trusted',
    sortDebated: 'Debated',
    sortHint: 'The feed reacts instantly',
    requireAuthTitle: 'Sign-in required',
    cancel: 'Cancel',
    signInAction: 'Sign in',

    moreTitle: 'More',
    back: 'Back',
    sectionSocial: 'Community',
    sectionCollection: 'Collection',
    sectionTools: 'Tools',
    rowFriends: 'Friends',
    rowFriendsHint: 'Requests, presence, "For you"',
    rowMessages: 'Messages',
    rowMessagesHint: 'Private collector chats',
    rowCommunities: 'Communities',
    rowCommunitiesHint: 'Public and private clubs',
    rowCollections: 'Collections',
    rowCollectionsHint: 'Themed post collections',
    autographFallback: 'Autograph',

    onbSkip: 'Skip intro',
    onbNext: 'Next',
    onbCta: 'Add your first autograph',
    onbA11yNext: 'Next intro step',
    onbPhotoTitle: 'Photograph the autograph',
    onbPhotoDesc: 'Take a shot of the signature — AI will suggest whose it is.',
    onb2Title: 'The community verifies authenticity',
    onb2Text: 'Collectors vote on authenticity. More votes — more trust.',
    onbShareTitle: 'Collect & share',
    onb3Text: 'Grow rare finds, track your collection value and earn badges.',

    authChecking: 'Checking account...',
    authCreating: 'Creating account...',
    authCreated: 'Account created. Taking you to your profile...',
    authCreatedConfirm: 'Account created. If email confirmation is on, open the email and confirm your sign-in.',
    authSignedIn: 'Signed in. Taking you to your profile...',
    authEmailNotConfirmed: 'Email is not confirmed yet. Open the email and confirm your account.',
    authEmailExists: 'An account with this email already exists. Try signing in.',
    authInvalidEmail: 'Enter a valid email.',
    authWrongCredentials: 'Wrong email or password. Check your details and try again.',
    authServerNoResponse: 'Server is not responding',
    authServerNoResponseBody: 'The server is not responding. Check your connection (VPN may be required from Russia) and try again later.',
    authServiceError: 'The auth service returned an error.',
    authSignupDisabled: 'Sign-up is temporarily disabled.',
    authCloudNotConfigured: 'Cloud sync is not configured. Check environment settings.',
    authMinLength: 'At least 6 characters',
    authPasswordTooShort: 'The password must be at least 6 characters.',
    authGuestBanner: 'Guest mode: browsing only — likes, comments and votes are disabled.',
    authSubtitle: 'Sign in to sync your collection to the cloud.',
    authPassword: 'Password',
    authRegister: 'Create account',
    authGuestContinue: 'Continue without signing in',

    syncAutoLoading: 'Automatically loading data...',
    syncLocalLoading: 'Loading local data...',
    syncOffline: 'Demo mode: data is saved on the device',
    syncErrorStatus: 'Sync error — try again later',
    syncActive: 'Auto-save is on',
    syncActiveAt: 'Auto-save is on • {date}',
    guestViewOnly: 'Guest mode: view only',
    disputedCards: 'Disputed autographs',
    disputedNow: 'Currently {n} cards with nearly equal community trust.',
    uniqueNames: 'Unique names',
    favCategory: 'Favorite category',
    favCategoryEmpty: 'Not determined yet',
    goalTitle: 'Monthly goal',
    goalHint: 'Collect 3 verified autographs with 70%+ community trust.',
    profileEditTitle: 'Edit profile',
    fieldName: 'Name',
    fieldBio: 'Bio',
    namePlaceholder: 'Your name',
    bioPlaceholder: 'A few words about your collection',
    save: 'Save',
    signedOutTitle: 'Signed out',
    signedOutBody: 'Local profile has been reset.',
    cacheClearedTitle: 'Cache cleared',
    cacheClearedBody: 'Local collection has been cleared.',
    clearCache: 'Clear cache',
    privacyPolicy: 'Privacy policy',
    signOut: 'Sign out',
    avatarAlert: 'Avatar',
    avatarComingSoon: 'Photo change is coming later.',
    nameless: 'Unnamed',
    themeToggleLabel: 'Toggle theme',
    russian: 'Russian',

    upStepPhoto: 'Photo',
    upStepDetails: 'Details',
    upStepVerify: 'Review',
    upHintPhoto: 'photograph the signature',
    upHintDetails: 'add the details',
    upHintVerify: 'review and publish',
    upPublish: 'Publish',
    upTitle: 'New autograph',
    upPickPhoto: 'Pick a photo of the autograph',
    upCamera: 'Camera',
    upGallery: 'Gallery',
    upFieldCategory: 'Category',
    upFieldRarity: 'Rarity',
    upFieldEvidence: 'Evidence',
    upPhotoTip: 'A glare-free photo in even light works best.',
    upPublishing: 'Publishing...',
    fieldWhose: 'Whose autograph',
    placeholderCelebrity: 'e.g. Lionel Messi',
    fieldWhere: 'Where obtained',
    placeholderLocation: 'e.g. Luzhniki Stadium',
    fieldWhen: 'When obtained',
    placeholderDate: 'e.g. 15.04.2024',
    fieldCaption: 'Caption',
    placeholderCaption: 'A few details about the meeting, the atmosphere or the signature',
    permTitle: 'Permission needed',
    permCameraBody: 'Allow camera access in device settings.',
    permPhotoBody: 'Allow photo access in device settings.',
    analysisFailed: 'Auto-check failed — enter the celebrity name manually',
    achievementTitle: '🏆 New achievement!',

    clubTitle: 'Club',
    topCollectors: 'Top collectors',
    disputedCases: 'Disputed cases',
    cardVerifications: '{location} • {votes} verifications',
    cardVotesSplit: '{real} real • {fake} fake',
    activityUploaded: '{name} uploaded a card "{card}" and got {votes} verifications',
    activitySaved: '{name} saved the card "{card}" to favorites',
    followingCount: '{n} following',
    collectorScore: '{specialty} • {score} points',
    clubSubtitle: 'Collector leaderboard, follows and a live activity feed.',
    activityFeed: 'Activity feed',
    subscriptions: 'Following',
    bestTrust: 'Best trust',
    needVotes: 'Needs votes',
    strongCards: 'Strong cards',
    yourCollection: 'Your collection',
    follow: 'Follow',
    following: 'Following',
    demoBadge: 'Demo data',
    latestEvents: 'Latest events',
    noShowcase: 'No cards yet to build the community showcase.',
    noFollowing: 'Not following anyone yet. Pick collectors from the ranking above.',
    noDisputed: 'No disputed cards right now. The community is fairly confident.',
    demoActivity1: 'Arena Hunter verified a rare sports autograph',
    demoActivity2: 'Signature Vault added a new card with a certificate of authenticity',

    chatTitle: 'Messages',
    chatSubtitle: 'Chats with other collectors',
    chatDemoBadge: 'Demo chat — pre-filled as an example',
    chatPeerFallback: 'Peer',
    chatNoMessages: 'No messages yet.',
    chatMessagePlaceholder: 'Message...',
    chatSend: 'Send',
    chatBackToDialogs: 'Back to dialogs',

    detailEvidence: 'Evidence',
    detailIdentity: 'Identified person',
    detailNoDescription: 'No description',
    matchSuffix: '{n}% match',
    shareCertificate: 'Share certificate of authenticity',
    shareCertificateError: 'Failed to share the certificate',
    commentsTitle: 'Comments',
    commentsEmpty: 'No comments yet. Be the first.',
    commentPlaceholder: 'Write a comment...',

    addToCollection: 'To collection',
    selectCollection: 'Pick a collection:',
    addedToCollection: 'Added to collection',
    myCollectionDefault: 'My collection',
    dateNotSpecified: 'Date not specified',
    addedFromDetail: 'Autographs added from the detail view',
    detailAuthenticity: 'Authenticity: {n}%',

    recommendedForYou: 'You may like',
    shareTitle: 'Share autograph',
    shareChoose: 'Choose a sharing method',
    shareAction: 'Share',
    copyLink: 'Copy link',
    saveGallery: 'Save to gallery',
    qrSaved: 'QR code saved to gallery',
    qrFailed: 'Failed to generate the QR code.',
    linkCopied: 'Link copied',
    shareError: 'Error while sharing',
    success: 'Success',

    collectorShowcase: 'Collector showcase',
    collectorVerified: 'Verified',
    collectorPoints: 'Points',
    messageAction: 'Message',
    collectorNotFound: 'Profile not found',

    nfTitle: 'Oops!',
    nfText: 'This screen does not exist.',
    nfHome: 'Back to home',
    close: 'Close',
    sheetDragHint: 'Pull down to close',

    privacyTitle: 'Privacy policy',
    privacyUpdated: 'Last updated: October 26, 2026',
    privacySupport: 'Contact support',
    privacyS1Title: '1. What data we process',
    privacyS1Body: '• Email and password — used only to sign in (the password is stored as a hash).\n• Photos of autographs you upload yourself.\n• Post metadata: celebrity name, category, rarity, date and place obtained (optional).\n• On-device data (local collection, settings) — stored locally and never leaves the phone until you sign in.',
    privacyS2Title: '2. Where data is stored',
    privacyS2Body: 'Cloud data — in Supabase (EU region, Ireland). Photos — in Supabase Storage object storage. All transfer goes over HTTPS.',
    privacyS3Title: '3. Analytics',
    privacyS3Body: 'We may collect anonymous usage statistics (events like "post created", "share") to improve the product. Data is never sold or shared with third parties for advertising.',
    privacyS4Title: '4. Your rights',
    privacyS4Body: 'At any time you can: export your collection (Settings → More → Export), delete local data (Settings → Clear cache), or request deletion of your account and cloud data via the contact below.',
    privacyS5Title: '5. Children',
    privacyS5Body: 'The app is not intended for persons under 13.',
    privacyS6Title: '6. Contacts',
    privacyS6Body: 'Privacy questions: autograph.app.support@gmail.com',
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

// ─── Метки домена: категории / редкость / доказательства ───
// Локальные объединения строк (совпадают с PostCategory/RarityLevel/EvidenceType
// из PostsContext) — без цикла импортов.

export type CategoryValue = 'sports' | 'music' | 'movies' | 'politics' | 'other';
export type RarityValue = 'common' | 'rare' | 'legendary';
export type EvidenceValue = 'photo' | 'selfie' | 'ticket' | 'video' | 'certificate';

const categoryLabels: Record<Lang, Record<CategoryValue, string>> = {
    ru: { sports: 'Спорт', music: 'Музыка', movies: 'Кино', politics: 'Политика', other: 'Другое' },
    en: { sports: 'Sports', music: 'Music', movies: 'Movies', politics: 'Politics', other: 'Other' },
};

const rarityLabels: Record<Lang, Record<RarityValue, string>> = {
    ru: { common: 'Обычный', rare: 'Редкий', legendary: 'Легендарный' },
    en: { common: 'Common', rare: 'Rare', legendary: 'Legendary' },
};

const evidenceLabels: Record<Lang, Record<EvidenceValue, string>> = {
    ru: { photo: 'Фото', selfie: 'Селфи', ticket: 'Билет', video: 'Видео', certificate: 'Сертификат' },
    en: { photo: 'Photo', selfie: 'Selfie', ticket: 'Ticket', video: 'Video', certificate: 'Certificate' },
};

export function categoryLabel(value: string, lang: Lang): string {
    return categoryLabels[lang][value as CategoryValue] ?? categoryLabels.ru.other;
}

export function rarityLabel(value: string, lang: Lang): string {
    return rarityLabels[lang][value as RarityValue] ?? rarityLabels.ru.common;
}

export function evidenceLabel(value: string, lang: Lang): string {
    return evidenceLabels[lang][value as EvidenceValue] ?? value;
}
