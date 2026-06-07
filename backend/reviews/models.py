from django.db import models

from points.models import PickUpPoint
from users.models import User


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    point = models.ForeignKey(PickUpPoint, on_delete=models.CASCADE)
    rating = models.IntegerField(
        choices=[(i, i) for i in range(1, 6)], verbose_name='Оценка'
    )
    text = models.TextField(verbose_name='Текст отзыва')
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name='Создано'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'На модерации'),
            ('approved', 'Одобрен'),
            ('rejected', 'Отклонён')
        ],
        default='pending',
        verbose_name='Статус'
    )
    reply = models.TextField(
        null=True,
        blank=True,
        verbose_name='Ответ организации'
    )

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        unique_together = ('user', 'point')
        default_related_name = 'review'


class ModerationLog(models.Model):

    CONTENT_TYPES = (
        ('organization', 'Организация'),
        ('review', 'Отзыв'),
        ('news', 'Новость'),
    )

    ACTIONS = (
        ('approve', 'Одобрить'),
        ('reject', 'Отклонить'),
    )

    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_TYPES,
        verbose_name='Тип объекта'
    )

    object_id = models.CharField(
        max_length=50,
        verbose_name='ID объекта'
    )

    object_title = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Название объекта'
    )

    moderator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'is_staff': True},
        verbose_name='Модератор'
    )

    action = models.CharField(
        max_length=20,
        choices=ACTIONS,
        verbose_name='Действие'
    )

    reason = models.TextField(
        blank=True,
        verbose_name='Причина'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата решения'
    )

    class Meta:
        verbose_name = 'Лог модерации'
        verbose_name_plural = 'Логи модерации'
        ordering = ('-created_at',)

    def __str__(self):
        return (
            f'{self.content_type} '
            f'#{self.object_id} '
            f'({self.action})'
        )
