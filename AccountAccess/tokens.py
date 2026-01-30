import jwt
import os
import datetime
from datetime import timezone

refreshKey = os.getenv("REFRESH_KEY")
accessKey = os.getenv("ACCESS_KEY")

def generate_jwt(username):

    accessPayload = {"username": username, "exp": datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(minutes=30)}
    refreshPayload = {"username": username, "exp": datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(days = 1) }

    accessToken = jwt.encode(accessPayload, accessKey)
    refreshToken = jwt.encode(refreshPayload, refreshKey) 
    
    return accessToken, refreshToken

def get_access_token(refreshToken):

    try:
        refreshToken = jwt.decode(refreshToken, refreshKey, algorithms=["HS256"])
        accessPayload = {"username": refreshToken.get("username"), "exp": datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(minutes=30)}
        accessToken = jwt.encode(accessPayload, accessKey)
        return accessToken
    
    except (jwt.ExpiredSignatureError, jwt.DecodeError):
        return None



