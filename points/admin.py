from django.contrib import admin

from points.models import PickUpPoint, PointWasteTypes


admin.site.register(PickUpPoint)
admin.site.register(PointWasteTypes)
