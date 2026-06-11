from django.core.exceptions import ValidationError
from django.db.models import Q
from study_sessions.models import Session

def session_create(*, tutor, student, subject, start_time, end_time, **extra_fields):
    # 1. Validar que el fin sea después del inicio
    if end_time <= start_time:
        raise ValidationError("La hora de fin debe ser posterior a la de inicio.")

    # 2. Validar solapamiento de horarios para el tutor
    overlapping_sessions = Session.objects.filter(
        tutor=tutor,
        status=Session.Status.SCHEDULED
    ).filter(
        Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
    )

    if overlapping_sessions.exists():
        raise ValidationError("El tutor ya tiene una sesión programada en ese horario.")

    # 3. Crear la sesión
    session = Session.objects.create(
        tutor=tutor,
        student=student,
        subject=subject,
        start_time=start_time,
        end_time=end_time,
        **extra_fields
    )

    return session
