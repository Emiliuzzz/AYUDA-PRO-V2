from django.core.exceptions import ValidationError
from reviews.models import Review

def review_create(*, session, rating, comment=""):
    """
    Crea una evaluación para una sesión.
    """
    # 1. Validar que la sesión no tenga ya una evaluación (redundante por OneToOne pero preventivo)
    if hasattr(session, 'review'):
        raise ValidationError("Esta sesión ya ha sido calificada.")

    # 2. Crear la evaluación
    review = Review.objects.create(
        session=session,
        rating=rating,
        comment=comment
    )

    return review
