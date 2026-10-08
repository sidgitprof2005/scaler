from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from fastapi.middleware.cors import CORSMiddleware

import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/forms/", response_model=List[schemas.Form])
def read_forms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    forms = db.query(models.Form).offset(skip).limit(limit).all()
    return forms

@app.post("/forms/", response_model=schemas.Form, status_code=status.HTTP_201_CREATED)
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db)):
    db_form = models.Form(id=str(uuid.uuid4()), title=form.title, is_published=form.is_published)
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@app.get("/forms/{form_id}", response_model=schemas.Form)
def read_form(form_id: str, db: Session = Depends(get_db)):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if db_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return db_form

@app.put("/forms/{form_id}", response_model=schemas.Form)
def update_form(form_id: str, form: schemas.FormUpdate, db: Session = Depends(get_db)):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if db_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    for var, value in vars(form).items():
        setattr(db_form, var, value) if value is not None else None
    db.commit()
    db.refresh(db_form)
    return db_form

@app.delete("/forms/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db)):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if db_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    db.delete(db_form)
    db.commit()
    return {"message": "Form deleted"}

@app.post("/forms/{form_id}/questions/", response_model=schemas.Question, status_code=status.HTTP_201_CREATED)
def create_question_for_form(form_id: str, question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if db_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    db_question = models.Question(id=str(uuid.uuid4()), form_id=form_id, **question.model_dump())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@app.put("/questions/{question_id}", response_model=schemas.Question)
def update_question(question_id: str, question: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if db_question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    for var, value in vars(question).items():
        setattr(db_question, var, value) if value is not None else None
    db.commit()
    db.refresh(db_question)
    return db_question

@app.delete("/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if db_question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    db.delete(db_question)
    db.commit()
    return {"message": "Question deleted"}

@app.post("/forms/{form_id}/responses/", response_model=schemas.Response, status_code=status.HTTP_201_CREATED)
def create_response_for_form(form_id: str, response: schemas.ResponseCreate, db: Session = Depends(get_db)):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if db_form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    db_response = models.Response(id=str(uuid.uuid4()), form_id=form_id)
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    for ans in response.answers:
        db_answer = models.Answer(id=str(uuid.uuid4()), response_id=db_response.id, question_id=ans.question_id, value=ans.value)
        db.add(db_answer)
    db.commit()
    db.refresh(db_response)
    return db_response

@app.get("/forms/{form_id}/responses/", response_model=List[schemas.Response])
def read_responses_for_form(form_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    responses = db.query(models.Response).filter(models.Response.form_id == form_id).offset(skip).limit(limit).all()
    return responses

@app.post("/seed/", status_code=status.HTTP_201_CREATED)
def seed_db(db: Session = Depends(get_db)):
    existing = db.query(models.Form).first()
    if existing:
        return {"message": "Database already seeded"}

    form1 = models.Form(id=str(uuid.uuid4()), title="Customer Feedback Survey", is_published=True)
    db.add(form1)
    db.commit()
    db.refresh(form1)

    q1 = models.Question(id=str(uuid.uuid4()), form_id=form1.id, type="short_text", text="What is your name?", order=1, is_required=True)
    q2 = models.Question(id=str(uuid.uuid4()), form_id=form1.id, type="rating", text="How would you rate our service?", order=2, is_required=True)
    q3 = models.Question(id=str(uuid.uuid4()), form_id=form1.id, type="long_text", text="Any additional comments?", order=3)
    
    db.add_all([q1, q2, q3])
    db.commit()
    
    r1 = models.Response(id=str(uuid.uuid4()), form_id=form1.id)
    db.add(r1)
    db.commit()
    db.refresh(r1)

    a1 = models.Answer(id=str(uuid.uuid4()), response_id=r1.id, question_id=q1.id, value="John Doe")
    a2 = models.Answer(id=str(uuid.uuid4()), response_id=r1.id, question_id=q2.id, value="5")
    a3 = models.Answer(id=str(uuid.uuid4()), response_id=r1.id, question_id=q3.id, value="Great service!")
    
    db.add_all([a1, a2, a3])
    db.commit()

    return {"message": "Database seeded successfully"}

