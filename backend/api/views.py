from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Avg, Count, F, Q, Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import (AllowAny, IsAdminUser, IsAuthenticated,
                                        IsAuthenticatedOrReadOnly)
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework_simplejwt.tokens import RefreshToken

from api.filters import PickUpPointFilter, WasteTypesFilter
from api.pagination import NewsPagination
from api.serializers import (EmployeeSerializer, ModerationLogSerializer,
                             OrganizationNewsSerializer,
                             OrganizationSerializer, PointSerializer,
                             PointWasteTypeSerializer, ReviewSerializer,
                             SubmissionHistorySerializer, UserLoginSerializer,
                             UserProfileSerializer, UserRegistrationSerializer)
from api.service import approve_object, has_organization_rights, reject_object
from config.constants import COMPANY_LEADER, HAS_ORGANIZATION_RIGHTS
from news.models import OrganizationNews
from points.models import PickUpPoint, PointWasteTypes, SubmissionHistory
from reviews.models import ModerationLog, Review
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

    serializer_class = OrganizationSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    http_method_names = ['post', 'get', 'patch', 'head', 'options', 'delete']

    def get_queryset(self):

        user = self.request.user

        if not user.is_authenticated:
            return Organization.objects.filter(status='active')

        is_leader = Employee.objects.filter(
            user=user,
            role_in_organization=COMPANY_LEADER
        ).exists()

        if (user.role in HAS_ORGANIZATION_RIGHTS or is_leader
                or user.is_staff):
            return Organization.objects.all()

        return Organization.objects.filter(status='active')

    def perform_create(self, serializer):
        with transaction.atomic():

            organization = serializer.save(
                user=self.request.user,
                status='pending'
            )

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

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):

        organization = self.get_object()

        views_count = PickUpPoint.objects.filter(
            organization=organization
        ).aggregate(
            total=Sum('visits_count')
        )['total'] or 0

        submissions_count = SubmissionHistory.objects.filter(
            point__organization=organization
        ).count()

        avg_rating = Review.objects.filter(
            point__organization=organization,
            status='approved'
        ).aggregate(
            avg=Avg('rating')
        )['avg'] or 0

        weight_stats = SubmissionHistory.objects.filter(
            point__organization=organization
        ).values(
            'waste_type__waste_type'
        ).annotate(
            total_weight=Sum('weight')
        )

        rating_stats = Review.objects.filter(
            point__organization=organization,
            status='approved'
        ).values(
            'rating'
        ).annotate(
            count=Count('id')
        )

        return Response({
            'views': views_count,
            'submissions': submissions_count,
            'avg_rating': round(avg_rating, 1),

            'weight_stats': list(weight_stats),

            'rating_stats': list(rating_stats)
        })


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
                filter=Q(review__status='approved')
            ),
            reviews_count=Count(
                'review',
                filter=Q(review__status='approved')
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

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[AllowAny]
    )
    def view(self, request, pk=None):

        point = self.get_object()

        PickUpPoint.objects.filter(
            pk=point.pk
        ).update(
            visits_count=F('visits_count') + 1
        )

        return Response({
            'status': 'ok'
        })


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
        self.check_is_leader(point.organization)
        serializer.save()

    def perform_update(self, serializer):
        self.check_is_leader(serializer.instance.point.organization)
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        self.check_is_leader(instance.point.organization)
        super().perform_destroy(instance)

    def check_is_leader(self, organization):
        if not has_organization_rights(
            self.request.user,
            organization.pk
        ):
            raise PermissionDenied(
                'У вас нет прав на это действие'
            )


class NewsViewSet(ModelViewSet):
    queryset = OrganizationNews.objects.filter(
        status='approved'
    ).order_by('-created_at')
    serializer_class = OrganizationNewsSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
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

    def perform_create(
        self,
        serializer
    ):
        if getattr(
            self,
            'swagger_fake_view',
            False
        ):
            return
        serializer.save(
            user=self.request.user
        )


class ReviewViewSet(ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.filter(status='approved')

        point_id = self.request.query_params.get('point')

        if point_id:
            queryset = queryset.filter(point_id=point_id)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='pending')


class ModerationViewSet(ViewSet):

    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def organizations(self, request):

        organizations = Organization.objects.filter(
            status='pending'
        )

        serializer = OrganizationSerializer(
            organizations,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reviews(self, request):

        reviews = Review.objects.filter(
            status='pending'
        )

        serializer = ReviewSerializer(
            reviews,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def news(self, request):

        news = OrganizationNews.objects.filter(
            status='pending'
        )

        serializer = OrganizationNewsSerializer(
            news,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    @action(
        detail=True,
        methods=['post']
    )
    def approve_organization(
        self,
        request,
        pk=None
    ):

        organization = Organization.objects.get(
            pk=pk
        )

        approve_object(
            obj=organization,
            moderator=request.user,
            content_type='organization'
        )

        return Response({
            'status': 'approved'
        })

    @action(
        detail=True,
        methods=['post']
    )
    def approve_review(
        self,
        request,
        pk=None
    ):

        review = Review.objects.get(
            pk=pk
        )

        approve_object(
            obj=review,
            moderator=request.user,
            content_type='review'
        )

        return Response({
            'status': 'approved'
        })

    @action(
        detail=True,
        methods=['post']
    )
    def reject_review(
        self,
        request,
        pk=None
    ):

        review = Review.objects.get(
            pk=pk
        )

        reject_object(
            obj=review,
            moderator=request.user,
            content_type='review',
            reason=request.data.get(
                'reason',
                ''
            )
        )

        return Response({
            'status': 'rejected'
        })

    @action(
        detail=True,
        methods=['post']
    )
    def approve_news(
        self,
        request,
        pk=None
    ):

        news = OrganizationNews.objects.get(
            pk=pk
        )

        approve_object(
            obj=news,
            moderator=request.user,
            content_type='news'
        )

        return Response({
            'status': 'approved'
        })

    @action(
        detail=True,
        methods=['post']
    )
    def reject_news(
        self,
        request,
        pk=None
    ):

        news = OrganizationNews.objects.get(
            pk=pk
        )

        reject_object(
            obj=news,
            moderator=request.user,
            content_type='news',
            reason=request.data.get(
                'reason',
                ''
            )
        )

        return Response({
            'status': 'rejected'
        })

    @action(
        detail=False,
        methods=['get']
    )
    def logs(self, request):

        logs = (
            ModerationLog.objects
            .select_related('moderator')
            .order_by('-created_at')
        )

        serializer = ModerationLogSerializer(
            logs,
            many=True
        )

        return Response(
            serializer.data
        )


class EmployeeViewSet(ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):

        queryset = Employee.objects.select_related(
            'user',
            'organization'
        )

        org_id = self.request.query_params.get(
            'organization'
        )

        if org_id:
            queryset = queryset.filter(
                organization_id=org_id
            )

            queryset = queryset.filter(
                organization__employee__user=self.request.user
            )

        return queryset

    @action(
        detail=False,
        methods=['post']
    )
    def invite(self, request):

        email = request.data.get('email')
        org_id = request.data.get('organization')

        if not (Employee.objects.filter(
            user=request.user,
            organization_id=org_id,
            role_in_organization='leader'
        ).exists()):
            return Response(
                {'detail': 'Недостаточно прав'},
                status=403
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'email': 'Пользователь не найден'},
                status=404
            )

        if user == request.user:
            return Response(
                {'detail': 'Нельзя добавить самого себя'},
                status=400
            )

        employee, created = Employee.objects.get_or_create(
            user=user,
            organization_id=org_id,
            defaults={
                'role_in_organization': 'employee'
            }
        )

        if not created:
            return Response(
                {'detail': 'Сотрудник уже добавлен'},
                status=400
            )

        return Response(
            EmployeeSerializer(employee).data
        )

    def destroy(self, request, *args, **kwargs):

        employee = self.get_object()

        is_leader = Employee.objects.filter(
            user=request.user,
            organization=employee.organization,
            role_in_organization='leader'
        ).exists()

        if not is_leader:
            return Response(
                {'detail': 'Недостаточно прав'},
                status=403
            )

        if employee.role_in_organization == 'leader':
            return Response(
                {'detail': 'Нельзя удалить директора'},
                status=400
            )

        return super().destroy(
            request,
            *args,
            **kwargs
        )
