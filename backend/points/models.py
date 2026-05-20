from django.contrib.gis.db import models as gismodels
from django.contrib.postgres.indexes import GistIndex
from django.db import models

from config.constants import WASTE_TYPES
from users.models import Organization, User


class PickUpPoint(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='points'
    )
    adress = models.CharField(max_length=255, verbose_name='Адрес')
    location = gismodels.PointField(
        geography=True, srid=4326, verbose_name='Местоположение'
    )
    work_schedule = models.TextField(verbose_name='График работы')
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name='Создано'
    )
    visits_count = models.IntegerField(default=0, verbose_name='Посещений')
    is_moderated = models.BooleanField(
        default=False, verbose_name='Прошел модерацию'
    )
    moderation_status = models.CharField(
        max_length=20,
        choices=[
            ('new', 'Новый'),
            ('approved', 'Одобрено'),
            ('rejected', 'Отклонено')
        ],
        default='new',
        verbose_name='Статус'
    )

    class Meta:
        verbose_name = 'Пункт приема'
        verbose_name_plural = 'Пункты приема'
        indexes = [
            GistIndex(
                fields=['location'], name='point_location_idx'
            ),
        ]

    def __str__(self):
        return f'{self.organization.name} - {self.adress}'

    @property
    def average_rating(self):
        return self.review.filter(is_published=True).aggregate(models.Avg('rating'))['rating__avg']


class PointWasteTypes(models.Model):
    point = models.ForeignKey(
        PickUpPoint,
        on_delete=models.CASCADE,
        related_name='waste_types'
    )
    waste_name = models.CharField('Название отхода', null=False, blank=False)
    waste_type = models.CharField('Тип отхода', choices=WASTE_TYPES)
    preparation = models.TextField('Как подготовить к сдаче')
    not_accepted = models.TextField('Не принимается')
    photo = models.ImageField('Фото отхода', null=True, blank=True)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, verbose_name='Цена'
    )
    is_actual_price = models.BooleanField(
        default=True, null=True, blank=True, verbose_name='Актуально'
    )

    class Meta:
        verbose_name = 'Приём отхода в пункте'
        verbose_name_plural = 'Приёмы отходов в пунктах'
        unique_together = ('point', 'waste_type')

    def __str__(self):
        return f'{self.point.adress} - {self.waste_name}'


class SubmissionHistory(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, verbose_name='Пользователь'
    )
    point = models.ForeignKey(
        PickUpPoint, on_delete=models.CASCADE, verbose_name='Пункт приёма'
    )
    waste_type = models.ForeignKey(
        PointWasteTypes, on_delete=models.SET_NULL, null=True, verbose_name='Тип отхода'
    )
    weight = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name='Вес (кг)'
    )
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name='Сумма (руб)'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата сдачи')

    class Meta:
        verbose_name = 'История сдачи'
        verbose_name_plural = 'История сдач'
        ordering = ['-created_at']
        default_related_name = 'submissions'

    def __str__(self):
        return f'{self.created_at.strftime("%Y-%m-%d")} - {self.user.username} - {self.weight} кг'