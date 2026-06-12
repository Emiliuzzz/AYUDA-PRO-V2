# 🚀 Ayuda Pro - Plataforma de Tutorías Académicas

**Ayuda Pro** es una solución integral diseñada para conectar estudiantes que buscan reforzar sus conocimientos con tutores expertos en diversas materias. La plataforma ofrece una gestión eficiente de clases, materiales de estudio y un panel administrativo robusto.

---

## 👥 Roles y Funcionalidades

La aplicación ofrece una experiencia personalizada según el tipo de usuario:

### 🎓 Estudiantes
*   **Exploración de Tutores:** Filtra y encuentra al mentor ideal.
*   **Reservas:** Agenda clases en tiempo real seleccionando fecha y hora.
*   **Material Compartido:** Descarga guías y ejercicios subidos por los tutores.
*   **Solicitudes de Materias:** ¿No encuentras lo que buscas? Envía una solicitud para que el admin busque un tutor para esa materia.

### 👨‍🏫 Tutores
*   **Dashboard Profesional:** Visualiza tus próximas clases y estadísticas de ingresos.
*   **Gestión de Clases:** Marca sesiones como completadas y lleva un registro histórico.
*   **Repositorio de Material:** Sube archivos específicos para cada sesión que el alumno pueda descargar.

### 🛡️ Administradores
*   **Panel de Control Global:** Navegación por secciones (Métricas, Usuarios, Solicitudes).
*   **Aprobación de Tutores:** Gestión de altas para nuevos profesionales.
*   **Métricas en Tiempo Real:** Visualización del crecimiento de usuarios por mes y rol.
*   **Gestión de Solicitudes:** Resuelve las peticiones de materias nuevas enviadas por la comunidad.

---

## 🛠️ Stack Tecnológico

*   **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite.
*   **Backend:** Django 5.x, Django REST Framework (DRF).
*   **Base de Datos:** MySQL (configurable a SQLite para desarrollo rápido).
*   **Autenticación:** Simple JWT (Tokens de acceso seguros).

---

## ⚙️ Guía de Instalación (Desarrollo Local)

### 📋 Prerrequisitos
*   [Python 3.10+](https://www.python.org/)
*   [Node.js LTS](https://nodejs.org/)
*   [Git](https://git-scm.com/)
*   MySQL Server (Opcional, si prefieres no usar SQLite)

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Emiliuzzz/Ayuda-Pro-V2.git
cd Ayuda-Pro-V2
```

### 2️⃣ Configurar el Backend
```bash
cd backend
# Crear y activar entorno virtual
python -m venv .venv
.\.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Instalar dependencias
pip install -r requirements/base.txt

# Configurar base de datos (Ejecutar migraciones)
python manage.py migrate

# Iniciar servidor (Puerto 8000)
python manage.py runserver
```

### 3️⃣ Configurar el Frontend
*(Abrir una nueva terminal)*
```bash
cd frontend
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (Puerto 5173)
npm run dev
```

---

## 🔑 Credenciales de Prueba (Local)
*   **Admin Dashboard:** `http://localhost:8000/admin/`
*   **Usuario Admin:** `admin` / `admin123`

---

## 📄 Licencia
Este proyecto está bajo la licencia MIT. Puedes usarlo y modificarlo libremente.

---
Desarrollado con ❤️ por **Emilio**
