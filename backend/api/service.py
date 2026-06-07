import os
import re

from dadata import Dadata
from dotenv import load_dotenv

from config.constants import COMPANY_LEADER, USER
from reviews.models import ModerationLog
from users.models import Employee

load_dotenv()


def validate_inn_by_api(value):
    token = os.getenv('INN_API_TOKEN')
    dadata = Dadata(token)
    result = dadata.find_by_id('party', value)
    return len(result) > 0


def has_organization_rights(user, organization):
    employee = Employee.objects.filter(
        user=user,
        organization=organization,
        role_in_organization=COMPANY_LEADER
    ).exists()
    return employee or user.role != USER


def create_moderation_log(
    *,
    content_type: str,
    obj,
    moderator,
    action: str,
    reason: str = ''
):
    """
    Создание записи в журнале модерации.
    """

    object_title = ''

    if content_type == 'organization':
        object_title = obj.name

    elif content_type == 'news':
        object_title = obj.title

    elif content_type == 'review':
        object_title = obj.text[:120]

    return ModerationLog.objects.create(
        content_type=content_type,
        object_id=str(obj.pk),
        object_title=object_title,
        moderator=moderator,
        action=action,
        reason=reason
    )


def approve_object(
    *,
    obj,
    moderator,
    content_type: str
):
    """
    Одобрение объекта.
    """

    if hasattr(obj, 'status'):

        if content_type == 'organization':
            obj.status = 'active'
        else:
            obj.status = 'approved'

        obj.save(update_fields=['status'])

    create_moderation_log(
        content_type=content_type,
        obj=obj,
        moderator=moderator,
        action='approve'
    )

    return obj


def reject_object(
    *,
    obj,
    moderator,
    content_type: str,
    reason: str = ''
):
    """
    Отклонение объекта.
    """

    if hasattr(obj, 'status'):

        obj.status = 'rejected'

        obj.save(update_fields=['status'])

    create_moderation_log(
        content_type=content_type,
        obj=obj,
        moderator=moderator,
        action='reject',
        reason=reason
    )

    return obj


def block_object(
    *,
    obj,
    moderator,
    content_type: str,
    reason: str = ''
):
    """
    Блокировка объекта.
    Используется если понадобится.
    """

    create_moderation_log(
        content_type=content_type,
        obj=obj,
        moderator=moderator,
        action='block',
        reason=reason
    )

    return obj


def normalize_waste_name(name: str) -> str:
    name = name.strip().lower()

    name = re.sub(r'[-_]+', ' ', name)
    name = re.sub(r'\s+', ' ', name)

    return name
