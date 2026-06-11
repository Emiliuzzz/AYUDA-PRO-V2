from django.db import models
from django.conf import settings

class SubjectRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pendiente'
        FULFILLED = 'FULFILLED', 'Resuelta'
        REJECTED = 'REJECTED', 'Rechazada'

    student = models.ForeignKey(
        'users.Student',
        on_delete=models.CASCADE,
        related_name='subject_requests'
    )
    subject_name = models.CharField(max_length=100)
    description = models.TextField(help_text="Explica qué necesitas aprender o qué falta.")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Solicitud de Materia'
        verbose_name_plural = 'Solicitudes de Materias'
        ordering = ['-created_at']

    def __str__(self):
        return f"Solicitud: {self.subject_name} por {self.student.user.username}"
