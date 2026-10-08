from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
class QuestionBase(BaseModel):
    type: str
    text: str
    description: Optional[str] = None
    is_required: bool = False
    order: int
    options: Optional[str] = None
class QuestionCreate(QuestionBase):
    pass
class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    text: Optional[str] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    order: Optional[int] = None
    options: Optional[str] = None
class Question(QuestionBase):
    id: str
    form_id: str
    model_config = ConfigDict(from_attributes=True)
class FormBase(BaseModel):
    title: str
    is_published: bool = False
class FormCreate(FormBase):
    pass
class FormUpdate(BaseModel):
    title: Optional[str] = None
    is_published: Optional[bool] = None
class Form(FormBase):
    id: str
    created_at: datetime
    questions: List[Question] = []
    model_config = ConfigDict(from_attributes=True)
class AnswerBase(BaseModel):
    question_id: str
    value: str
class AnswerCreate(AnswerBase):
    pass
class Answer(AnswerBase):
    id: str
    response_id: str
    model_config = ConfigDict(from_attributes=True)
class ResponseBase(BaseModel):
    pass
class ResponseCreate(ResponseBase):
    answers: List[AnswerCreate]
class Response(ResponseBase):
    id: str
    form_id: str
    submitted_at: datetime
    answers: List[Answer] = []
    model_config = ConfigDict(from_attributes=True)
