import re
from decimal import Decimal

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from api.service import (has_organization_rights, normalize_waste_name,
                         validate_inn_by_api)
from config.constants import NAME_PATTERN, WASTENAME_PATTERN
from news.models import OrganizationNews
from points.models import PickUpPoint, PointWasteTypes, SubmissionHistory
from reviews.models import ModerationLog, Review
from users.models import Employee, Organization, User


def get_user(username, email):
    filters = {}
    if username:
        filters['username'] = username
    if email:
        filters['email'] = email
    user = User.objects.filter(**filters).first()
    return user


class UserRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=True, allow_blank=False, max_length=150
    )
    email = serializers.EmailField(
        required=True, allow_blank=False, max_length=254
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
        validators=(validate_password,)
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False
    )

    class Meta:
        fields = (
            'username',
            'email',
            'password',
            'password_confirm'
        )
        model = User

    def validate(self, data):
        if data['password_confirm'] != data['password']:
            return serializers.ValidationError('Пароли не совпадают')
        return data

    def validate_username(self, value):
        if not re.fullmatch(NAME_PATTERN, value):
            raise serializers.ValidationError(
                'Введенное имя некорректно'
            )
        return value


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, allow_blank=False)
    password = serializers.CharField(
        write_only=True, required=True, allow_blank=False
    )


class UserProfileSerializer(serializers.ModelSerializer):
    organizations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'first_name',
            'middle_name',
            'last_name',
            'organizations',
            'city',
            'created_at',
        )

    def validate_email(self, value):
        if User.objects.exclude(
            id=self.instance.id
        ).filter(email=value).exists():
            raise serializers.ValidationError("Этот email уже занят.")
        return value

    def validate_username(self, value):
        if User.objects.exclude(
            id=self.instance.id
        ).filter(username=value).exists():
            raise serializers.ValidationError("Этот никнейм уже занят.")
        return value

    def get_organizations(self, obj):
        return [
            {
                "id": emp.organization.id,
                "name": emp.organization.name,
                "role": emp.role_in_organization,
            }
            for emp in obj.employee.all()
        ]


class OrganizationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    my_role = serializers.SerializerMethodField()

    class Meta:
        fields = (
            'id',
            'user',
            'name',
            'inn',
            'status',
            'email',
            'phone',
            'website_url',
            'logo',
            'socials',
            'my_role'
        )

        read_only_fields = (
            'id',
            'user',
        )
        model = Organization

    def validate(self, data):
        if (self.context['request'].method == 'POST'
                and self.context['request'].user.has_organization):
            raise serializers.ValidationError(
                'Вы не можете состоять сразу в нескольких организациях'
            )
        return data

    def validate_name(self, value):
        if not re.fullmatch(NAME_PATTERN, value):
            raise serializers.ValidationError(
                'Введенное имя некорректно'
            )
        return value

    def validate_inn(self, value):

        queryset = Organization.objects.filter(inn=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                'Организация с таким ИНН уже существует'
            )

        if self.instance is None:
            if not validate_inn_by_api(value):
                raise serializers.ValidationError(
                    'Компания по данному ИНН не найдена'
                )

        return value

    def validate_email(self, value):

        queryset = Organization.objects.filter(email=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                'Организация с таким email уже существует'
            )

        return value

    def get_my_role(self, obj):
        request = self.context.get('request')

        if not request or request.user.is_anonymous:
            return None

        employee = Employee.objects.filter(
            user=request.user,
            organization=obj
        ).first()

        return (
            employee.role_in_organization
            if employee else None
        )


class PointWasteTypeSerializer(serializers.ModelSerializer):
    point = serializers.PrimaryKeyRelatedField(
        queryset=PickUpPoint.objects.all()
    )
    waste_type_display = serializers.CharField(
        source='get_waste_type_display',
        read_only=True
    )

    class Meta:
        model = PointWasteTypes
        fields = (
            'id', 'point', 'waste_name', 'waste_type',
            'waste_type_display', 'preparation', 'not_accepted',
            'photo', 'price', 'is_actual_price'
        )

        extra_kwargs = {
            'photo': {
                'required': False
            }
        }

    def validate_waste_name(self, value):

        if not re.fullmatch(
            WASTENAME_PATTERN,
            value
        ):
            raise serializers.ValidationError(
                'Неверное название товара'
            )

        normalized = normalize_waste_name(
            value
        )

        existing = (
            PointWasteTypes.objects
            .only('waste_name')
        )

        for waste in existing:

            if (normalize_waste_name(
                waste.waste_name
            ) == normalized):
                return waste.waste_name

        return value.strip()

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'Цена должна быть положительным значением'
            )
        return value.quantize(Decimal('0.01'))


class PointSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all()
    )
    organization_name = serializers.CharField(
        source='organization.name',
        read_only=True
    )
    organization_phone = serializers.CharField(
        source='organization.phone',
        read_only=True
    )

    organization_email = serializers.CharField(
        source='organization.email',
        read_only=True
    )
    average_rating = serializers.ReadOnlyField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    waste_types = PointWasteTypeSerializer(
        many=True,
        read_only=True
    )
    reviews = serializers.SerializerMethodField()
    reviews_count = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = PickUpPoint
        fields = (
            'id',
            'organization',
            'organization_name',
            'organization_phone',
            'organization_email',
            'adress',
            'location',
            'latitude',
            'longitude',
            'waste_types',
            'reviews',
            'work_schedule',
            'created_at',
            'visits_count',
            'reviews_count',
            'average_rating',
            'is_moderated',
            'moderation_status'
        )
        read_only_fields = ('id',)

    def get_latitude(self, obj):

        return obj.location.y if obj.location else None

    def get_longitude(self, obj):

        return obj.location.x if obj.location else None

    def get_reviews(self, obj):

        reviews = obj.review.filter(
            status='approved'
        ).order_by('-created_at')[:5]

        return ReviewSerializer(
            reviews,
            many=True
        ).data

    def validate(self, data):

        organization = data.get(
            'organization',
            self.instance.organization if self.instance else None
        )

        adress = data.get(
            'adress',
            self.instance.adress if self.instance else None
        )

        queryset = PickUpPoint.objects.filter(
            organization=organization,
            adress=adress
        )

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                'В этой организации уже существует точка с таким адресом'
            )

        return data


class OrganizationNewsSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrganizationNews
        fields = ('id', 'title', 'text', 'status', 'created_at', 'image')
        read_only_fields = ('created_at',)


class SubmissionHistorySerializer(
    serializers.ModelSerializer
):

    user = serializers.StringRelatedField(
        read_only=True
    )

    point = serializers.PrimaryKeyRelatedField(
        queryset=PickUpPoint.objects.all()
    )

    waste_type = serializers.PrimaryKeyRelatedField(
        queryset=PointWasteTypes.objects.all()
    )

    point_name = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    waste_type_name = serializers.SerializerMethodField()

    class Meta:

        model = SubmissionHistory

        fields = (
            'user',
            'point',
            'point_name',
            'waste_type',
            'waste_type_name',
            'weight',
            'total_price',
            'created_at',
            'has_review',
        )

        read_only_fields = (
            'user',
            'created_at'
        )

    def get_has_review(self, obj):

        user = self.context['request'].user

        return Review.objects.filter(
            user=user,
            point=obj.point
        ).exists()

    def get_point_name(self, obj):

        if not obj.point:
            return None

        return obj.point.organization.name

    def get_waste_type_name(self, obj):

        if not obj.waste_type:
            return None

        return obj.waste_type.get_waste_type_display()


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    point_name = serializers.CharField(
        source='point.adress',
        read_only=True
    )

    class Meta:
        model = Review
        fields = (
            'id',
            'user',
            'point',
            'point_name',
            'rating',
            'text',
            'reply',
            'created_at',
        )

        read_only_fields = (
            'id',
            'user',
            'created_at',
        )

    def validate(self, data):
        if self.context['request'].method == 'POST':
            user = self.context['request'].user
            point = data.get('point')
            if Review.objects.filter(user=user, point=point).exists():
                raise serializers.ValidationError(
                    'Вы уже оставляли отзыв на эту точку приема.'
                )
        return data

    def update(self, instance, validated_data):

        user = self.context['request'].user

        if instance.user == user:

            if instance.reply:
                raise serializers.ValidationError(
                    'После ответа организации отзыв нельзя изменять'
                )
            validated_data.pop('reply', None)

        elif has_organization_rights(
            user,
            instance.point.organization_id
        ):

            validated_data = {
                'reply': validated_data.get(
                    'reply',
                    instance.reply
                )
            }

        else:
            raise serializers.ValidationError(
                'Нет прав'
            )

        return super().update(
            instance,
            validated_data
        )


class ModerationLogSerializer(serializers.ModelSerializer):

    moderator = serializers.StringRelatedField()
    object_display = serializers.SerializerMethodField()
    content_type_display = serializers.SerializerMethodField()
    action_display = serializers.SerializerMethodField()

    class Meta:
        model = ModerationLog

        fields = (
            'id',
            'content_type',
            'content_type_display',
            'object_title',
            'object_display',
            'object_id',
            'action',
            'action_display',
            'reason',
            'moderator',
            'created_at'
        )

    def get_content_type_display(self, obj):
        labels = {
            'organization': 'Организация',
            'review': 'Отзыв',
            'news': 'Новость',
        }

        return labels.get(obj.content_type, obj.content_type)

    def get_action_display(self, obj):
        labels = {
            'approve': 'Одобрено',
            'reject': 'Отклонено',
        }

        return labels.get(obj.action, obj.action)

    def get_object_display(self, obj):
        if obj.object_title:
            return obj.object_title

        model_map = {
            'organization': (Organization, 'name'),
            'news': (OrganizationNews, 'title'),
            'review': (Review, 'text'),
        }

        model_info = model_map.get(obj.content_type)

        if not model_info:
            return f'Объект #{obj.object_id}'

        model, field_name = model_info
        item = model.objects.filter(pk=obj.object_id).first()

        if not item:
            return f'Объект #{obj.object_id}'

        value = getattr(item, field_name, '') or ''

        if obj.content_type == 'review' and len(value) > 120:
            return f'{value[:120]}...'

        return value or f'Объект #{obj.object_id}'


class EmployeeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source='user.username',
        read_only=True
    )
    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    class Meta:
        model = Employee
        fields = (
            'id',
            'user',
            'username',
            'email',
            'organization',
            'role_in_organization',
        )


class EmployeeCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    organization = serializers.IntegerField()
    role_in_organization = serializers.CharField()


class WasteRecognitionSerializer(serializers.Serializer):
    image = serializers.ImageField()
