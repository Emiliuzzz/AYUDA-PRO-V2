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
    subject = models.ForeignKey(
        'subjects.Subject',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requests'
    )
    subject_name = models.CharField(max_length=100, help_text="Nombre si la materia no está en la lista")
    description = models.TextField(help_text="Detalle del tema que quieres ver en la clase.")
    proposed_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Lo que el estudiante está dispuesto a pagar por 1 hora."
    )
    preferred_datetime = models.DateTimeField(null=True, blank=True, help_text="Fecha y hora sugerida por el alumno.")
    accepted_by = models.ForeignKey(
        'tutors.Tutor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accepted_requests'
    )
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
