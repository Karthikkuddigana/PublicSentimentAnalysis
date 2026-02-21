from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    organization_name: str
    username: str
    email: EmailStr
    password: str