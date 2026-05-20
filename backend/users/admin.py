from django.contrib import admin

from users.models import Employee, Organization, User


admin.site.register(Employee)
admin.site.register(Organization)
admin.site.register(User)
