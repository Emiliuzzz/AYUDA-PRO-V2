from django.urls import path
from study_sessions.views.session_views import SessionListCreateView, UpdateSessionStatusView
from study_sessions.views.material_views import SessionMaterialListCreateView

urlpatterns = [
    path('', SessionListCreateView.as_view(), name='session-list-create'),
    path('<int:pk>/status/', UpdateSessionStatusView.as_view(), name='session-status-update'),
    path('<int:session_id>/materials/', SessionMaterialListCreateView.as_view(), name='session-materials'),
]
