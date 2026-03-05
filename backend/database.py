from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./greenvision.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    role = Column(String)  # "drone_operator" or "specialist"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    missions = relationship("Mission", back_populates="operator")


class Mission(Base):
    __tablename__ = "missions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    date = Column(String)
    operator_id = Column(Integer, ForeignKey("users.id"))
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default="processing")  # pending, processing, completed, failed
    upload_status = Column(String, default="success")  # success, failed (for drone operator tracking)
    total_images = Column(Integer, default=0)
    processed_images = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    operator = relationship("User", back_populates="missions", foreign_keys=[operator_id])
    reports = relationship("Report", back_populates="mission")
    image_analysis = relationship("ImageAnalysis", back_populates="mission")


class ImageAnalysis(Base):
    __tablename__ = "image_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"))
    filename = Column(String)
    original_filename = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    is_plant = Column(Integer, default=0)  # 1 for true, 0 for false
    plant_name_scientific = Column(String, nullable=True)
    plant_name_common_ar = Column(String, nullable=True)
    plant_count = Column(Integer, default=0)
    plant_status = Column(String, nullable=True)  # invasive, native, exotic, unknown
    confidence = Column(Float, default=0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    invasive_plants_detected = Column(Text, nullable=True)  # JSON string
    ai_analysis = Column(Text, nullable=True)
    analysis_result = Column(Text, nullable=True)  # Full JSON result
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mission = relationship("Mission", back_populates="image_analysis")


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"))
    image_path = Column(String)
    invasive_plants_detected = Column(Text)  # JSON string
    confidence_score = Column(Float)
    ai_analysis = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mission = relationship("Mission", back_populates="reports")


# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
