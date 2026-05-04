from rest_framework import permissions
from config.constants import HAS_ORGANIZATION_RIGHTS


class IsAdminOrModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff
                or request.user.role in HAS_ORGANIZATION_RIGHTS)
        )
