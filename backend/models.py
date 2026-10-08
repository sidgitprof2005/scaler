from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True)
    form_id = Column(String, ForeignKey("forms.id"))
    type = Column(String)
    text = Column(String)
    description = Column(String, nullable=True)
    is_required = Column(Boolean, default=False)
    order = Column(Integer)
    options = Column(String, nullable=True)

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, index=True)
    form_id = Column(String, ForeignKey("forms.id"))
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, index=True)
    response_id = Column(String, ForeignKey("responses.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    value = Column(String)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
