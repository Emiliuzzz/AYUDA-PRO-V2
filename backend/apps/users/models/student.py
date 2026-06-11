from django.db import models
from django.conf import settings

class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    university = models.CharField(max_length=100, blank=True)
    career = models.CharField(max_length=100, blank=True)
    current_semester = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Estudiante'
        verbose_name_plural = 'Estudiantes'

    def __str__(self):
        return f"Estudiante: {self.user.get_full_name() or self.user.username}"
