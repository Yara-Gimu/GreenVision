# ============================================
# DATABASE CONFIGURATION & ORM MODELS
# تكوين قاعدة البيانات وموديلات ORM
# ============================================

# Import SQLAlchemy: Database engine, column types, relationships, session management
# استيراد SQLAlchemy: محرك قاعدة البيانات، أنواع الأعمدة، العلاقات، إدارة الجلسات
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base

# Import datetime for timestamp columns
# استيراد datetime لأعمدة الطوابع الزمنية
from datetime import datetime

# Import os for environment variables
# استيراد os للمتغيرات البيئية
import os

# Get database URL from environment or use SQLite as default
# الحصول على عنوان قاعدة البيانات من المتغيرات البيئية أو استخدام SQLite كقيمة افتراضية
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./greenvision.db")

# Create database engine (SQLite or PostgreSQL based on config)
# إنشاء محرك قاعدة البيانات (SQLite أو PostgreSQL بناءً على الإعدادات)
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory for database connections
# إنشاء مصنع الجلسات للاتصال بقاعدة البيانات
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
# فئة الأساس لجميع موديلات ORM
Base = declarative_base()


# ============================================
# USER MODEL
# موديل المستخدم
# ============================================
class User(Base):
    # Database table name
    # اسم جدول قاعدة البيانات
    __tablename__ = "users"
    
    # User ID - Primary key (Unique identifier)
    # معرف المستخدم - المفتاح الأساسي (معرف فريد)
    id = Column(Integer, primary_key=True, index=True)
    
    # User email address (Must be unique)
    # بريد المستخدم الإلكتروني (يجب أن يكون فريداً)
    email = Column(String, unique=True, index=True)
    
    # Username for login (Must be unique)
    # اسم المستخدم للدخول (يجب أن يكون فريداً)
    username = Column(String, unique=True, index=True)
    
    # User role: "drone_operator" or "specialist"
    # دور المستخدم: "drone_operator" أو "specialist"
    role = Column(String)
    
    # Timestamp when user was created
    # الوقت الذي تم إنشاء المستخدم
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to missions (One user can have many missions)
    # العلاقة بالمهام (مستخدم واحد يمكن أن يملك عدة مهام)
    missions = relationship("Mission", back_populates="operator")


# ============================================
# MISSION MODEL
# موديل المهمة (المسح)
# ============================================
class Mission(Base):
    # Database table name
    # اسم جدول قاعدة البيانات
    __tablename__ = "missions"
    
    # Mission ID - Primary key
    # معرف المهمة - المفتاح الأساسي
    id = Column(Integer, primary_key=True, index=True)
    
    # Mission name (e.g., "Desert Survey 2026")
    # اسم المهمة (مثلاً: "مسح الصحراء 2026")
    name = Column(String)
    
    # Mission date
    # تاريخ المهمة
    date = Column(String)
    
    # Foreign key linking to the operator (User) who created this mission
    # مفتاح خارجي يربط بالمشغل (المستخدم) الذي أنشأ هذه المهمة
    operator_id = Column(Integer, ForeignKey("users.id"))
    
    # Location/notes for the mission
    # موقع/ملاحظات المهمة
    location = Column(String, nullable=True)
    
    # GPS latitude coordinate
    # إحداثي خط العرض GPS
    latitude = Column(Float, nullable=True)
    
    # GPS longitude coordinate
    # إحداثي خط الطول GPS
    longitude = Column(Float, nullable=True)
    
    # Mission processing status: pending, processing, completed, failed
    # حالة معالجة المهمة: معلقة، قيد المعالجة، مكتملة، فشلت
    status = Column(String, default="processing")
    
    # Upload status tracking: success, failed
    # تتبع حالة الرفع: نجح، فشل
    upload_status = Column(String, default="success")
    
    # Total number of images in this mission
    # إجمالي عدد الصور في هذه المهمة
    total_images = Column(Integer, default=0)
    
    # Number of images already processed by AI
    # عدد الصور المعالجة بالفعل بالذكاء الاصطناعي
    processed_images = Column(Integer, default=0)
    
    # When this mission was created
    # متى تم إنشاء هذه المهمة
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Last time this mission was updated
    # آخر مرة تم تحديث هذه المهمة
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to User (Operator)
    # العلاقة بالمستخدم (المشغل)
    operator = relationship("User", back_populates="missions", foreign_keys=[operator_id])
    
    # Relationship to Reports
    # العلاقة بالتقارير
    reports = relationship("Report", back_populates="mission")
    
    # Relationship to Image Analysis records
    # العلاقة بسجلات تحليل الصور
    image_analysis = relationship("ImageAnalysis", back_populates="mission")


# ============================================
# IMAGE ANALYSIS MODEL
# موديل تحليل الصور
# ============================================
class ImageAnalysis(Base):
    # Database table name
    # اسم جدول قاعدة البيانات
    __tablename__ = "image_analysis"
    
    # Analysis record ID - Primary key
    # معرف سجل التحليل - المفتاح الأساسي
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key linking to the Mission
    # مفتاح خارجي يربط بالمهمة
    mission_id = Column(Integer, ForeignKey("missions.id"))
    
    # Processed filename (stored filename)
    # اسم الملف المعالج (اسم الملف المخزن)
    filename = Column(String)
    
    # Original filename uploaded by user
    # اسم الملف الأصلي المرفوع بواسطة المستخدم
    original_filename = Column(String, nullable=True)
    
    # Path to the image file on server
    # مسار ملف الصورة على الخادم
    image_path = Column(String, nullable=True)
    
    # Whether the image contains plants (1=yes, 0=no)
    # هل تحتوي الصورة على نباتات (1=نعم، 0=لا)
    is_plant = Column(Integer, default=0)
    
    # Scientific name of detected plant (Latin/English)
    # الاسم العلمي للنبات المكتشف (لاتيني/إنجليزي)
    plant_name_scientific = Column(String, nullable=True)
    
    # Common Arabic name of detected plant
    # الاسم الشائع بالعربية للنبات المكتشف
    plant_name_common_ar = Column(String, nullable=True)
    
    # Number of plants detected in image
    # عدد النباتات المكتشفة في الصورة
    plant_count = Column(Integer, default=0)
    
    # Plant status: invasive (غازي), native (محلي), exotic (دخيلة), unknown (غير معروف)
    # حالة النبات: غازي، محلي، دخيلة، غير معروف
    plant_status = Column(String, nullable=True)
    
    # AI confidence score (0.0 to 1.0)
    # درجة ثقة الذكاء الاصطناعي (من 0.0 إلى 1.0)
    confidence = Column(Float, default=0)
    
    # GPS latitude of image location
    # خط عرض GPS لموقع الصورة
    latitude = Column(Float, nullable=True)
    
    # GPS longitude of image location
    # خط طول GPS لموقع الصورة
    longitude = Column(Float, nullable=True)
    
    # JSON string of all invasive plants detected
    # نص JSON بجميع النباتات الغازية المكتشفة
    invasive_plants_detected = Column(Text, nullable=True)
    
    # AI analysis details as text
    # تفاصيل تحليل الذكاء الاصطناعي كنص
    ai_analysis = Column(Text, nullable=True)
    
    # Complete AI response as JSON string
    # استجابة الذكاء الاصطناعي الكاملة كنص JSON
    analysis_result = Column(Text, nullable=True)
    
    # When this analysis was created
    # متى تم إنشاء هذا التحليل
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to Mission
    # العلاقة بالمهمة
    mission = relationship("Mission", back_populates="image_analysis")


# ============================================
# REPORT MODEL
# موديل التقرير
# ============================================
class Report(Base):
    # Database table name
    # اسم جدول قاعدة البيانات
    __tablename__ = "reports"
    
    # Report ID - Primary key
    # معرف التقرير - المفتاح الأساسي
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key linking to the Mission
    # مفتاح خارجي يربط بالمهمة
    mission_id = Column(Integer, ForeignKey("missions.id"))
    
    # Path to the analyzed image
    # مسار الصورة المحللة
    image_path = Column(String)
    
    # JSON string containing invasive plants found
    # نص JSON يحتوي على النباتات الغازية المكتشفة
    invasive_plants_detected = Column(Text)
    
    # Confidence level of the analysis (0.0 to 1.0)
    # مستوى الثقة في التحليل (من 0.0 إلى 1.0)
    confidence_score = Column(Float)
    
    # Full AI analysis text
    # النص الكامل لتحليل الذكاء الاصطناعي
    ai_analysis = Column(Text)
    
    # When this report was generated
    # متى تم إنشاء هذا التقرير
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to Mission
    # العلاقة بالمهمة
    mission = relationship("Mission", back_populates="reports")


# ============================================
# DATABASE INITIALIZATION
# تهيئة قاعدة البيانات
# ============================================

# Create all tables defined in models
# إنشاء جميع الجداول المعرفة في الموديلات
Base.metadata.create_all(bind=engine)


# ============================================
# DATABASE SESSION DEPENDENCY
# تبعية جلسة قاعدة البيانات
# ============================================
def get_db():
    """
    Dependency function for FastAPI to inject database session into routes.
    Ensures proper connection management.
    دالة تبعية لـ FastAPI لحقن جلسة قاعدة البيانات في المسارات.
    تضمن إدارة صحيحة للاتصال.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        # Close connection when done
        # إغلاق الاتصال عند الانتهاء
        db.close()
