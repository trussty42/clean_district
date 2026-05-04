NAME_PATTERN = r'^[\w.@+-]+\Z'
WASTENAME_PATTERN = r'[a-zA-Zа-яА-ЯёЁ]+'

USER = 'user'
COMPANY_EMPLOYEE = 'employee'
COMPANY_LEADER = 'leader'
MODERATOR = 'moderator'
ADMIN = 'admin'

ROLE_CHOICES = {
    USER: 'Пользователь',
    MODERATOR: 'Модератор',
    ADMIN: 'Администратор'
}

ORGANIZATION_CHOICES = {
    COMPANY_EMPLOYEE: 'Работник',
    COMPANY_LEADER: 'Директор',
}

HAS_ORGANIZATION_RIGHTS = [
    MODERATOR,
    ADMIN
]

ORGANIZATION_STATUSES = [
    ('pending', 'На проверке'),
    ('active', 'Активна'),
    ('blocked', 'Заблокирована')
]

WASTE_TYPES = {
    'plastic': 'Пластик',
    'glass': 'Стекло',
    'electronic': 'Электроника',
    'metal': 'Металл',
    'paper': 'Бумага и картон',
    'furniture': 'Мебель и крупногабарит',
    'textile': 'Текстиль',
    'battery': 'Батарейки',
    'construction': 'Строительный мусор',
    'tree': 'Дерево',
    'tire': 'Автошины',
    'bulb': 'Лампочки'
}
