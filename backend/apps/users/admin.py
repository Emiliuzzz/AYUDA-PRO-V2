from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Student

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información Profesional', {'fields': ('role', 'bio', 'phone')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Información Profesional', {'fields': ('role', 'bio', 'phone')}),
    )

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'career', 'current_semester')
    search_fields = ('user__username', 'university', 'career')
