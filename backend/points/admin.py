from django.contrib import admin

from points.models import (PickUpPoint, PointWasteTypes, SubmissionHistory,
                           WasteType)

admin.site.register(PickUpPoint)
admin.site.register(PointWasteTypes)
admin.site.register(WasteType)
admin.site.register(SubmissionHistory)
