from api.permissions import IsAdminOrModerator
from api.serializers import (OrganizationNewsSerializer,
                             OrganizationSerializer, PointSerializer,
                             PointWasteTypeSerializer,
                             SubmissionHistorySerializer, UserLoginSerializer,
                             UserProfileSerializer, UserRegistrationSerializer,
                             ReviewSerializer)
from api.pagination import NewsPagination
from api.service import has_organization_rights
from api.filters import PickUpPointFilter, WasteTypesFilter
from config.constants import COMPANY_LEADER
from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Avg, Q
from django_filters.rest_framework import DjangoFilterBackend
from news.models import OrganizationNews
from points.models import PickUpPoint, PointWasteTypes, SubmissionHistory
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import (IsAuthenticated,
                                        IsAuthenticatedOrReadOnly)
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from reviews.models import Review
from users.models import Employee, Organization, User


@api_view(['POST'])
def user_registration(request):
    serializer = UserRegistrationSerializer(data=request.data)

    serializer.is_valid(raise_exception=True)

    serializer.validated_data.pop('password_confirm')

    username = serializer.validated_data['username']
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    refresh = RefreshToken.for_user(user)

    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        },
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def user_login(request):
    serializer = UserLoginSerializer(data=request.data)

    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(username=username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    return Response(
        {'error': 'Неверный логин или пароль'},
        status=status.HTTP_400_BAD_REQUEST
    )


class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class OrganizationViewSet(ModelViewSet):

    queryset = Organization.objects.filter(status='active')
    serializer_class = OrganizationSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    http_method_names = ['post', 'get', 'patch', 'head', 'options', 'delete']

    def perform_create(self, serializer):
        with transaction.atomic():
            organization = serializer.save(user=self.request.user)
            Employee.objects.create(
                user=self.request.user,
                organization=organization,
                role_in_organization=COMPANY_LEADER
            )

    def perform_update(self, serializer):
        if has_organization_rights(self.request.user, serializer.instance.pk):
            return super().perform_update(serializer)
        raise PermissionDenied('У вас нет прав на это действие')

    def perform_destroy(self, instance):
        if has_organization_rights(self.request.user, instance.pk):
            return super().perform_destroy(instance)
        raise PermissionDenied('У вас нет прав на это действие')


class PointViewSet(ModelViewSet):

    serializer_class = PointSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    http_method_names = ['post', 'get', 'patch', 'head', 'options', 'delete']
    filter_backends = [DjangoFilterBackend]
    filterset_class = PickUpPointFilter

    def get_queryset(self):
        return PickUpPoint.objects.annotate(
            avg_rating=Avg(
                'review__rating',
                filter=Q(review__is_published=True)
            )
        ).distinct()

    def perform_create(self, serializer):
        organization = serializer.validated_data.get('organization')
        self.check_is_leader(organization)
        serializer.save()

    def perform_update(self, serializer):
        self.check_is_leader(serializer.instance.organization)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        self.check_is_leader(instance.organization)
        return super().perform_destroy(instance)

    def check_is_leader(self, organization):
        is_leader = Employee.objects.filter(
            user=self.request.user,
            organization=organization,
            role_in_organization=COMPANY_LEADER
        ).exists()
        if not is_leader:
            raise PermissionDenied('Вы не являетесь директором организации')


@api_view(['GET'])
def waste_types_catalog(request):
    catalog = PointWasteTypes.objects.values('waste_name').annotate(
        average_price=Avg('price')
    )
    return Response(catalog)


class WasteTypesViewSet(ModelViewSet):
    serializer_class = PointWasteTypeSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    http_method_names = ['post', 'get', 'patch', 'head', 'options', 'delete']
    filter_backends = [DjangoFilterBackend]
    filterset_class = WasteTypesFilter

    def get_queryset(self):
        return PointWasteTypes.objects.select_related(
            'point__organization'
        ).all()

    def perform_create(self, serializer):
        point = serializer.validated_data.get('point')
        self.check_permissions(point.organization)
        serializer.save()

    def perform_update(self, serializer):
        self.check_permissions(serializer.instance.point.organization)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        self.check_permissions(instance.point.organization)
        super().perform_destroy(instance)

    def check_permissions(self, organization):
        if not has_organization_rights(self.request.user, organization):
            raise PermissionDenied('У вас нет прав на это действие')


class NewsViewSet(ModelViewSet):
    queryset = OrganizationNews.objects.filter(
        is_published=True
    ).order_by('-created_at')
    serializer_class = OrganizationNewsSerializer
    permission_classes = (IsAdminOrModerator,)
    pagination_class = NewsPagination


class SubmissionHistoryViewSet(ModelViewSet):
    serializer_class = SubmissionHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return SubmissionHistory.objects.none()
        return SubmissionHistory.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        if getattr(self, 'swagger_fake_view', False):
            return
        point = serializer.validated_data.get('point')
        if not has_organization_rights(self.request.user, point.organization):
            raise PermissionDenied(
                'У вас нет прав на добавление истории для этого пункта'
            )
        serializer.save()


class ReviewViewSet(ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(is_published=True).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, is_published=False)
