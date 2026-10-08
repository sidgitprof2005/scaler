from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, database
models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()
frontend_url = os.getenv("FRONTEND_URL", "*")
origins = [url.strip().rstrip("/") for url in frontend_url.split(",")] if frontend_url != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    db.add_all([
        models.Answer(id=str(uuid.uuid4()), response_id=r1.id, question_id=q1.id, value="John Doe"),
        models.Answer(id=str(uuid.uuid4()), response_id=r1.id, question_id=q2.id, value="5"),
        models.Answer(id=str(uuid.uuid4()), response_id=r1.id, question_id=q3.id, value="Great service!")
    ])
    
    # Form 1 - Response 2
    r2 = models.Response(id=str(uuid.uuid4()), form_id=form1.id)
    db.add(r2)
    db.commit()
    db.refresh(r2)
    db.add_all([
        models.Answer(id=str(uuid.uuid4()), response_id=r2.id, question_id=q1.id, value="Jane Smith"),
        models.Answer(id=str(uuid.uuid4()), response_id=r2.id, question_id=q2.id, value="4"),
        models.Answer(id=str(uuid.uuid4()), response_id=r2.id, question_id=q3.id, value="Very good, but could be faster.")
    ])
    db.commit()

    # Form 2: Tech Conference 2026 Registration
    form2 = models.Form(id=str(uuid.uuid4()), title="Tech Conference Registration", is_published=True)
    db.add(form2)
    db.commit()
    db.refresh(form2)
    
    f2_q1 = models.Question(id=str(uuid.uuid4()), form_id=form2.id, type="email", text="What is your email address?", order=1, is_required=True)
    f2_q2 = models.Question(id=str(uuid.uuid4()), form_id=form2.id, type="multiple_choice", text="Which track are you most interested in?", order=2, options='["Frontend", "Backend", "AI/ML", "Design"]', is_required=True)
    f2_q3 = models.Question(id=str(uuid.uuid4()), form_id=form2.id, type="yes_no", text="Will you be attending the after-party?", order=3, is_required=True)
    f2_q4 = models.Question(id=str(uuid.uuid4()), form_id=form2.id, type="number", text="How many years of experience do you have?", order=4)
    db.add_all([f2_q1, f2_q2, f2_q3, f2_q4])
    db.commit()
    
    # Form 2 - Response 1
    f2_r1 = models.Response(id=str(uuid.uuid4()), form_id=form2.id)
    db.add(f2_r1)
    db.commit()
    db.refresh(f2_r1)
    db.add_all([
        models.Answer(id=str(uuid.uuid4()), response_id=f2_r1.id, question_id=f2_q1.id, value="alice@example.com"),
        models.Answer(id=str(uuid.uuid4()), response_id=f2_r1.id, question_id=f2_q2.id, value="AI/ML"),
        models.Answer(id=str(uuid.uuid4()), response_id=f2_r1.id, question_id=f2_q3.id, value="Yes"),
        models.Answer(id=str(uuid.uuid4()), response_id=f2_r1.id, question_id=f2_q4.id, value="5")
    ])

    # Form 2 - Response 2
    f2_r2 = models.Response(id=str(uuid.uuid4()), form_id=form2.id)
    db.add(f2_r2)
    db.commit()
    db.refresh(f2_r2)
    db.add_all([
        models.Answer(id=str(uuid.uuid4()), response_id=f2_r2.id, question_id=f2_q1.id, value="bob@example.com"),
        models.Answer(id=str(uuid.uuid4()), response_id=f2_r2.id, question_id=f2_q2.id, value="Frontend"),
        models.Answer(id=str(uuid.uuid4()), response_id=f2_r2.id, question_id=f2_q3.id, value="No"),
        models.Answer(id=str(uuid.uuid4()), response_id=f2_r2.id, question_id=f2_q4.id, value="2")
    ])
    db.commit()

    return {"message": "Database seeded successfully"}
