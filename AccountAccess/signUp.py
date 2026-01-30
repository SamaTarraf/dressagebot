import os
import bcrypt
from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url,key)


def create_Account(username, password):


    account = supabase.table("accounts").select("*").eq("username", username).execute()

    ##check if username already exists
    if(account.data!=[]):
        return False

    salt = bcrypt.gensalt()

    ##insert account to the table with a new id
    response = supabase.table("accounts").select("user_id").order("created_at", desc=True).limit(1).execute()
    if(response.data==[]):
        id = 1
    else:
        id = response.data[0].get('user_id')+1

    supabase.table("accounts").insert({"user_id": id, "username": username, "password": bcrypt.hashpw(password,salt).decode()}).execute()

    return True
