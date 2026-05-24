import os

from dadata import Dadata
from dotenv import load_dotenv

from config.constants import COMPANY_LEADER, USER
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
