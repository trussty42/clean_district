from django.contrib import admin

from reviews.models import Review, ModerationLog

admin.site.register(Review)
admin.site.register(ModerationLog)
