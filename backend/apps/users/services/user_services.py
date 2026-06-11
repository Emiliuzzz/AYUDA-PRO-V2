from django.db import transaction
from users.models import User, Student
from tutors.models import Tutor

@transaction.atomic
def user_create(*, email, username, password, role, **extra_fields):
    """
    Crea un usuario y su perfil correspondiente (Student o Tutor).
    Usamos @transaction.atomic para que si falla la creación del perfil, 
    no se cree el usuario a medias.
    """
    user = User.objects.create_user(
        email=email,
        username=username,
        password=password,
        role=role,
        **extra_fields
    )

    if role == User.Roles.STUDENT:
        Student.objects.create(user=user)
    elif role == User.Roles.TUTOR:
        # Por ahora creamos un perfil de tutor básico con rate 0
        Tutor.objects.create(user=user, hourly_rate=0)

    return user
