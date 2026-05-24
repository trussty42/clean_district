from django.urls import include, path
from rest_framework.routers import DefaultRouter
from api import views


router_v1 = DefaultRouter()
router_v1.register(
    'organizations',
    views.OrganizationViewSet,
    basename='organizations'
)
router_v1.register('points', views.PointViewSet, basename='points')
router_v1.register(
    'waste-types',
    views.WasteTypesViewSet,
    basename='waste-types'
)
router_v1.register(
    'history',
    views.SubmissionHistoryViewSet,
    basename='history'
)
router_v1.register(
    r'points/(?P<point_id>\d+)/reviews',
    views.ReviewViewSet,
    basename='point-reviews'
)
router_v1.register('news', views.NewsViewSet, basename='news')

authentication_urls = [
    path('register/', views.user_registration, name='user_registration'),
    path('login/', views.user_login, name='user_login'),
    path('me/', views.UserProfileView.as_view(), name='user-profile'),
]

v1_urlpatterns = [
    path('', include(router_v1.urls)),
    path('users/', include(authentication_urls)),
    path('waste-catalog/', views.waste_types_catalog, name='waste-catalog'),
]

urlpatterns = [
    path('v1/', include(v1_urlpatterns)),
]
