from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.customer import Customer
from ..models.survey import SurveyCall


class CustomerService:
    @staticmethod
    def get_customer(db: Session, customer_id: int) -> Customer:
        customer = db.query(Customer).get(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    @staticmethod
    def create_survey_call(db: Session, customer_id: int, room_name: str, call_sid: str) -> SurveyCall:
        survey = SurveyCall(
            customer_id=customer_id,
            room_name=room_name,
            call_sid=call_sid,
            status="in-progress"
        )
        db.add(survey)
        db.commit()
        db.refresh(survey)
        return survey

customer_service = CustomerService() 