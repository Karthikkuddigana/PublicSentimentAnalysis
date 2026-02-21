from app.repositories.auth_repository import (
    create_auth_user,
    create_organization,
    create_user_profile
)

def signup_user(payload):

    try:
        # Step 1: Create Auth user
        user_id = create_auth_user(
            email=payload.email,
            password=payload.password
        )

        # Step 2: Create Organization
        organization_id = create_organization(
            name=payload.organization_name,
            email=payload.email
        )

        # Step 3: Create profile
        create_user_profile(
            user_id=user_id,
            organization_id=organization_id,
            username=payload.username
        )

        return {
            "message": "Signup successful",
            "user_id": user_id,
            "organization_id": organization_id
        }

    except Exception as e:
        raise Exception(f"Signup failed: {str(e)}")