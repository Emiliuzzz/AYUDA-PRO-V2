from django.contrib import admin
from .models import Session

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'tutor', 'student', 'start_time', 'status')
    list_filter = ('status', 'start_time')
    search_fields = ('tutor__user__username', 'student__user__username', 'subject__name')
    date_hierarchy = 'start_time'
