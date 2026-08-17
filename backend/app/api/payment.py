from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import stripe
from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/payment", tags=["Payment"])

# Initialize Stripe API Key
stripe.api_key = settings.STRIPE_SECRET_KEY

class CheckoutSessionRequest(BaseModel):
    plan: str  # "pro" or "ultra"

class VerifySessionRequest(BaseModel):
    session_id: str

PLAN_PRICES = {
    "pro": {
        "name": "ResumeLegend Pro Plan",
        "amount": 500,  # $5.00 USD in cents
        "currency": "usd",
        "description": "Unlimited CVs, Premium Templates, AI CV Scoring & Flaw Diagnostics"
    },
    "ultra": {
        "name": "ResumeLegend Ultra Suite",
        "amount": 2500,  # $25.00 USD in cents
        "currency": "usd",
        "description": "Autonomous AI Refinement, Direct Natural Language Editing & Priority Rendering"
    }
}

@router.post("/create-checkout-session")
async def create_checkout_session(
    payload: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user)
):
    plan_key = payload.plan.lower()
    if plan_key not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan selected.")

    plan_info = PLAN_PRICES[plan_key]

    # If STRIPE_SECRET_KEY is not configured yet or empty, return simulated flag with graceful notice
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY.startswith("dummy"):
        return {
            "checkout_url": None,
            "simulated": True,
            "plan": plan_key,
            "message": "Stripe API key pending configuration in .env. Falling back to upgrade."
        }

    try:
        frontend_base = settings.FRONTEND_URL.rstrip("/")
        
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": plan_info["currency"],
                        "product_data": {
                            "name": plan_info["name"],
                            "description": plan_info["description"],
                        },
                        "unit_amount": plan_info["amount"],
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            customer_email=current_user.email if current_user.email else None,
            metadata={
                "user_id": current_user.id,
                "plan": plan_key
            },
            success_url=f"{frontend_base}/pricing?payment=success&session_id={{CHECKOUT_SESSION_ID}}&plan={plan_key}",
            cancel_url=f"{frontend_base}/pricing?payment=cancelled",
        )

        return {
            "checkout_url": session.url,
            "session_id": session.id,
            "simulated": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe Checkout error: {str(e)}")


@router.post("/verify-session")
async def verify_payment_session(
    payload: VerifySessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY.startswith("dummy"):
        current_user.plan = "pro"
        db.commit()
        db.refresh(current_user)
        return {"status": "success", "plan": current_user.plan, "user_id": current_user.id}

    try:
        session = stripe.checkout.Session.retrieve(payload.session_id)
        if session.payment_status in ["paid", "complete"]:
            target_plan = session.metadata.get("plan", "pro")
            current_user.plan = target_plan
            db.commit()
            db.refresh(current_user)
            return {
                "status": "success",
                "plan": current_user.plan,
                "user_id": current_user.id,
                "username": current_user.username,
                "email": current_user.email
            }
        else:
            raise HTTPException(status_code=400, detail="Payment has not been completed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")
