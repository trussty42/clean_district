from django.db import models


class OrganizationNews(models.Model):
    title = models.CharField(max_length=50, verbose_name='Заголовок')
    text = models.TextField(verbose_name='Текст новости')
    is_published = models.BooleanField(
        default=True, verbose_name='Опубликовано'
    )
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name='Создано'
    )
    image = models.ImageField(upload_to='org_news/', null=True, blank=True)

    class Meta:
        verbose_name = 'Новость огранизации'
        verbose_name_plural = 'Новости огранизации'
