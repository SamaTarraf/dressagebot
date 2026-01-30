from flask import Flask, request, jsonify, make_response 
from flask_cors import CORS
import jwt.exceptions
from BotCode.Bot import generate_text
from AccountAccess.signUp import create_Account
from AccountAccess.logIn import verify_account, verify_username
from AccountAccess.tokens import generate_jwt, get_access_token
import jwt
import os
from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url,key)

refreshKey = os.getenv("REFRESH_KEY")
accessKey = os.getenv("ACCESS_KEY")

app = Flask(__name__,template_folder="templates")
CORS(app, supports_credentials=True)


@app.route("/bot", methods=['POST'])
def bot():
    question = request.json['query']
    #return(jsonify({'text' : generate_text(question)}))

    return(jsonify({'text' : 'I am the bot'}))

@app.route("/signUp", methods=['POST'])
def signUp():
    username = request.json['user']
    password = request.json['password']
    password = password.encode()

    return(jsonify({'isAccountCreated': create_Account(username, password)}))

@app.route("/logIn", methods=['POST'])
def logIn():
    username = request.json['user']
    password = request.json['password']
    password = password.encode()

    isUsernameExisting = verify_username(username)
    isPasswordVerified = False
    if(isUsernameExisting==True):
        isPasswordVerified = verify_account(username, password)

    return(jsonify({'isUsernameExisting': isUsernameExisting, 'isPasswordVerified': isPasswordVerified}))

@app.route("/logOut", methods=['DELETE'])
def logout():
    response = make_response("Logged out")
    response.set_cookie('accessToken', '', expires=0)
    response.set_cookie('refreshToken', '', expires=0)
    return response

@app.route("/initializeSession", methods=['POST'])
def initializeSession():
    username = request.json['user']
    accessToken, refreshToken = generate_jwt(username)
    response = make_response("Login Successful")
    response.set_cookie(key="refreshToken", value=refreshToken, httponly=True, secure=True, samesite="Strict", max_age=1 * 24 * 60 * 60)
    response.set_cookie(key="accessToken", value=accessToken, httponly=True, secure=True, samesite="Lax", max_age=30 * 60)
    return response

@app.route("/authenticate", methods=['POST'])
def authenticate():
    accessToken = request.cookies.get("accessToken")

    try:
        accessToken = jwt.decode(accessToken, accessKey, algorithms=["HS256"])
        username = accessToken.get("username")

        return(jsonify({"isTokenValid":True, "username": username}))
    
    except (jwt.ExpiredSignatureError, jwt.DecodeError):
        refreshToken = request.cookies.get("refreshToken")
        accessToken = get_access_token(refreshToken)

        if(accessToken==None):
            return(jsonify({"isTokenValid":False, "error": "Invalid token"}))
        
        else:
            username = jwt.decode(accessToken, accessKey, algorithms=["HS256"]).get("username")
            response = make_response(jsonify({"isTokenValid":True, "username": username}))
            response.set_cookie(key="accessToken", value=accessToken, httponly=True, secure=True, samesite="Lax", max_age=30 * 60)
            return response
    
@app.route("/createChat", methods=['POST'])
def createChat():
    title = request.json['title']
    username = request.json['user']

    account = supabase.table("accounts").select("*").eq("username", username).execute()
    
    userid = account.data[0].get('user_id')
    
    response = supabase.table("chats").select("chat_id").order("created_at", desc=True).limit(1).execute()
    if(response.data==[]):
        id = 1
    else:
        id = response.data[0].get('chat_id')+1

    
    supabase.table("chats").insert({"chat_id": id, "user_id": userid, "title": title}).execute()
    return jsonify({"isChatCreated": True})
    
@app.route("/listChats", methods=['POST'])
def listChats():
    username = request.json['user']
    
    account = supabase.table("accounts").select("*").eq("username", username).execute()
    
    userid = account.data[0].get('user_id')

    chats = supabase.table("chats").select("title").eq("user_id", userid).execute()
    
    titles = [chat["title"] for chat in chats.data]

    return jsonify({'chats': titles})
    
@app.route("/saveMessage", methods=['POST'])
def saveMessages():
    username = request.json['username']
    title = request.json['title']
    sender = request.json['sender']
    message = request.json['message']

    account = supabase.table("accounts").select("*").eq("username", username).execute()
    userid = account.data[0].get('user_id')

    chats = supabase.table("chats").select("*").eq("user_id", userid).eq("title", title).execute()
    chatid = chats.data[0].get('chat_id')

    response = supabase.table("messages").select("messages_id").order("created_at", desc=True).execute()
    if(response.data==[]):
        id = 1
    else:
        id = response.data[0].get('messages_id')+1

    supabase.table("messages").insert({"messages_id": id, "chat_id": chatid, "sender": sender, "message": message}).execute()

    messages = supabase.table("messages").select("*").eq("chat_id", chatid).order("created_at", desc=False).execute()

    messagesArray = [{"sender": msg["sender"], "message": msg["message"]} for msg in messages.data]

    return(jsonify({'history': messagesArray}))






if __name__ == '__main__':
    app.run(debug=True, port=5000)
