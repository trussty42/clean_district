import re
from decimal import Decimal

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from api.service import validate_inn_by_api
from config.constants import NAME_PATTERN, WASTENAME_PATTERN
from news.models import OrganizationNews
from points.models import PickUpPoint, PointWasteTypes, SubmissionHistory
from reviews.models import Review
from users.models import Organization, User


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
        if User.objects.exclude(id=self.instance.id).filter(email=value).exists():
            raise serializers.ValidationError("Этот email уже занят.")
        return value

    def validate_username(self, value):
        if User.objects.exclude(id=self.instance.id).filter(username=value).exists():
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

    class Meta:
        fields = (
            'user',
            'name',
            'inn',
            'email',
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
        organization_by_inn = Organization.objects.filter(inn=value).first()
        if organization_by_inn:
            raise serializers.ValidationError(
                'Организация с таким ИНН уже существует'
            )
        if not validate_inn_by_api(value):
            raise serializers.ValidationError(
                'Компания по данному ИНН не найдена'
            )
        return value

    def validate_email(self, value):
        organization_by_email = Organization.objects.filter(
            email=value
        ).first()
        if organization_by_email:
            raise serializers.ValidationError(
                'Организация с таким email уже существует'
            )


class PointSerializer(serializers.ModelSerializer):
    organization = serializers.StringRelatedField()
    average_rating = serializers.ReadOnlyField()

    class Meta:
        model = PickUpPoint
        fields = (
            'organization',
            'adress',
            'location',
            'work_schedule',
            'created_at',
            'visits_count',
            'average_rating',
            'is_moderated',
            'moderation_status'
        )

    def validate(self, data):
        point = PickUpPoint.objects.filter(
            organization=data['organization'],
            adress=data['adress']
        ).first()
        if point:
            raise serializers.ValidationError(
                'В этой организации уже существует точка с таким адресом'
            )
        return data


class PointWasteTypeSerializer(serializers.ModelSerializer):
    point = serializers.StringRelatedField()
    waste_type_display = serializers.CharField(
        source='get_waste_type_display',
        read_only=True
    )

    class Meta:
        model = PointWasteTypes
        fields = (
            'point', 'waste_name', 'waste_type',
            'waste_type_display', 'preparation', 'not_accepted',
            'photo', 'price', 'is_actual_price'
        )

    def validate_waste_name(self, value):
        if not re.fullmatch(WASTENAME_PATTERN, value):
            raise serializers.ValidationError(
                'Неверное название товара'
            )
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'Цена должна быть положительным значением'
            )
        return value.quantize(Decimal('0.01'))


class OrganizationNewsSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrganizationNews
        fields = ('title', 'text', 'is_published', 'created_at', 'image')
        read_only_fields = ('created_at',)


class SubmissionHistorySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    point = serializers.StringRelatedField()
    waste_type = serializers.StringRelatedField()

    class Meta:
        model = SubmissionHistory
        fields = ('user', 'point', 'waste_type', 'weight', 'total_price', 'created_at')


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Review
        fields = ('user', 'point', 'rating', 'text', 'created_at')
        read_only_fields = ('user', 'created_at', 'is_published')

    def validate(self, data):
        if self.context['request'].method == 'POST':
            user = self.context['request'].user
            point = data.get('point')
            if Review.objects.filter(user=user, point=point).exists():
                raise serializers.ValidationError(
                    'Вы уже оставляли отзыв на эту точку приема.'
                )
        return data
